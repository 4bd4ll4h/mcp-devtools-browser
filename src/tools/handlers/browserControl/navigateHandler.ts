import { BrowserManager } from "../../../browser/BrowserManager.js";
import { NavigateArgs, NavigateResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function navigateHandler(args: NavigateArgs): Promise<NavigateResult> {
  const { pageId, url, waitUntil = "networkidle2", timeoutMs = 30000 } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'navigate', args);

  try {
    const response = await page.goto(url, {
      waitUntil,
      timeout: timeoutMs,
    });

    const title = await page.title().catch(() => null);
    const finalUrl = page.url();
    const status = response?.status() || 0;

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'navigate', {
      pageId,
      url: finalUrl,
      title,
      status
    }, executionTime);

    return {
      pageId,
      url: finalUrl,
      title,
      status,
    };
  } catch (err: any) {
    const executionTime = Date.now() - startTime;

    // Record tool error event
    await browserManagerExtensions.recordToolError(pageId, 'navigate', err, executionTime);

    console.error(`❌ Failed to navigate page ${pageId} to ${url}:`, err.message);
    throw new Error(`Navigation failed: ${err.message}`);
  }
}