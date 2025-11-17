import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ClickArgs, ClickResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function clickHandler(args: ClickArgs): Promise<ClickResult> {
  const { pageId, selector, waitForNavigation = false, timeoutMs = 30000 } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'click', args);

  try {
    // Wait for the selector to be visible and clickable
    await page.waitForSelector(selector, {
      visible: true,
      timeout: timeoutMs
    });

    if (waitForNavigation) {
      // Use Promise.all to wait for both click and navigation
      await Promise.all([
        page.click(selector),
        page.waitForNavigation({
          waitUntil: "domcontentloaded",
          timeout: timeoutMs
        })
      ]);
    } else {
      // Just click without waiting for navigation
      await page.click(selector);
    }

    const title = await page.title().catch(() => null);
    const currentUrl = page.url();

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'click', {
      pageId,
      url: currentUrl,
      title,
      success: true
    }, executionTime);

    return {
      pageId,
      url: currentUrl,
      title,
      success: true,
    };
  } catch (err: any) {
    const executionTime = Date.now() - startTime;

    // Record tool error event
    await browserManagerExtensions.recordToolError(pageId, 'click', err, executionTime);

    console.error(`❌ Failed to click on selector "${selector}" on page ${pageId}:`, err.message);
    throw new Error(`Click failed: ${err.message}`);
  }
}