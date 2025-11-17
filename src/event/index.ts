/**
 * Event logging system entry point
 * Exports all event-related classes and utilities
 *
 * NEW ARCHITECTURE: EventLogger is now page-specific and managed by BrowserManager
 * Each page gets its own EventLogger instance for better isolation and cleanup
 */

export { EventLogger } from './EventLogger.js';
export { EventFilter } from './EventFilter.js';
export { BrowserManagerExtensions } from './BrowserManagerExtensions.js';
export * from './types.js';

/**
 * Initialize the event logging system
 * Should be called during server startup
 *
 * NOTE: EventLoggers are now created per-page by BrowserManager
 * No global initialization needed - each page manages its own logger
 */
export function initializeEventSystem(): void {
  // TODO: Set up global event system configuration if needed
  // TODO: Register global cleanup handlers
  // EventLoggers are created per-page by BrowserManager.newPage()
}

/**
 * Clean up event logging system
 * Should be called during server shutdown
 *
 * NOTE: EventLoggers are automatically cleaned up when pages are closed
 * BrowserManager.closePage() handles logger cleanup
 */
export function cleanupEventSystem(): void {
  // TODO: Perform any global cleanup if needed
  // Page-specific EventLoggers are garbage collected with their pages
}