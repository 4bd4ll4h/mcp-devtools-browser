/**
 * Core event types for browser session logging
 */

export type EventType =
  | 'llm_action'      // LLM tool invocations and responses
  | 'dom_change'      // DOM element modifications
  | 'network'         // Network requests and responses
  | 'console'         // Console logs and JavaScript errors
  | 'browser';        // Browser lifecycle and navigation events

export type LLMActionType =
  | 'tool_invocation'     // Tool called by LLM
  | 'tool_result'         // Tool execution result
  | 'tool_error'          // Tool execution error
  | 'resource_request'    // Resource requested
  | 'resource_response';  // Resource data returned

export type DOMChangeType =
  | 'element_added'       // New element added to DOM
  | 'element_removed'     // Element removed from DOM
  | 'attribute_changed'   // Element attribute modified
  | 'content_changed'     // Element content/text modified
  | 'focus_changed'       // Focus moved between elements
  | 'visibility_changed'; // Element visibility changed

export type NetworkEventType =
  | 'request_sent'        // HTTP request initiated
  | 'response_received'   // HTTP response received
  | 'websocket_opened'    // WebSocket connection opened
  | 'websocket_closed'    // WebSocket connection closed
  | 'resource_loaded';    // Resource (image, script, etc.) loaded

export type ConsoleEventType =
  | 'log'                 // console.log()
  | 'info'                // console.info()
  | 'warn'                // console.warn()
  | 'error'               // console.error()
  | 'debug';              // console.debug()

export type BrowserEventType =
  | 'navigation_started'  // Navigation to new URL started
  | 'navigation_completed' // Navigation completed
  | 'page_loaded'         // Page fully loaded
  | 'page_unloaded'       // Page unloaded
  | 'visibility_changed'  // Page visibility changed
  | 'viewport_changed';   // Viewport size/orientation changed

/**
 * Base interface for all event log entries
 */
export interface EventLogEntry {
  id: string;                    // Unique event identifier
  timestamp: number;             // Event timestamp (milliseconds since epoch)
  pageId: string;                // Associated page ID
  eventType: EventType;          // High-level event category
  source: string;                // Source of the event (tool name, browser, etc.)
  data: any;                     // Event-specific data payload
  metadata: EventMetadata;       // Additional context and metadata
}

/**
 * Metadata common to all events
 */
export interface EventMetadata {
  url?: string;                  // Current page URL
  title?: string;                // Page title
  selector?: string;             // CSS selector for DOM-related events
  status?: number;               // HTTP status code for network events
  duration?: number;             // Event duration in milliseconds
  error?: string;                // Error message if applicable
  userAgent?: string;            // Browser user agent
  viewport?: ViewportInfo;       // Viewport dimensions
  performance?: PerformanceInfo; // Performance metrics
}

/**
 * Viewport information
 */
export interface ViewportInfo {
  width: number;
  height: number;
  deviceScaleFactor?: number;
}

/**
 * Performance metrics
 */
export interface PerformanceInfo {
  memoryUsage?: number;          // Memory usage in bytes
  cpuUsage?: number;             // CPU usage percentage
  networkLatency?: number;       // Network latency in milliseconds
}

/**
 * LLM Action specific data
 */
export interface LLMActionData {
  actionType: LLMActionType;
  toolName?: string;             // Name of the tool invoked
  parameters?: any;              // Tool input parameters
  result?: any;                  // Tool execution result
  executionTime?: number;        // Tool execution duration
  errorDetails?: any;            // Detailed error information
}

/**
 * DOM Change specific data
 */
export interface DOMChangeData {
  changeType: DOMChangeType;
  elementId?: string;            // Element identifier
  tagName?: string;              // HTML tag name
  attributes?: Record<string, string>; // Element attributes
  oldValue?: any;                // Previous value (for changes)
  newValue?: any;                // New value (for changes)
  parentSelector?: string;       // Parent element selector
}

/**
 * Network Event specific data
 */
export interface NetworkEventData {
  eventType: NetworkEventType;
  url: string;                   // Request URL
  method?: string;               // HTTP method (GET, POST, etc.)
  statusCode?: number;           // HTTP status code
  headers?: Record<string, string>; // Request/response headers
  bodySize?: number;             // Request/response body size
  timing?: NetworkTiming;        // Network timing information
}

/**
 * Network timing information
 */
export interface NetworkTiming {
  startTime: number;
  endTime: number;
  dnsLookup?: number;
  tcpConnection?: number;
  sslHandshake?: number;
  requestSent?: number;
  waiting?: number;
  contentDownload?: number;
}

/**
 * Console Event specific data
 */
export interface ConsoleEventData {
  eventType: ConsoleEventType;
  message: string;               // Console message
  args?: any[];                  // Additional console arguments
  stackTrace?: string;           // Stack trace for errors
  lineNumber?: number;           // Source line number
  columnNumber?: number;         // Source column number
}

/**
 * Browser Event specific data
 */
export interface BrowserEventData {
  eventType: BrowserEventType;
  fromUrl?: string;              // Previous URL (for navigation)
  toUrl?: string;                // Target URL (for navigation)
  loadTime?: number;             // Page load time
  domContentLoadedTime?: number; // DOM content loaded time
  visibilityState?: string;      // Page visibility state
  viewportSize?: ViewportInfo;   // New viewport size
}

/**
 * Filter criteria for querying events
 */
export interface EventFilter {
  startTime?: number;            // Start timestamp (inclusive)
  endTime?: number;              // End timestamp (exclusive)
  eventTypes?: EventType[];      // Filter by event types
  pageIds?: string[];            // Filter by page IDs
  sources?: string[];            // Filter by event sources
  metadata?: MetadataFilter;     // Filter by metadata fields
  limit?: number;                // Maximum number of events to return
  offset?: number;               // Number of events to skip (for pagination)
}

/**
 * Metadata filtering criteria
 */
export interface MetadataFilter {
  url?: string;                  // Filter by URL
  selector?: string;             // Filter by selector
  status?: number;               // Filter by status code
  hasError?: boolean;            // Filter by error presence
}

/**
 * Query result structure
 */
export interface EventQueryResult {
  events: EventLogEntry[];       // Filtered events
  totalCount: number;            // Total events matching filter (before pagination)
  filteredCount: number;         // Number of events after filtering
  timeRange: TimeRange;          // Time range of returned events
  hasMore: boolean;              // Whether more events are available
}

/**
 * Time range information
 */
export interface TimeRange {
  start: number;                 // Earliest event timestamp
  end: number;                   // Latest event timestamp
}

/**
 * Event logger configuration
 */
export interface EventLoggerConfig {
  maxEvents: number;             // Maximum events to store
  retentionPeriod: number;       // How long to keep events (ms)
  enabledEventTypes: EventType[]; // Which event types to capture
  cleanupInterval: number;       // How often to clean up old events (ms)
}