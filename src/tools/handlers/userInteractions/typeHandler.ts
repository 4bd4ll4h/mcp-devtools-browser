import { BrowserManager } from "../../../browser/BrowserManager.js";
import { TypeArgs, TypeResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function typeHandler(args: TypeArgs): Promise<TypeResult> {
  const { pageId, selector, text, delayMs = 0, clear = false } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'type', args);

  try {
    // Wait for the selector to be visible
    await page.waitForSelector(selector, {
      visible: true,
      timeout: 30000
    });

    // Focus on the element
    await page.focus(selector);

    // Clear the field if requested
    if (clear) {
      await page.evaluate((sel) => {
        const element = document.querySelector(sel) as HTMLInputElement;
        if (element) {
          element.value = '';
        }
      }, selector);
    }

    // Type the text with optional delay
    await page.type(selector, text, { delay: delayMs });

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'type', {
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
    await browserManagerExtensions.recordToolError(pageId, 'type', err, executionTime);

    console.error(`❌ Failed to type text into selector "${selector}" on page ${pageId}:`, err.message);
    throw new Error(`Type failed: ${err.message}`);
  }
}