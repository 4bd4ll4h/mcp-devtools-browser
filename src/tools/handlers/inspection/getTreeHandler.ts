import { BrowserManager } from "../../../browser/BrowserManager.js";
import { GetTreeArgs, GetTreeResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function getTreeHandler(args: GetTreeArgs): Promise<GetTreeResult> {
  const { pageId, maxDepth = 10, includeHidden = false } = args;

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
    const interactiveTree = await page.evaluate((maxDepth, includeHidden) => {
      // Generate CSS selector for an element
      function generateCssSelector(element: Element): string {
        // Always prefer ID selector - it's unique
        if (element.id) {
          return `#${element.id}`;
        }

        // Build selector with parent context for better uniqueness
        let selector = '';
        let currentElement: Element | null = element;
        const maxDepth = 3; // Limit selector depth to prevent overly long selectors
        let depth = 0;

        while (currentElement && depth < maxDepth) {
          let elementSelector = currentElement.tagName.toLowerCase();

          // Add class names if available
          let classNameString = '';
          try {
            classNameString = String(currentElement.className || '');
          } catch (e) {
            classNameString = '';
          }

          if (classNameString && classNameString.trim()) {
            const classes = classNameString.trim().split(/\s+/);
            elementSelector += '.' + classes.join('.');
          }

          // Add nth-of-type for better specificity
          const parent: Element | null = currentElement.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children) as Element[];
            const sameTypeSiblings = siblings.filter(
              (child: Element) => child.tagName === currentElement!.tagName
            );
            if (sameTypeSiblings.length > 1) {
              const index = sameTypeSiblings.indexOf(currentElement) + 1;
              elementSelector += `:nth-of-type(${index})`;
            }
          }

          // Add attributes for additional specificity
          if (currentElement.hasAttribute('name')) {
            elementSelector += `[name="${currentElement.getAttribute('name')}"]`;
          } else if (currentElement.hasAttribute('type')) {
            elementSelector += `[type="${currentElement.getAttribute('type')}"]`;
          } else if (currentElement.hasAttribute('role')) {
            elementSelector += `[role="${currentElement.getAttribute('role')}"]`;
          }

          // Prepend to build selector from element up to root
          selector = selector ? elementSelector + ' > ' + selector : elementSelector;

          // Move to parent
          currentElement = parent;
          depth++;

          // Stop if we reach body or html
          if (currentElement && (currentElement.tagName === 'BODY' || currentElement.tagName === 'HTML')) {
            break;
          }
        }

        return selector;
      }

      // Check if element is interactive
      function isInteractive(element: Element): boolean {
        const interactiveTags = [
          'a', 'button', 'input', 'select', 'textarea', 'details',
          'menu', 'menuitem', 'summary', 'video', 'audio', 'iframe'
        ];
        const tag = element.tagName.toLowerCase();

        return interactiveTags.includes(tag) ||
               element.hasAttribute('onclick') ||
               element.hasAttribute('onchange') ||
               element.hasAttribute('onsubmit');
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

      // Check if element should be included
      function shouldIncludeElement(element: Element): boolean {
        const meetsCriteria = isInteractive(element) || isFocusable(element) || hasAria(element);
        return includeHidden ? meetsCriteria : (meetsCriteria && isVisible(element));
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

      // Get bounding box
      function getBoundingBox(element: Element) {
        const rect = element.getBoundingClientRect();
        return {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      }

      // Main tree extraction function
      function extractInteractiveTree(element: Element, depth: number, maxDepth: number): any {
        if (depth > maxDepth) return null;

        const shouldInclude = shouldIncludeElement(element);
        const children: any[] = [];

        // Process children first to preserve structure
        for (const child of element.children) {
          const childNode = extractInteractiveTree(child, depth + 1, maxDepth);
          if (childNode) {
            children.push(childNode);
          }
        }

        // If this element should be included or has included children
        if (shouldInclude || children.length > 0) {
          const node: any = {
            tag: element.tagName.toLowerCase(),
            role: getElementRole(element),
            attributes: extractAttributes(element),
            selectors: {
              css: generateCssSelector(element)
            },
            isInteractive: isInteractive(element),
            isFocusable: isFocusable(element),
            hasAria: hasAria(element),
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
          }
          // For buttons, links, and headings, include their visible text (but limit length)
          else if (['button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'span'].includes(element.tagName.toLowerCase())) {
            const text = element.textContent?.trim() || '';
            // Only include short text content (max 100 chars to avoid huge values)
            if (text && text.length <= 100) {
              value = text;
            }
          }

          if (value) node.value = value;

          // Add children if any
          if (children.length > 0) {
            node.children = children;
          }

          return node;
        }

        return null;
      }

      return extractInteractiveTree(document.documentElement, 0, maxDepth);
    }, maxDepth, includeHidden);

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