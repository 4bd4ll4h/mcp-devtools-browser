import { BrowserManager } from "../../browser/BrowserManager.js";
import { GetScreenshotArgs, GetScreenshotResult } from "../../schema/resourcesSchema.js";
import { browserManagerExtensions } from "../../tools/toolsRegister.js";

export async function getScreenshotHandler(args: GetScreenshotArgs): Promise<GetScreenshotResult> {
  const startTime = Date.now();
  const browserManager = BrowserManager.getInstance();
  const page = browserManager.getPage(args.pageId);

  // Record resource invocation event
  await browserManagerExtensions.recordToolInvocation(args.pageId, 'get_screenshot', args);

  try {
    // Validate that we have either full page, selector, or coordinates
    const hasSelector = !!args.selector;
    const hasCoordinates = !!(args.x !== undefined && args.y !== undefined && args.width !== undefined && args.height !== undefined);
    const hasFullPage = args.fullPage;

    if (!hasFullPage && !hasSelector && !hasCoordinates) {
      throw new Error("Must specify either fullPage: true, a selector, or coordinates (x, y, width, height)");
    }

    // Get current page info
    const url = page.url();
    const title = await page.title();

  let screenshotData: Uint8Array;
  let width: number;
  let height: number;

  if (hasSelector) {
    // Take screenshot of specific element
    const element = await page.$(args.selector!);
    if (!element) {
      throw new Error(`Element with selector "${args.selector}" not found`);
    }

    screenshotData = await element.screenshot({
      type: args.format,
      quality: args.format === "jpeg" ? args.quality : undefined,
    });

    // Get element dimensions
    const boundingBox = await element.boundingBox();
    if (!boundingBox) {
      throw new Error("Could not get element dimensions");
    }
    width = Math.round(boundingBox.width);
    height = Math.round(boundingBox.height);
  } else if (hasCoordinates) {
    // Take screenshot of specific region
    screenshotData = await page.screenshot({
      type: args.format,
      quality: args.format === "jpeg" ? args.quality : undefined,
      clip: {
        x: args.x!,
        y: args.y!,
        width: args.width!,
        height: args.height!,
      },
    });
    width = args.width!;
    height = args.height!;
  } else {
    // Take full page screenshot
    screenshotData = await page.screenshot({
      type: args.format,
      quality: args.format === "jpeg" ? args.quality : undefined,
      fullPage: true,
    });

    // For full page screenshots, we need to get the viewport dimensions
    const viewport = page.viewport();
    if (viewport) {
      width = viewport.width;
      height = viewport.height;
    } else {
      // Fallback: get dimensions from the screenshot
      // This is a simplified approach - in practice you might need image processing
      width = 1920; // Default width
      height = 1080; // Default height
    }
  }

  // Convert Uint8Array to base64
  const base64Data = Buffer.from(screenshotData).toString('base64');

  const result = {
    pageId: args.pageId,
    url,
    title,
    format: args.format || "png",
    data: base64Data,
    width,
    height,
  };

  const executionTime = Date.now() - startTime;

  // Record resource result event
  await browserManagerExtensions.recordToolResult(args.pageId, 'get_screenshot', {
    pageId: args.pageId,
    url,
    title,
    format: args.format || "png",
    width,
    height
  }, executionTime);

    return result;
  } catch (err: any) {
    const executionTime = Date.now() - startTime;

    // Record resource error event
    await browserManagerExtensions.recordToolError(args.pageId, 'get_screenshot', err, executionTime);

    console.error(`❌ Failed to get screenshot for page ${args.pageId}:`, err.message);
    throw new Error(`Failed to get screenshot: ${err.message}`);
  }
}