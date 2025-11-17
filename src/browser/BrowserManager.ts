import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';
import { EventLogger } from '../event/EventLogger.js';
import { BrowserManagerExtensions } from '../event/BrowserManagerExtensions.js';

interface TrackedPage {
  id: string;
  page: Page;
  lastActivity: number;
  eventLogger: EventLogger;  // Each page has its own EventLogger
}

export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private pages: Map<string, TrackedPage> = new Map();
  private config: any;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private extensions: BrowserManagerExtensions;

  private constructor() {
    this.loadConfig();
    this.extensions = new BrowserManagerExtensions(this);
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

    // Create page-specific EventLogger
    // Each page gets its own isolated event logger
    const eventLogger = new EventLogger(id);

    this.pages.set(id, {
      id,
      page,
      lastActivity: Date.now(),
      eventLogger,  // Store event logger with page
    });

    page.on("domcontentloaded", () =>
      this.touch(id)
    );

    // Set up event monitoring for the new page
    this.setupPageEventMonitoring(page, eventLogger);

    // Record page creation event
    this.extensions.recordBrowserEvent(id, {
      eventType: 'page_loaded',
      toUrl: page.url()
    }).catch(console.error);

    return id;
  }

  public getPage(pageId: string): Page {
    const tracked = this.pages.get(pageId);
    if (!tracked) throw new Error("Invalid page ID");

    this.touch(pageId);
    return tracked.page;
  }

  /**
   * Get the EventLogger for a specific page
   * Used by tool handlers to record events
   */
  public getEventLogger(pageId: string): EventLogger {
    const tracked = this.pages.get(pageId);
    if (!tracked) throw new Error("Invalid page ID");

    this.touch(pageId);
    return tracked.eventLogger;
  }

  /**
   * Set up event monitoring for a page
   * @param page - Puppeteer page instance
   * @param eventLogger - Page-specific event logger
   */
  private setupPageEventMonitoring(page: Page, eventLogger: EventLogger): void {
    // Monitor console events
    page.on('console', (msg) => {
      const eventType = this.getConsoleEventType(msg.type());
      this.extensions.recordConsoleEvent(eventLogger['pageId'], {
        eventType,
        message: msg.text(),
        args: msg.args().map(arg => arg.toString())
      }).catch(console.error);
    });

    // Monitor network events
    page.on('request', (req) => {
      this.extensions.recordNetworkEvent(eventLogger['pageId'], {
        eventType: 'request_sent',
        url: req.url(),
        method: req.method(),
        headers: req.headers()
      }).catch(console.error);
    });

    page.on('response', (resp) => {
      this.extensions.recordNetworkEvent(eventLogger['pageId'], {
        eventType: 'response_received',
        url: resp.url(),
        statusCode: resp.status(),
        headers: resp.headers()
      }).catch(console.error);
    });

    // Monitor navigation events
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        this.extensions.recordBrowserEvent(eventLogger['pageId'], {
          eventType: 'navigation_completed',
          fromUrl: page.url(),
          toUrl: frame.url()
        }).catch(console.error);
      }
    });

    // Monitor DOM content loaded
    page.on('domcontentloaded', () => {
      this.extensions.recordBrowserEvent(eventLogger['pageId'], {
        eventType: 'page_loaded',
        toUrl: page.url()
      }).catch(console.error);

      // Set up DOM mutation monitoring after page loads
      this.setupDOMMutationMonitoring(page, eventLogger);
    });
  }

  /**
   * Map console message type to event type
   */
  private getConsoleEventType(consoleType: string): 'log' | 'info' | 'warn' | 'error' | 'debug' {
    switch (consoleType) {
      case 'log': return 'log';
      case 'info': return 'info';
      case 'warning': return 'warn';
      case 'error': return 'error';
      case 'debug': return 'debug';
      default: return 'log';
    }
  }

  /**
   * Set up DOM mutation monitoring using MutationObserver
   * @param page - Puppeteer page instance
   * @param eventLogger - Page-specific event logger
   */
  private async setupDOMMutationMonitoring(page: Page, eventLogger: EventLogger): Promise<void> {
    try {
      await page.evaluate((pageId) => {
        // Create MutationObserver to track DOM changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            // Only process element nodes (not text nodes, etc.)
            if (mutation.target.nodeType === Node.ELEMENT_NODE) {
              const element = mutation.target as Element;
              const eventData = {
                type: mutation.type,
                target: {
                  tagName: element.tagName,
                  id: element.id || null,
                  className: element.className || null
                },
                addedNodes: Array.from(mutation.addedNodes)
                  .filter(node => node.nodeType === Node.ELEMENT_NODE)
                  .map(node => ({
                    nodeType: node.nodeType,
                    nodeName: node.nodeName,
                    textContent: node.textContent?.substring(0, 100) || null
                  })),
                removedNodes: Array.from(mutation.removedNodes)
                  .filter(node => node.nodeType === Node.ELEMENT_NODE)
                  .map(node => ({
                    nodeType: node.nodeType,
                    nodeName: node.nodeName,
                    textContent: node.textContent?.substring(0, 100) || null
                  })),
                attributeName: mutation.attributeName,
                oldValue: mutation.oldValue
              };

              // Send mutation data to the browser
              window.dispatchEvent(new CustomEvent('dom-mutation', {
                detail: {
                  pageId: pageId,
                  mutation: eventData
                }
              }));
            }
          });
        });

        // Start observing the document for mutations
        observer.observe(document.body, {
          childList: true,        // Observe addition/removal of child elements
          subtree: true,          // Observe all descendants
          attributes: true,       // Observe attribute changes
          attributeOldValue: true, // Record old attribute values
          characterData: true,    // Observe text content changes
          characterDataOldValue: true // Record old text content
        });

        // Store observer reference for cleanup
        (window as any).__domMutationObserver = observer;

      }, eventLogger['pageId']);

      // Listen for DOM mutation events from the page
      page.on('dom-mutation', (event: any) => {
        const { pageId, mutation } = event;
        this.handleDOMMutation(pageId, mutation);
      });

    } catch (error) {
      console.error('Failed to set up DOM mutation monitoring:', error);
    }
  }

  /**
   * Handle DOM mutation events and record them
   * @param pageId - Page ID where mutation occurred
   * @param mutation - Mutation data from MutationObserver
   */
  private handleDOMMutation(pageId: string, mutation: any): void {
    try {
      const changeType = this.mapMutationToChangeType(mutation.type);

      const domChangeData = {
        changeType,
        elementId: mutation.target.id,
        tagName: mutation.target.tagName,
        attributes: mutation.attributeName ? {
          [mutation.attributeName]: mutation.oldValue
        } : undefined,
        oldValue: mutation.oldValue,
        newValue: mutation.addedNodes.length > 0 ?
          mutation.addedNodes[0].textContent : undefined,
        parentSelector: this.generateSelector(mutation.target)
      };

      // Record DOM change event
      this.extensions.recordDOMChange(pageId, domChangeData);

    } catch (error) {
      console.error('Failed to handle DOM mutation:', error);
    }
  }

  /**
   * Map MutationObserver type to DOMChangeType
   */
  private mapMutationToChangeType(mutationType: string): 'element_added' | 'element_removed' | 'attribute_changed' | 'content_changed' {
    switch (mutationType) {
      case 'childList':
        return 'element_added'; // Simplified - we'll refine this based on added/removed nodes
      case 'attributes':
        return 'attribute_changed';
      case 'characterData':
        return 'content_changed';
      default:
        return 'element_added';
    }
  }

  /**
   * Generate CSS selector for an element (simplified version)
   */
  private generateSelector(element: any): string {
    // Simplified selector generation
    if (element.id) {
      return `#${element.id}`;
    }
    if (element.className) {
      return `.${element.className.split(' ')[0]}`;
    }
    return element.tagName.toLowerCase();
  }

  public getAllPages(): TrackedPage[] {
    return Array.from(this.pages.values());
  }

  public async closePage(pageId: string): Promise<void> {
    const tracked = this.pages.get(pageId);
    if (!tracked) throw new Error("Invalid page ID");

    try {
      // Record page closure event before closing
      this.extensions.recordBrowserEvent(pageId, {
        eventType: 'page_unloaded',
        fromUrl: tracked.page.url()
      }).catch(console.error);

      await tracked.page.close();

      // EventLogger is automatically garbage collected when page is removed
      // No explicit cleanup needed since it's page-specific
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
