import { BrowserManager } from '../browser/BrowserManager.js';
import { LLMActionData, DOMChangeData, NetworkEventData, ConsoleEventData, BrowserEventData } from './types.js';

/**
 * Extension methods for BrowserManager to emit events
 * Works with page-specific EventLoggers managed by BrowserManager
 */
export class BrowserManagerExtensions {
  private browserManager: BrowserManager;

  constructor(browserManager: BrowserManager) {
    this.browserManager = browserManager;
  }

  /**
   * Record LLM tool invocation event
   * @param pageId - Page ID where tool was invoked
   * @param toolName - Name of the tool
   * @param parameters - Tool input parameters
   */
  public async recordToolInvocation(pageId: string, toolName: string, parameters: any): Promise<void> {
    try {
      const eventLogger = this.browserManager.getEventLogger(pageId);
      await eventLogger.recordEvent({
        pageId,
        eventType: 'llm_action',
        source: toolName,
        data: {
          actionType: 'tool_invocation',
          toolName,
          parameters,
          executionTime: 0 // Will be updated when result is recorded
        } as LLMActionData,
        metadata: {
          url: this.browserManager.getPage(pageId).url()
        }
      });
    } catch (error) {
      console.error(`Failed to record tool invocation for ${toolName}:`, error);
    }
  }

  /**
   * Record LLM tool result event
   * @param pageId - Page ID where tool was executed
   * @param toolName - Name of the tool
   * @param result - Tool execution result
   * @param executionTime - Tool execution duration
   */
  public async recordToolResult(pageId: string, toolName: string, result: any, executionTime: number): Promise<void> {
    try {
      const eventLogger = this.browserManager.getEventLogger(pageId);
      await eventLogger.recordEvent({
        pageId,
        eventType: 'llm_action',
        source: toolName,
        data: {
          actionType: 'tool_result',
          toolName,
          result,
          executionTime
        } as LLMActionData,
        metadata: {
          url: this.browserManager.getPage(pageId).url(),
          duration: executionTime
        }
      });
    } catch (error) {
      console.error(`Failed to record tool result for ${toolName}:`, error);
    }
  }

  /**
   * Record LLM tool error event
   * @param pageId - Page ID where tool failed
   * @param toolName - Name of the tool
   * @param error - Error that occurred
   * @param executionTime - Tool execution duration before error
   */
  public async recordToolError(pageId: string, toolName: string, error: any, executionTime: number): Promise<void> {
    try {
      const eventLogger = this.browserManager.getEventLogger(pageId);
      await eventLogger.recordEvent({
        pageId,
        eventType: 'llm_action',
        source: toolName,
        data: {
          actionType: 'tool_error',
          toolName,
          errorDetails: error,
          executionTime
        } as LLMActionData,
        metadata: {
          url: this.browserManager.getPage(pageId).url(),
          error: error instanceof Error ? error.message : String(error),
          duration: executionTime
        }
      });
    } catch (error) {
      console.error(`Failed to record tool error for ${toolName}:`, error);
    }
  }

  /**
   * Record DOM change event
   * @param pageId - Page ID where change occurred
   * @param changeData - DOM change details
   */
  public async recordDOMChange(pageId: string, changeData: DOMChangeData): Promise<void> {
    try {
      const eventLogger = this.browserManager.getEventLogger(pageId);
      await eventLogger.recordEvent({
        pageId,
        eventType: 'dom_change',
        source: 'dom_mutation',
        data: changeData,
        metadata: {
          url: this.browserManager.getPage(pageId).url(),
          selector: changeData.elementId || changeData.parentSelector
        }
      });
    } catch (error) {
      console.error(`Failed to record DOM change for page ${pageId}:`, error);
    }
  }

  /**
   * Record network event
   * @param pageId - Page ID where event occurred
   * @param networkData - Network event details
   */
  public async recordNetworkEvent(pageId: string, networkData: NetworkEventData): Promise<void> {
    try {
      const eventLogger = this.browserManager.getEventLogger(pageId);
      await eventLogger.recordEvent({
        pageId,
        eventType: 'network',
        source: 'network_monitor',
        data: networkData,
        metadata: {
          url: this.browserManager.getPage(pageId).url(),
          status: networkData.statusCode
        }
      });
    } catch (error) {
      console.error(`Failed to record network event for page ${pageId}:`, error);
    }
  }

  /**
   * Record console event
   * @param pageId - Page ID where event occurred
   * @param consoleData - Console event details
   */
  public async recordConsoleEvent(pageId: string, consoleData: ConsoleEventData): Promise<void> {
    try {
      const eventLogger = this.browserManager.getEventLogger(pageId);
      await eventLogger.recordEvent({
        pageId,
        eventType: 'console',
        source: 'console_monitor',
        data: consoleData,
        metadata: {
          url: this.browserManager.getPage(pageId).url(),
          error: consoleData.eventType === 'error' ? consoleData.message : undefined
        }
      });
    } catch (error) {
      console.error(`Failed to record console event for page ${pageId}:`, error);
    }
  }

  /**
   * Record browser event
   * @param pageId - Page ID where event occurred
   * @param browserData - Browser event details
   */
  public async recordBrowserEvent(pageId: string, browserData: BrowserEventData): Promise<void> {
    try {
      const eventLogger = this.browserManager.getEventLogger(pageId);
      await eventLogger.recordEvent({
        pageId,
        eventType: 'browser',
        source: 'browser_monitor',
        data: browserData,
        metadata: {
          url: this.browserManager.getPage(pageId).url(),
          title: browserData.toUrl ? `Navigated to ${browserData.toUrl}` : undefined
        }
      });
    } catch (error) {
      console.error(`Failed to record browser event for page ${pageId}:`, error);
    }
  }

  /**
   * Clean up event listeners for a page
   */
  public cleanupPageMonitoring(): void {
    // Event listeners are automatically cleaned up when page is closed
    // No explicit cleanup needed since listeners are bound to page lifecycle
  }
}