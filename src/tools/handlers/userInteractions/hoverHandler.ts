import { BrowserManager } from "../../../browser/BrowserManager.js";
import { HoverArgs, HoverResult } from "../../../schema/toolsSchema.js";

export async function hoverHandler(args: HoverArgs): Promise<HoverResult> {
  const { pageId, selector } = args;

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  try {
    // Wait for the selector to be visible
    await page.waitForSelector(selector, {
      visible: true,
      timeout: 30000
    });

    // Hover over the element
    await page.hover(selector);

    return {
      pageId,
      success: true,
    };
  } catch (err: any) {
    console.error(`❌ Failed to hover over selector "${selector}" on page ${pageId}:`, err.message);
    throw new Error(`Hover failed: ${err.message}`);
  }
}