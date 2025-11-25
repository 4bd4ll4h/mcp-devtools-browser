import { BrowserManager } from "../../browser/BrowserManager.js";
import { GetDomArgs, GetDomResult } from "../../schema/resourcesSchema.js";
import { browserManagerExtensions } from "../../tools/toolsRegister.js";

export async function getDomHandler(args: GetDomArgs): Promise<GetDomResult> {
  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();
  const page = browserManager.getPage(args.pageId);

  // Record resource invocation event
  await browserManagerExtensions.recordToolInvocation(args.pageId, 'get_dom', args);

  // Get current page info
  const url = page.url();
  const title = await page.title();

  // Get DOM for specific element(s) - selector is now required
  const elements = await page.$$(args.selector);
  if (elements.length === 0) {
    throw new Error(`No elements found with selector "${args.selector}"`);
  }

  let dom: any;
  let elementCount = 0;

  // If multiple elements found, return array of DOM trees
  if (elements.length > 1) {
    dom = await page.evaluate(
      (selector, depth, includeAttributes, includeText, includeFullText) => {
        function serializeElement(element: any, currentDepth: number, includeAttributes: boolean, includeText: boolean, includeFullText: boolean): any {
          if (currentDepth <= 0) {
            return null; // Stop recursion when depth limit reached
          }

          const serialized: any = {};
          serialized.tagName = element.tagName.toLowerCase();
          serialized.nodeType = element.nodeType;

          // Include element ID if present
          if (element.id) {
            serialized.id = element.id;
          }

          // Include classes if present
          const classList = element.classList;
          if (classList && classList.length > 0) {
            serialized.classes = Array.from(classList);
          }

          // Include attributes if requested
          if (includeAttributes) {
            const attributes: Record<string, string> = {};
            const attrs = element.attributes;
            for (let i = 0; i < attrs.length; i++) {
              const attr = attrs[i];
              attributes[attr.name] = attr.value;
            }
            if (Object.keys(attributes).length > 0) {
              serialized.attributes = attributes;
            }
          }

          // Include text content if requested and available - following get_tree behavior
          if (includeText) {
            // Check if element has direct text content (not from children)
            let directText = '';
            for (const child of element.childNodes) {
              if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
                directText += child.textContent.trim() + ' ';
              }
            }

            if (directText.trim()) {
              const text = directText.trim();
              // Apply length limits unless includeFullText is true
              if (includeFullText) {
                serialized.text = text;
              } else {
                serialized.text = text.substring(0, 50) + (text.length > 50 ? '...' : '');
              }
            }
          }

          // Always include children (remove includeChildren parameter)
          if (element.children && element.children.length > 0) {
            const children: any[] = [];
            for (let i = 0; i < element.children.length; i++) {
              const child = element.children[i];
              const serializedChild = serializeElement(
                child,
                currentDepth - 1,
                includeAttributes,
                includeText,
                includeFullText
              );
              if (serializedChild) {
                children.push(serializedChild);
              }
            }
            if (children.length > 0) {
              serialized.children = children;
            }
          }

          return serialized;
        }

        const elements = document.querySelectorAll(selector);
        const results: any[] = [];

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          results.push(
            serializeElement(element, depth, includeAttributes, includeText, includeFullText)
          );
        }

        return results;
      },
      args.selector,
      args.depth,
      args.includeAttributes,
      args.includeText,
      args.includeFullText
    );
    elementCount = elements.length;
  } else {
    // Single element found
    dom = await page.evaluate(
      (selector, depth, includeAttributes, includeText, includeFullText) => {
        function serializeElement(element: any, currentDepth: number, includeAttributes: boolean, includeText: boolean, includeFullText: boolean): any {
          if (currentDepth <= 0) {
            return null; // Stop recursion when depth limit reached
          }

          const serialized: any = {};
          serialized.tagName = element.tagName.toLowerCase();
          serialized.nodeType = element.nodeType;

          // Include element ID if present
          if (element.id) {
            serialized.id = element.id;
          }

          // Include classes if present
          const classList = element.classList;
          if (classList && classList.length > 0) {
            serialized.classes = Array.from(classList);
          }

          // Include attributes if requested
          if (includeAttributes) {
            const attributes: Record<string, string> = {};
            const attrs = element.attributes;
            for (let i = 0; i < attrs.length; i++) {
              const attr = attrs[i];
              attributes[attr.name] = attr.value;
            }
            if (Object.keys(attributes).length > 0) {
              serialized.attributes = attributes;
            }
          }

          // Include text content if requested and available - following get_tree behavior
          if (includeText) {
            // Check if element has direct text content (not from children)
            let directText = '';
            for (const child of element.childNodes) {
              if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
                directText += child.textContent.trim() + ' ';
              }
            }

            if (directText.trim()) {
              const text = directText.trim();
              // Apply length limits unless includeFullText is true
              if (includeFullText) {
                serialized.text = text;
              } else {
                serialized.text = text.substring(0, 50) + (text.length > 50 ? '...' : '');
              }
            }
          }

          // Always include children (remove includeChildren parameter)
          if (element.children && element.children.length > 0) {
            const children: any[] = [];
            for (let i = 0; i < element.children.length; i++) {
              const child = element.children[i];
              const serializedChild = serializeElement(
                child,
                currentDepth - 1,
                includeAttributes,
                includeText,
                includeFullText
              );
              if (serializedChild) {
                children.push(serializedChild);
              }
            }
            if (children.length > 0) {
              serialized.children = children;
            }
          }

          return serialized;
        }

        const element = document.querySelector(selector);
        if (!element) return null;

        return serializeElement(element, depth, includeAttributes, includeText, includeFullText);
      },
      args.selector,
      args.depth,
      args.includeAttributes,
      args.includeText,
      args.includeFullText
    );
    elementCount = 1;
  }

  const result = {
    pageId: args.pageId,
    url,
    title,
    dom,
    selector: args.selector,
    elementCount,
  };

  const executionTime = Date.now() - startTime;

  // Record resource result event
  await browserManagerExtensions.recordToolResult(args.pageId, 'get_dom', {
    pageId: args.pageId,
    url,
    title,
    selector: args.selector,
    depth: args.depth,
    elementCount,
    includeAttributes: args.includeAttributes,
    includeText: args.includeText,
    includeFullText: args.includeFullText
  }, executionTime);

  return result;
}