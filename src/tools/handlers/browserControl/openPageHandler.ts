
import { openPageOutputSchema } from "../../../schema/toolsSchema.js";
import { BrowserManager } from "../../../browser/BrowserManager.js";
import { Page } from "puppeteer";
import { OpenPageArgs, OpenPageResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function openPageHandler(args: OpenPageArgs): Promise<OpenPageResult> {
  const { url, waitUntil = "networkidle2", timeoutMs = 30000 } = args;

  if (!url || !/^https?:\/\//.test(url)) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();
  await browserManager.launchBrowser();

  const pageId = await browserManager.newPage();
  const page = browserManager.getPage(pageId);

  // Record tool invocation event with the actual pageId
  await browserManagerExtensions.recordToolInvocation(pageId, 'open_page', args);

  try {
    const response = await page.goto(url, {
      waitUntil,
      timeout: timeoutMs,
    });

    const title = await page.title().catch(() => null);
    const status = response?.status() || 0;
    const finalUrl = page.url();

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult('system', 'open_page', {
      pageId,
      url: finalUrl,
      title,
      status
    }, executionTime);

    return {
      pageId,
      url: finalUrl,
      title,
      status,
    };
  } catch (err: any) {
    const executionTime = Date.now() - startTime;

    // Record tool error event
    await browserManagerExtensions.recordToolError('system', 'open_page', err, executionTime);

    console.error(`❌ Failed to open ${url}:`, err.message);
    throw new Error(`Navigation failed: ${err.message}`);
  }
}
