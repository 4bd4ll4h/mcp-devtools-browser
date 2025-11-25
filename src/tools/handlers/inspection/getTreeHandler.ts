import { BrowserManager } from "../../../browser/BrowserManager.js";
import { GetTreeArgs, GetTreeResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function getTreeHandler(args: GetTreeArgs): Promise<GetTreeResult> {
  const { pageId, includeHidden = false } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();
  const page = browserManager.getPage(pageId);

  if (!page) {
    throw new Error(`Page with ID ${pageId} not found`);
  }

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'get_tree', args);

  try {
    // Get page metadata
    const url = page.url();
    const title = await page.title().catch(() => null);

    // Get interactive DOM tree with selectors
    const interactiveTree = await page.evaluate(async (includeHidden) => {
      // Generate shortest unique CSS selector for an element relative to parent
      function generateShortSelector(element: Element, parentSelector?: string): string {
        // Priority 1: ID selector (shortest and unique)
        if (element.id) {
          return `#${element.id}`;
        }

        // Priority 2: Build minimal selector for this element
        let elementSelector = element.tagName.toLowerCase();

        // Helper function to check if two elements have the same classes (order-independent)
        function hasSameClasses(el1: Element, el2: Element): boolean {
          const classes1 = new Set(String(el1.className || '').trim().split(/\s+/));
          const classes2 = new Set(String(el2.className || '').trim().split(/\s+/));
          return classes1.size === classes2.size &&
                 [...classes1].every(cls => classes2.has(cls));
        }

        // Add class names only if they help make selector unique and shorter
        let classNameString = '';
        try {
          classNameString = String(element.className || '');
        } catch (e) {
          classNameString = '';
        }

        if (classNameString && classNameString.trim()) {
          const classes = classNameString.trim().split(/\s+/);

          // Only add classes if they help distinguish from siblings
          const parent = element.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children) as Element[];
            const sameTagSiblings = siblings.filter(
              (child: Element) => child.tagName === element.tagName
            );

            if (sameTagSiblings.length > 1) {
              // Try to find the shortest class combination that makes it unique
              let shortestUniqueClass = '';

              // First try single class
              for (const cls of classes) {
                const sameClassSiblings = sameTagSiblings.filter(
                  (child: Element) => child.className.includes(cls)
                );
                if (sameClassSiblings.length === 1) {
                  shortestUniqueClass = cls;
                  break;
                }
              }

              if (shortestUniqueClass) {
                elementSelector += '.' + shortestUniqueClass;
              } else {
                // If no single class works, use all classes
                elementSelector += '.' + classes.join('.');
              }
            }
          }
        }

        // Add attributes only if they help make selector unique and shorter than positional
        const parent = element.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children) as Element[];
          const sameSelectorSiblings = siblings.filter(
            (child: Element) => {
              if (child.tagName !== element.tagName) return false;

              // If we have classes in selector, check if classes match (order-independent)
              if (elementSelector.includes('.')) {
                if (!hasSameClasses(child, element)) return false;
              }

              return true;
            }
          );

          // If we have multiple elements with same base selector, add distinguishing features
          if (sameSelectorSiblings.length > 1) {
            // Try attributes first (usually shorter than nth-child)
            let attributeSelector = '';

            if (element.hasAttribute('name')) {
              attributeSelector = `[name="${element.getAttribute('name')}"]`;
            } else if (element.hasAttribute('type')) {
              attributeSelector = `[type="${element.getAttribute('type')}"]`;
            } else if (element.hasAttribute('role')) {
              attributeSelector = `[role="${element.getAttribute('role')}"]`;
            }

            // Only use attribute if it makes selector unique
            if (attributeSelector) {
              const testSelector = elementSelector + attributeSelector;
              const matchingElements = document.querySelectorAll(testSelector);
              if (matchingElements.length === 1 && matchingElements[0] === element) {
                elementSelector += attributeSelector;
              } else {
                // Attribute didn't make it unique, fall back to positional
                // Use original DOM order for accurate nth-child calculation
                const index = Array.from(parent.children).indexOf(element) + 1;
                elementSelector += `:nth-child(${index})`;
              }
            } else {
              // No useful attributes, use positional
              // Use original DOM order for accurate nth-child calculation
              const index = Array.from(parent.children).indexOf(element) + 1;
              elementSelector += `:nth-child(${index})`;
            }
          }
        }

        // If we have a parent selector, combine with it for uniqueness
        // But only if it makes the selector shorter or more reliable
        if (parentSelector) {
          // Check if the element selector alone is unique
          const isElementUnique = document.querySelectorAll(elementSelector).length === 1;

          if (!isElementUnique) {
            return `${parentSelector} > ${elementSelector}`;
          }
        }

        return elementSelector;
      }

      // Check if element has event listeners using DOMDebugger
      async function hasEventListeners(element: Element): Promise<boolean> {
        let hasListeners = false;

        try {
          // Use DOMDebugger.getEventListeners to check for registered event listeners
          const listeners = await (window as any).getEventListeners?.(element);
          if (listeners) {
            // Check if there are any event listeners
            hasListeners = Object.keys(listeners).some(eventType =>
              listeners[eventType] && listeners[eventType].length > 0
            );
          }
        } catch (error) {
          // If DOMDebugger is not available, fall back to basic checks
          console.warn('DOMDebugger.getEventListeners not available:', error);
        } finally {
          // Cleanup: Ensure any DOMDebugger resources are released
          // This helps prevent memory leaks when using DevTools Protocol
          if (typeof (window as any).cleanupEventListeners === 'function') {
            try {
              (window as any).cleanupEventListeners(element);
            } catch (cleanupError) {
              // Ignore cleanup errors
            }
          }
        }

        // If we didn't find listeners via DOMDebugger, fallback to attribute checks
        if (!hasListeners) {
          hasListeners = element.hasAttribute('onclick') ||
                         element.hasAttribute('onchange') ||
                         element.hasAttribute('onsubmit') ||
                         element.hasAttribute('oninput') ||
                         element.hasAttribute('onkeydown') ||
                         element.hasAttribute('onkeyup') ||
                         element.hasAttribute('onfocus') ||
                         element.hasAttribute('onblur');
        }

        return hasListeners;
      }

      // Check if element is interactive
      async function isInteractive(element: Element): Promise<boolean> {
        const interactiveTags = [
          'a', 'button', 'input', 'select', 'textarea', 'details',
          'menu', 'menuitem', 'summary', 'video', 'audio', 'iframe'
        ];
        const tag = element.tagName.toLowerCase();

        return interactiveTags.includes(tag) ||
               await hasEventListeners(element);
      }

      // Check if element is focusable
      function isFocusable(element: Element): boolean {
        const focusableTags = [
          'a', 'button', 'input', 'select', 'textarea', 'iframe',
          'video', 'audio', 'object', 'embed', 'area', 'summary'
        ];
        const tag = element.tagName.toLowerCase();

        return focusableTags.includes(tag) ||
               element.hasAttribute('tabindex') ||
               element.hasAttribute('contenteditable');
      }

      // Check if element has ARIA attributes
      function hasAria(element: Element): boolean {
        for (const attr of element.attributes) {
          if (attr.name.startsWith('aria-') || attr.name === 'role') {
            return true;
          }
        }
        return false;
      }

      // Check if element is visible
      function isVisible(element: Element): boolean {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               style.opacity !== '0' &&
               element.getAttribute('aria-hidden') !== 'true';
      }

   
      // Get element role
      function getElementRole(element: Element): string {
        const explicitRole = element.getAttribute('role');
        if (explicitRole) return explicitRole;

        const tag = element.tagName.toLowerCase();
        const implicitRoles: Record<string, string> = {
          'button': 'button',
          'a': 'link',
          'input': element.getAttribute('type') === 'checkbox' ? 'checkbox' :
                   element.getAttribute('type') === 'radio' ? 'radio' : 'textbox',
          'select': 'combobox',
          'textarea': 'textbox',
          'img': 'img',
          'h1': 'heading', 'h2': 'heading', 'h3': 'heading',
          'h4': 'heading', 'h5': 'heading', 'h6': 'heading',
          'nav': 'navigation',
          'main': 'main',
          'header': 'banner',
          'footer': 'contentinfo',
          'aside': 'complementary',
          'article': 'article',
          'section': 'region',
          'ul': 'list', 'ol': 'list',
          'li': 'listitem',
          'table': 'table',
          'th': 'columnheader',
          'td': 'cell'
        };

        return implicitRoles[tag] || 'generic';
      }

      // Extract relevant attributes
      function extractAttributes(element: Element): Record<string, string> {
        const attributes: Record<string, string> = {};
        const relevantAttrs = [
          'id', 'class', 'name', 'href', 'type', 'value', 'placeholder',
          'alt', 'title', 'role', 'aria-label', 'aria-describedby',
          'aria-hidden', 'aria-expanded', 'aria-selected', 'aria-checked',
          'tabindex', 'disabled', 'readonly', 'required'
        ];

        for (const attr of element.attributes) {
          if (relevantAttrs.includes(attr.name) || attr.name.startsWith('aria-') || attr.name.startsWith('data-')) {
            attributes[attr.name] = attr.value;
          }
        }

        return attributes;
      }

      // Get bounding box as array [x, y, width, height]
      function getBoundingBox(element: Element): number[] {
        const rect = element.getBoundingClientRect();
        return [
          Math.round(rect.x),
          Math.round(rect.y),
          Math.round(rect.width),
          Math.round(rect.height)
        ];
      }

      // Check if element has direct inline text
      function hasDirectText(element: Element): boolean {
        // Check if element has direct text content (not from children)
        for (const child of element.childNodes) {
          if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            return true;
          }
        }
        return false;
      }

      // Check if element should be included in tree based on new rules
      async function shouldIncludeInTree(element: Element, hasIncludedChildren: boolean): Promise<boolean> {
        
        if (includeHidden === false && !isVisible(element)){
          return false;
        }
        
        // Rule 1: Node has children (that are included in tree)
        if (hasIncludedChildren) {
          return true;
        }

        // Rule 2: Node has a value or direct inline text
        const hasValue = element.getAttribute('value') ||
                        (element as HTMLInputElement).value ||
                        (element as HTMLTextAreaElement).value;
        if (hasValue || hasDirectText(element)) {
          return true;
        }

        // Rule 3: Node is interactive
        if (await isInteractive(element)) {
          return true;
        }

        return false;
      }

      // Main tree extraction function with parent selector passing
      async function extractInteractiveTree(element: Element, parentSelector?: string): Promise<any> {
        const children: any[] = [];
        const currentSelector = generateShortSelector(element, parentSelector);

        // Process children first to preserve structure
        for (const child of element.children) {
          const childNode = await extractInteractiveTree(child, currentSelector);
          if (childNode) {
            children.push(childNode);
          }
        }

        // Check if this element should be included based on new rules
        const hasIncludedChildren = children.length > 1;
        const shouldInclude = await shouldIncludeInTree(element, hasIncludedChildren);

        // Only include node if it meets one of the three conditions
        if (shouldInclude) {
          const node: any = {
            tag: element.tagName.toLowerCase(),
            //role: getElementRole(element),
            //attributes: extractAttributes(element),
            selectors: {
              css: currentSelector
            },
            //isInteractive: await isInteractive(element),
            //isFocusable: isFocusable(element),
            //isVisible: includeHidden == false ? isVisible(element): undefined,
            //hasAria: hasAria(element),
            boundingBox: getBoundingBox(element)
          };

          // Add name from various sources
          const name = element.getAttribute('aria-label') ||
                       element.getAttribute('title') ||
                       (element as HTMLInputElement).placeholder ||
                       (element as HTMLImageElement).alt;
          if (name) node.name = name;

          // Add value for form elements - only include appropriate values
          let value = '';

          // For form elements, use their actual value
          if ((element as HTMLInputElement).value !== undefined) {
            value = (element as HTMLInputElement).value || '';
          }else {
            for (const child of element.childNodes){
              if (child.nodeType === Node.TEXT_NODE){
                value += child.textContent?.trim() || '';
              }
            }
          }
          

          if (value) node.value = value.substring(0, 50) + (value.length >50 ? '...' : '');

          // Add children if any
          if (children.length > 0) {
            node.children = children;
          }

          return node;
        } else{
          if (children.length ==1){
            return children[0]
          }
        }

        return null;
      }

      return await extractInteractiveTree(document.documentElement);
    }, includeHidden);

    const result = {
      pageId,
      url,
      title,
      tree: interactiveTree,
    };

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'get_tree', {
      pageId,
      url,
      title,
      treeSize: interactiveTree ? 'has_tree' : 'empty_tree'
    }, executionTime);

    return result;
  } catch (err: any) {
    const executionTime = Date.now() - startTime;

    // Record tool error event
    await browserManagerExtensions.recordToolError(pageId, 'get_tree', err, executionTime);

    console.error(`❌ Failed to get tree for page ${pageId}:`, err.message);
    throw new Error(`Failed to get page tree: ${err.message}`);
  }
}