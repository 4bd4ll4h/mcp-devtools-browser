import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ReloadPageArgs, ReloadPageResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function reloadPageHandler(args: ReloadPageArgs): Promise<ReloadPageResult> {
  const { pageId, waitUntil = "networkidle2", timeoutMs = 30000 } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);
  const currentUrl = page.url();

  if (!currentUrl || currentUrl === "about:blank") {
    throw new Error("Cannot reload page - no URL loaded");
  }

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'reload_page', args);

  try {
    const response = await page.reload({
      waitUntil,
      timeout: timeoutMs,
    });

    const title = await page.title().catch(() => null);
    const status = response?.status() || 0;
    const finalUrl = page.url();

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'reload_page', {
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
    await browserManagerExtensions.recordToolError(pageId, 'reload_page', err, executionTime);

    console.error(`❌ Failed to reload page ${pageId}:`, err.message);
    throw new Error(`Reload failed: ${err.message}`);
  }
}