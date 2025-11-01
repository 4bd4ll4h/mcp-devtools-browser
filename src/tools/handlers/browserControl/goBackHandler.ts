import { BrowserManager } from "../../../browser/BrowserManager.js";
import { GoBackArgs, GoBackResult } from "../../../schema/toolsSchema.js";

export async function goBackHandler(args: GoBackArgs): Promise<GoBackResult> {
  const { pageId } = args;

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

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


    return {
      pageId,
      url: currentUrl,
      title,
      success: true,
    };
  } catch (err: any) {
    console.error(`❌ Failed to go back on page ${pageId}:`, err.message);
    throw new Error(`Go back failed: ${err.message}`);
  }
}