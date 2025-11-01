import { BrowserManager } from "../../../browser/BrowserManager.js";
import { TypeArgs, TypeResult } from "../../../schema/toolsSchema.js";

export async function typeHandler(args: TypeArgs): Promise<TypeResult> {
  const { pageId, selector, text, delayMs = 0, clear = false } = args;

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  try {
    // Wait for the selector to be visible
    await page.waitForSelector(selector, {
      visible: true,
      timeout: 30000
    });

    // Focus on the element
    await page.focus(selector);

    // Clear the field if requested
    if (clear) {
      await page.evaluate((sel) => {
        const element = document.querySelector(sel) as HTMLInputElement;
        if (element) {
          element.value = '';
        }
      }, selector);
    }

    // Type the text with optional delay
    await page.type(selector, text, { delay: delayMs });

    return {
      pageId,
      success: true,
    };
  } catch (err: any) {
    console.error(`❌ Failed to type text into selector "${selector}" on page ${pageId}:`, err.message);
    throw new Error(`Type failed: ${err.message}`);
  }
}