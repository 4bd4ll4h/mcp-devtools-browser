import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ScrollToBottomArgs, ScrollToBottomResult } from "../../../schema/toolsSchema.js";

export async function scrollToBottomHandler(args: ScrollToBottomArgs): Promise<ScrollToBottomResult> {
  const { pageId, timeoutMs = 30000 } = args;

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  try {
    const startTime = Date.now();
    let previousHeight = 0;
    let currentHeight = 0;

    // Keep scrolling until we reach the bottom or timeout
    while (Date.now() - startTime < timeoutMs) {
      // Get current scroll height
      currentHeight = await page.evaluate(() => {
        return document.documentElement.scrollHeight;
      });

      // Scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });

      // Wait for potential lazy loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if we've reached the bottom (no more content loaded)
      const newHeight = await page.evaluate(() => {
        return document.documentElement.scrollHeight;
      });

      if (newHeight === currentHeight && currentHeight === previousHeight) {
        // No more content loaded, we've reached the bottom
        break;
      }

      previousHeight = currentHeight;
    }

    return {
      pageId,
      success: true,
    };
  } catch (err: any) {
    console.error(`❌ Failed to scroll to bottom on page ${pageId}:`, err.message);
    throw new Error(`Scroll to bottom failed: ${err.message}`);
  }
}