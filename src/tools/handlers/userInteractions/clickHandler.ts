import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ClickArgs, ClickResult } from "../../../schema/toolsSchema.js";

export async function clickHandler(args: ClickArgs): Promise<ClickResult> {
  const { pageId, selector, waitForNavigation = false, timeoutMs = 30000 } = args;

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

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

    return {
      pageId,
      url: currentUrl,
      title,
      success: true,
    };
  } catch (err: any) {
    console.error(`❌ Failed to click on selector "${selector}" on page ${pageId}:`, err.message);
    throw new Error(`Click failed: ${err.message}`);
  }
}