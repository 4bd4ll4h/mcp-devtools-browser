
import { openPageOutputSchema } from "../../../schema/toolsSchema.js";


import { BrowserManager } from "../../../browser/BrowserManager.js";
import { Page } from "puppeteer";

import { OpenPageArgs, OpenPageResult } from "../../../schema/toolsSchema.js";

export async function openPageHandler(args: OpenPageArgs): Promise<OpenPageResult> {
  const { url, waitUntil = "networkidle2", timeoutMs = 30000 } = args;

  if (!url || !/^https?:\/\//.test(url)) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const browserManager = BrowserManager.getInstance();
  await browserManager.launchBrowser();

  const pageId = await browserManager.newPage();
  const page = browserManager.getPage(pageId);

  try {
    const response = await page.goto(url, {
      waitUntil,
      timeout: timeoutMs,
    });

    const title = await page.title().catch(() => null);
    const status = response?.status() || 0;
    const finalUrl = page.url();


    return {
      pageId,
      url: finalUrl,
      title,
      status,
    };
  } catch (err: any) {
    console.error(`❌ Failed to open ${url}:`, err.message);
    throw new Error(`Navigation failed: ${err.message}`);
  }
}
