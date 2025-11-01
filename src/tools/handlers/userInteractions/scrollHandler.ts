import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ScrollArgs, ScrollResult } from "../../../schema/toolsSchema.js";

export async function scrollHandler(args: ScrollArgs): Promise<ScrollResult> {
  const { pageId, x, y, selector } = args;

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  try {
    if (selector) {
      // Scroll to specific element
      await page.waitForSelector(selector, {
        visible: true,
        timeout: 30000
      });

      await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, selector);
    } else if (x !== undefined && y !== undefined) {
      // Scroll by specific offset
      await page.evaluate((scrollX, scrollY) => {
        window.scrollBy(scrollX, scrollY);
      }, x, y);
    } else {
      throw new Error("Either selector or x/y coordinates must be provided");
    }

    return {
      pageId,
      success: true,
    };
  } catch (err: any) {
    console.error(`❌ Failed to scroll on page ${pageId}:`, err.message);
    throw new Error(`Scroll failed: ${err.message}`);
  }
}