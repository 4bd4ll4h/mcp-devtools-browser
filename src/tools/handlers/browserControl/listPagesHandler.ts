import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ListPagesArgs, ListPagesResult } from "../../../schema/toolsSchema.js";

export async function listPagesHandler(args: ListPagesArgs): Promise<ListPagesResult> {
  const browserManager = BrowserManager.getInstance();

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

  console.log(`📄 Found ${resolvedPages.length} open pages`);

  return {
    pages: resolvedPages,
  };
}