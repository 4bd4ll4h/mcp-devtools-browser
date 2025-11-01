import { BrowserManager } from "../../../browser/BrowserManager.js";
import { GoForwardArgs, GoForwardResult } from "../../../schema/toolsSchema.js";

export async function goForwardHandler(args: GoForwardArgs): Promise<GoForwardResult> {
  const { pageId } = args;

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  try {
    const canGoForward = await page.evaluate(() => {
      const currentIndex = window.history.state?.index || 0;
      return currentIndex < window.history.length - 1;
    });

    if (!canGoForward) {
      throw new Error("Cannot go forward - no forward history available");
    }

    await page.goForward({
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
    console.error(`❌ Failed to go forward on page ${pageId}:`, err.message);
    throw new Error(`Go forward failed: ${err.message}`);
  }
}