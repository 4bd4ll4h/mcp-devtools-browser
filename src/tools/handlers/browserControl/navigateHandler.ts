import { BrowserManager } from "../../../browser/BrowserManager.js";
import { NavigateArgs, NavigateResult } from "../../../schema/toolsSchema.js";

export async function navigateHandler(args: NavigateArgs): Promise<NavigateResult> {
  const { pageId, url, waitUntil = "networkidle2", timeoutMs = 30000 } = args;

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  try {
    const response = await page.goto(url, {
      waitUntil,
      timeout: timeoutMs,
    });

    const title = await page.title().catch(() => null);
    const finalUrl = page.url();
    const status = response?.status() || 0;


    return {
      pageId,
      url: finalUrl,
      title,
      status,
    };
  } catch (err: any) {
    console.error(`❌ Failed to navigate page ${pageId} to ${url}:`, err.message);
    throw new Error(`Navigation failed: ${err.message}`);
  }
}