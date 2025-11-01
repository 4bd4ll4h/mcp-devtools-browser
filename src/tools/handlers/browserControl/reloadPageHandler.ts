import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ReloadPageArgs, ReloadPageResult } from "../../../schema/toolsSchema.js";

export async function reloadPageHandler(args: ReloadPageArgs): Promise<ReloadPageResult> {
  const { pageId, waitUntil = "networkidle2", timeoutMs = 30000 } = args;

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);
  const currentUrl = page.url();

  if (!currentUrl || currentUrl === "about:blank") {
    throw new Error("Cannot reload page - no URL loaded");
  }

  try {
    const response = await page.reload({
      waitUntil,
      timeout: timeoutMs,
    });

    const title = await page.title().catch(() => null);
    const status = response?.status() || 0;
    const finalUrl = page.url();


    return {
      pageId,
      url: finalUrl,
      title,
      status,
    };
  } catch (err: any) {
    console.error(`❌ Failed to reload page ${pageId}:`, err.message);
    throw new Error(`Reload failed: ${err.message}`);
  }
}