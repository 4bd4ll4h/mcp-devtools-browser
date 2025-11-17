import { BrowserManager } from "../../browser/BrowserManager.js";
import { GetCssArgs, GetCssResult } from "../../schema/resourcesSchema.js";
import { browserManagerExtensions } from "../../tools/toolsRegister.js";

export async function getCssHandler(args: GetCssArgs): Promise<GetCssResult> {
  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();
  const page = browserManager.getPage(args.pageId);

  // Record resource invocation event
  await browserManagerExtensions.recordToolInvocation(args.pageId, 'get_css', args);

  // Get current page info
  const url = page.url();
  const title = await page.title();

  let css = "";
  let styles: Record<string, string> | undefined;

  if (args.selector) {
    // Get CSS for specific element
    const element = await page.$(args.selector);
    if (!element) {
      throw new Error(`Element with selector "${args.selector}" not found`);
    }

    // Get computed styles for the element if requested
    if (args.includeComputed) {
      styles = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element) return {};

        const computedStyles = window.getComputedStyle(element);
        const styleObj: Record<string, string> = {};

        // Get all computed CSS properties
        for (let i = 0; i < computedStyles.length; i++) {
          const property = computedStyles[i];
          styleObj[property] = computedStyles.getPropertyValue(property);
        }

        return styleObj;
      }, args.selector);
    }

    // Get CSS rules that apply to this element
    css = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element) return "";

      const cssRules: string[] = [];

      // Get all stylesheets
      const styleSheets = document.styleSheets;
      for (let i = 0; i < styleSheets.length; i++) {
        const sheet = styleSheets[i];
        try {
          const rules = sheet.cssRules || sheet.rules;
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            if (rule instanceof CSSStyleRule) {
              // Check if this rule applies to the element
              if (element.matches(rule.selectorText)) {
                cssRules.push(rule.cssText);
              }
            }
          }
        } catch (e) {
          // Skip stylesheets that can't be accessed due to CORS
          continue;
        }
      }

      return cssRules.join('\n');
    }, args.selector);
  } else {
    // Get all CSS from the entire document
    css = await page.evaluate(() => {
      const cssRules: string[] = [];

      // Get all stylesheets
      const styleSheets = document.styleSheets;
      for (let i = 0; i < styleSheets.length; i++) {
        const sheet = styleSheets[i];
        try {
          const rules = sheet.cssRules || sheet.rules;
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            cssRules.push(rule.cssText);
          }
        } catch (e) {
          // Skip stylesheets that can't be accessed due to CORS
          continue;
        }
      }

      return cssRules.join('\n');
    });

    // Get computed styles for the document if requested
    if (args.includeComputed) {
      styles = await page.evaluate(() => {
        const computedStyles = window.getComputedStyle(document.documentElement);
        const styleObj: Record<string, string> = {};

        // Get common computed CSS properties for the document
        const commonProperties = [
          'font-family', 'font-size', 'color', 'background-color',
          'margin', 'padding', 'width', 'height', 'display',
          'position', 'top', 'left', 'right', 'bottom'
        ];

        for (const property of commonProperties) {
          styleObj[property] = computedStyles.getPropertyValue(property);
        }

        return styleObj;
      });
    }
  }

  const result = {
    pageId: args.pageId,
    url,
    title,
    css,
    selector: args.selector,
    styles: args.includeComputed ? styles : undefined,
  };

  const executionTime = Date.now() - startTime;

  // Record resource result event
  await browserManagerExtensions.recordToolResult(args.pageId, 'get_css', {
    pageId: args.pageId,
    url,
    title,
    selector: args.selector,
    includeComputed: args.includeComputed
  }, executionTime);

  return result;
}