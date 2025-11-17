import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ClosePageArgs, ClosePageResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function closePageHandler(args: ClosePageArgs): Promise<ClosePageResult> {
  const { pageId } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'close_page', args);

  try {
    await browserManager.closePage(pageId);

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'close_page', {
      success: true,
      message: `Successfully closed page ${pageId}`
    }, executionTime);

    return {
      success: true,
      message: `Successfully closed page ${pageId}`,
    };
  } catch (err: any) {
    const executionTime = Date.now() - startTime;

    // Record tool error event
    await browserManagerExtensions.recordToolError(pageId, 'close_page', err, executionTime);

    console.error(`❌ Failed to close page ${pageId}:`, err.message);
    throw new Error(`Close page failed: ${err.message}`);
  }
}