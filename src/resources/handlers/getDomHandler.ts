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

  let dom: any;
  let elementCount = 0;

  if (args.selector) {
    // Get DOM for specific element(s)
    const elements = await page.$$(args.selector);
    if (elements.length === 0) {
      throw new Error(`No elements found with selector "${args.selector}"`);
    }

    // If multiple elements found, return array of DOM trees
    if (elements.length > 1) {
      dom = await page.evaluate(
        (selector, includeAttributes, includeText, includeChildren) => {
          function serializeElement(element: any, includeAttributes: boolean, includeText: boolean, includeChildren: boolean) {
            const serialized: any = {};
            // @ts-ignore
            serialized.tagName = element.tagName.toLowerCase();
            // @ts-ignore
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

            // Include text content if requested and available
            if (includeText && element.textContent && element.textContent.trim()) {
              // Smart text filtering: only include text from meaningful elements
              const tagName = element.tagName.toLowerCase();
              const text = element.textContent.trim();

              // Elements that should always include text (with length limits)
              const meaningfulTextElements = [
                'button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'label', 'span', 'p', 'li', 'td', 'th', 'div', 'section', 'article'
              ];

              // Elements that should NEVER include text content
              const excludeTextElements = ['script', 'style', 'noscript', 'template'];

              if (!excludeTextElements.includes(tagName) &&
                  (meaningfulTextElements.includes(tagName) || text.length <= 200)) {
                serialized.text = text;
              }
            }

            // Include children if requested and available
            if (includeChildren && element.children && element.children.length > 0) {
              const children: any[] = [];
              for (let i = 0; i < element.children.length; i++) {
                const child = element.children[i];
                const serializedChild = serializeElement(
                  child,
                  includeAttributes,
                  includeText,
                  includeChildren
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
              serializeElement(element, includeAttributes, includeText, includeChildren)
            );
          }

          return results;
        },
        args.selector,
        args.includeAttributes,
        args.includeText,
        args.includeChildren
      );
      elementCount = elements.length;
    } else {
      // Single element found
      dom = await page.evaluate(
        (selector, includeAttributes, includeText, includeChildren) => {
          function serializeElement(element: any, includeAttributes: boolean, includeText: boolean, includeChildren: boolean) {
            const serialized: any = {};
            // @ts-ignore
            serialized.tagName = element.tagName.toLowerCase();
            // @ts-ignore
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

            // Include text content if requested and available
            if (includeText && element.textContent && element.textContent.trim()) {
              // Smart text filtering: only include text from meaningful elements
              const tagName = element.tagName.toLowerCase();
              const text = element.textContent.trim();

              // Elements that should always include text (with length limits)
              const meaningfulTextElements = [
                'button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'label', 'span', 'p', 'li', 'td', 'th', 'div', 'section', 'article'
              ];

              // Elements that should NEVER include text content
              const excludeTextElements = ['script', 'style', 'noscript', 'template'];

              if (!excludeTextElements.includes(tagName) &&
                  (meaningfulTextElements.includes(tagName) || text.length <= 200)) {
                serialized.text = text;
              }
            }

            // Include children if requested and available
            if (includeChildren && element.children && element.children.length > 0) {
              const children: any[] = [];
              for (let i = 0; i < element.children.length; i++) {
                const child = element.children[i];
                const serializedChild = serializeElement(
                  child,
                  includeAttributes,
                  includeText,
                  includeChildren
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

          return serializeElement(element, includeAttributes, includeText, includeChildren);
        },
        args.selector,
        args.includeAttributes,
        args.includeText,
        args.includeChildren
      );
      elementCount = 1;
    }
  } else {
    // Get entire document DOM
    dom = await page.evaluate(
      (includeAttributes, includeText, includeChildren) => {
        function serializeElement(element: any, includeAttributes: boolean, includeText: boolean, includeChildren: boolean) {
          const serialized = {
            tagName: element.tagName.toLowerCase(),
            nodeType: element.nodeType,
          };

          // Include element ID if present
          if (element.id) {
            // @ts-ignore
            serialized['id'] = element.id;
          }

          // Include classes if present
          const classList = element.classList;
          if (classList && classList.length > 0) {
            // @ts-ignore
            serialized['classes'] = Array.from(classList);
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
              // @ts-ignore
              serialized['attributes'] = attributes;
            }
          }

          // Include text content if requested and available
          if (includeText && element.textContent && element.textContent.trim()) {
            // @ts-ignore
            serialized['text'] = element.textContent.trim();
          }

          // Include children if requested and available
          if (includeChildren && element.children && element.children.length > 0) {
            const children: any[] = [];
            for (let i = 0; i < element.children.length; i++) {
              const child = element.children[i];
              const serializedChild = serializeElement(
                child,
                includeAttributes,
                includeText,
                includeChildren
              );
              if (serializedChild) {
                children.push(serializedChild);
              }
            }
            if (children.length > 0) {
              // @ts-ignore
              serialized['children'] = children;
            }
          }

          return serialized;
        }

        return serializeElement(document.documentElement, includeAttributes, includeText, includeChildren);
      },
      args.includeAttributes,
      args.includeText,
      args.includeChildren
    );

    // Count elements in the entire document
    elementCount = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });
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
    elementCount,
    includeAttributes: args.includeAttributes,
    includeText: args.includeText,
    includeChildren: args.includeChildren
  }, executionTime);

  return result;
}