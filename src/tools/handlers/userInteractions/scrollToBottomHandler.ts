import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ScrollToBottomArgs, ScrollToBottomResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function scrollToBottomHandler(args: ScrollToBottomArgs): Promise<ScrollToBottomResult> {
  const { pageId, timeoutMs = 30000 } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'scroll_to_bottom', args);

  try {
    const scrollStartTime = Date.now();
    let previousHeight = 0;
    let currentHeight = 0;

    // Keep scrolling until we reach the bottom or timeout
    while (Date.now() - scrollStartTime < timeoutMs) {
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

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'scroll_to_bottom', {
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
    await browserManagerExtensions.recordToolError(pageId, 'scroll_to_bottom', err, executionTime);

    console.error(`❌ Failed to scroll to bottom on page ${pageId}:`, err.message);
    throw new Error(`Scroll to bottom failed: ${err.message}`);
  }
}