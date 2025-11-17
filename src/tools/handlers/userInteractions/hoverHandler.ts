import { BrowserManager } from "../../../browser/BrowserManager.js";
import { HoverArgs, HoverResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function hoverHandler(args: HoverArgs): Promise<HoverResult> {
  const { pageId, selector } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  if (!browserManager) {
    throw new Error("Browser not launched");
  }

  const page = browserManager.getPage(pageId);

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'hover', args);

  try {
    // Wait for the selector to be visible
    await page.waitForSelector(selector, {
      visible: true,
      timeout: 30000
    });

    // Hover over the element
    await page.hover(selector);

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'hover', {
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
    await browserManagerExtensions.recordToolError(pageId, 'hover', err, executionTime);

    console.error(`❌ Failed to hover over selector "${selector}" on page ${pageId}:`, err.message);
    throw new Error(`Hover failed: ${err.message}`);
  }
}