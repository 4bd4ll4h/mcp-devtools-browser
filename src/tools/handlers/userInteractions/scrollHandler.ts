import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ScrollArgs, ScrollResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function scrollHandler(args: ScrollArgs): Promise<ScrollResult> {
  const { pageId, x, y, selector } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'scroll', args);

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
    } else if (x !== undefined || y !== undefined) {
      // Scroll by specific offset - use 0 for missing coordinates
      const scrollX = x || 0;
      const scrollY = y || 0;
      await page.evaluate((scrollX, scrollY) => {
        window.scrollBy(scrollX, scrollY);
      }, scrollX, scrollY);
    } else {
      throw new Error("Either selector or at least one coordinate (x or y) must be provided");
    }

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'scroll', {
      pageId,
      success: true
    }, executionTime);

    return {
      pageId,
      success: true,
    };
  } catch (err: any) {
    const executionTime = Date.now() - startTime;

    // Record tool error event
    await browserManagerExtensions.recordToolError(pageId, 'scroll', err, executionTime);

    console.error(`❌ Failed to scroll on page ${pageId}:`, err.message);
    throw new Error(`Scroll failed: ${err.message}`);
  }
}