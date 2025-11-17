import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ListPagesArgs, ListPagesResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function listPagesHandler(args: ListPagesArgs): Promise<ListPagesResult> {
  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  // Record tool invocation event (no specific pageId for list_pages)
  await browserManagerExtensions.recordToolInvocation('system', 'list_pages', args);

  // Get all tracked pages from the browser manager
  const trackedPages = browserManager.getAllPages();

  const pages = trackedPages.map(trackedPage => ({
    pageId: trackedPage.id,
    url: trackedPage.page.url(),
    title: trackedPage.page.title().catch(() => null),
    lastActivity: trackedPage.lastActivity,
  }));

  // Wait for all titles to resolve
  const resolvedPages = await Promise.all(
    pages.map(async (page) => ({
      ...page,
      title: await page.title,
    }))
  );

  const executionTime = Date.now() - startTime;

  // Record tool result event
  await browserManagerExtensions.recordToolResult('system', 'list_pages', {
    pages: resolvedPages
  }, executionTime);

  return {
    pages: resolvedPages,
  };
}