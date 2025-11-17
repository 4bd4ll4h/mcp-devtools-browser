import { BrowserManager } from "../../../browser/BrowserManager.js";
import { PressKeyArgs, PressKeyResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function pressKeyHandler(args: PressKeyArgs): Promise<PressKeyResult> {
  const { pageId, key } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'press_key', args);

  try {
    // Press the specified key
    await page.keyboard.press(key);

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'press_key', {
      pageId,
      success: true
    }, executionTime);

    return {
      pageId,
      success: true,
    };
  } catch (err: any) {
    const executionTime = Date.now() - startTime;

    // Record tool error event
    await browserManagerExtensions.recordToolError(pageId, 'press_key', err, executionTime);

    console.error(`❌ Failed to press key "${key}" on page ${pageId}:`, err.message);
    throw new Error(`Press key failed: ${err.message}`);
  }
}