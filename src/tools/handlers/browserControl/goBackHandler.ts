import { BrowserManager } from "../../../browser/BrowserManager.js";
import { GoBackArgs, GoBackResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function goBackHandler(args: GoBackArgs): Promise<GoBackResult> {
  const { pageId } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'go_back', args);

  try {
    const canGoBack = await page.evaluate(() => window.history.length > 1);

    if (!canGoBack) {
      throw new Error("Cannot go back - no history available");
    }

    await page.goBack({
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    const title = await page.title().catch(() => null);
    const currentUrl = page.url();

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'go_back', {
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
    await browserManagerExtensions.recordToolError(pageId, 'go_back', err, executionTime);

    console.error(`❌ Failed to go back on page ${pageId}:`, err.message);
    throw new Error(`Go back failed: ${err.message}`);
  }
}