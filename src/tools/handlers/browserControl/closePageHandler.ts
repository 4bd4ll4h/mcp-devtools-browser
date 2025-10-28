import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ClosePageArgs, ClosePageResult } from "../../../schema/toolsSchema.js";

export async function closePageHandler(args: ClosePageArgs): Promise<ClosePageResult> {
  const { pageId } = args;

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  try {
    await browserManager.closePage(pageId);

    return {
      success: true,
      message: `Successfully closed page ${pageId}`,
    };
  } catch (err: any) {
    console.error(`❌ Failed to close page ${pageId}:`, err.message);
    throw new Error(`Close page failed: ${err.message}`);
  }
}