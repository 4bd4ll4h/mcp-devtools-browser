import { BrowserManager } from "../../../browser/BrowserManager.js";
import { PressKeyArgs, PressKeyResult } from "../../../schema/toolsSchema.js";

export async function pressKeyHandler(args: PressKeyArgs): Promise<PressKeyResult> {
  const { pageId, key } = args;

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  try {
    // Press the specified key
    await page.keyboard.press(key);

    return {
      pageId,
      success: true,
    };
  } catch (err: any) {
    console.error(`❌ Failed to press key "${key}" on page ${pageId}:`, err.message);
    throw new Error(`Press key failed: ${err.message}`);
  }
}