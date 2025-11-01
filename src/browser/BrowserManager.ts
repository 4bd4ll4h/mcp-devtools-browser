import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';

interface TrackedPage {
  id: string;
  page: Page;
  lastActivity: number;
}

export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private pages: Map<string, TrackedPage> = new Map();
  private config: any;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadConfig();
  }

  public static getInstance() {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  private loadConfig() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const configPath = path.resolve(__dirname, "../config/browserConfig.json");
    this.config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  public async launchBrowser() {
    if (this.browser) return;

    try {
      this.browser = await puppeteer.launch(this.config);
      this.setupCrashHandler();
      this.startCleanupRoutine();
    } catch (err) {
      console.error("❌ Failed to launch browser:", err);
    }
  }

  private setupCrashHandler() {
    this.browser!.on("disconnected", async () => {
      await this.restartBrowser();
    });
  }

  public async restartBrowser() {
    await this.closeBrowser();
    this.pages.clear();
    await this.launchBrowser();
  }

  public async closeBrowser() {
    if (!this.browser) return;

    try {
      for (const { page } of Array.from(this.pages.values())) {
        await page.close();
      }
      await this.browser.close();

      this.browser = null;
    } catch (err) {
      console.error("❌ Error closing browser:", err);
    }
  }

  public async newPage(): Promise<string> {
    if (!this.browser) {
      await this.launchBrowser();
    }

    if (this.pages.size >= this.config.maxPages) {
      throw new Error("Too many open pages");
    }

    const page = await this.browser!.newPage();
    const id = crypto.randomUUID();

    this.pages.set(id, {
      id,
      page,
      lastActivity: Date.now(),
    });

    page.on("domcontentloaded", () =>
      this.touch(id)
    );

    return id;
  }

  public getPage(pageId: string): Page {
    const tracked = this.pages.get(pageId);
    if (!tracked) throw new Error("Invalid page ID");

    this.touch(pageId);
    return tracked.page;
  }

  public getAllPages(): TrackedPage[] {
    return Array.from(this.pages.values());
  }

  public async closePage(pageId: string): Promise<void> {
    const tracked = this.pages.get(pageId);
    if (!tracked) throw new Error("Invalid page ID");

    try {
      await tracked.page.close();
      this.pages.delete(pageId);
    } catch (err) {
      console.error(`❌ Failed to close page ${pageId}:`, err);
      throw new Error(`Failed to close page: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private touch(id: string) {
    const tracked = this.pages.get(id);
    if (tracked) {
      tracked.lastActivity = Date.now();
    }
  }

  private startCleanupRoutine() {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();

      for (const [id, tracked] of Array.from(this.pages.entries())) {
        if (now - tracked.lastActivity > this.config.idlePageTimeoutMs) {
          tracked.page.close();
          this.pages.delete(id);
        }
      }
    }, 10_000);
  }
}
