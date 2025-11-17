import { BrowserManager } from "../browser/BrowserManager.js";

export function getPageIds(): string[] {
  const browserManager = BrowserManager.getInstance();
  return Array.from(browserManager.getAllPages().map(page => page.id));
}