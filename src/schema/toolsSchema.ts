import { z } from "zod";
import { EventType } from "../event/types.js";

export const openPageOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  status: z.number(),
});

export type OpenPageResult = z.infer<typeof openPageOutputSchema>;


export const openPageInputSchema =  z.object({
  url: z.string().url(),
  waitUntil: z.enum(["load", "domcontentloaded", "networkidle0", "networkidle2"]).optional(),
  timeoutMs: z.number().optional(),
});

export type OpenPageArgs = z.infer<typeof openPageInputSchema>;

// List Pages schemas
export const listPagesOutputSchema = z.object({
  pages: z.array(z.object({
    pageId: z.string(),
    url: z.string(),
    title: z.string().nullable(),
    lastActivity: z.number(),
  })),
});

export type ListPagesResult = z.infer<typeof listPagesOutputSchema>;

export const listPagesInputSchema = z.object({});

export type ListPagesArgs = z.infer<typeof listPagesInputSchema>;

// Reload Page schemas
export const reloadPageInputSchema = z.object({
  pageId: z.string(),
  waitUntil: z.enum(["load", "domcontentloaded", "networkidle0", "networkidle2"]).optional(),
  timeoutMs: z.number().optional(),
});

export type ReloadPageArgs = z.infer<typeof reloadPageInputSchema>;

export const reloadPageOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  status: z.number(),
});

export type ReloadPageResult = z.infer<typeof reloadPageOutputSchema>;

export function structuredResponse(data: any) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function textResponse(message: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: message,
      },
    ],
  };
}

// Close Page schemas
export const closePageInputSchema = z.object({
  pageId: z.string(),
});

export type ClosePageArgs = z.infer<typeof closePageInputSchema>;

export const closePageOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ClosePageResult = z.infer<typeof closePageOutputSchema>;

// Navigate schemas
export const navigateInputSchema = z.object({
  pageId: z.string(),
  url: z.string().url(),
  waitUntil: z.enum(["load", "domcontentloaded", "networkidle0", "networkidle2"]).optional(),
  timeoutMs: z.number().optional(),
});

export type NavigateArgs = z.infer<typeof navigateInputSchema>;

export const navigateOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  status: z.number(),
});

export type NavigateResult = z.infer<typeof navigateOutputSchema>;

// Go Back schemas
export const goBackInputSchema = z.object({
  pageId: z.string(),
});

export type GoBackArgs = z.infer<typeof goBackInputSchema>;

export const goBackOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  success: z.boolean(),
});

export type GoBackResult = z.infer<typeof goBackOutputSchema>;

// Go Forward schemas
export const goForwardInputSchema = z.object({
  pageId: z.string(),
});

export type GoForwardArgs = z.infer<typeof goForwardInputSchema>;

export const goForwardOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  success: z.boolean(),
});

export type GoForwardResult = z.infer<typeof goForwardOutputSchema>;

// Click schemas
export const clickInputSchema = z.object({
  pageId: z.string(),
  selector: z.string(),
  waitForNavigation: z.boolean().optional(),
  timeoutMs: z.number().optional(),
});

export type ClickArgs = z.infer<typeof clickInputSchema>;

export const clickOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  success: z.boolean(),
});

export type ClickResult = z.infer<typeof clickOutputSchema>;

// Type schemas
export const typeInputSchema = z.object({
  pageId: z.string(),
  selector: z.string(),
  text: z.string(),
  delayMs: z.number().optional(),
  clear: z.boolean().optional(),
});

export type TypeArgs = z.infer<typeof typeInputSchema>;

export const typeOutputSchema = z.object({
  pageId: z.string(),
  success: z.boolean(),
});

export type TypeResult = z.infer<typeof typeOutputSchema>;

// PressKey schemas
export const pressKeyInputSchema = z.object({
  pageId: z.string(),
  key: z.enum([
    "Enter", "Escape", "Tab", "Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
    "Backspace", "Delete", "Home", "End", "PageUp", "PageDown", "F1", "F2", "F3", "F4",
    "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"
  ]),
});

export type PressKeyArgs = z.infer<typeof pressKeyInputSchema>;

export const pressKeyOutputSchema = z.object({
  pageId: z.string(),
  success: z.boolean(),
});

export type PressKeyResult = z.infer<typeof pressKeyOutputSchema>;

// Scroll schemas
export const scrollInputSchema = z.object({
  pageId: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  selector: z.string().optional(),
});

export type ScrollArgs = z.infer<typeof scrollInputSchema>;

export const scrollOutputSchema = z.object({
  pageId: z.string(),
  success: z.boolean(),
});

export type ScrollResult = z.infer<typeof scrollOutputSchema>;

// ScrollToBottom schemas
export const scrollToBottomInputSchema = z.object({
  pageId: z.string(),
  timeoutMs: z.number().optional(),
});

export type ScrollToBottomArgs = z.infer<typeof scrollToBottomInputSchema>;

export const scrollToBottomOutputSchema = z.object({
  pageId: z.string(),
  success: z.boolean(),
});

export type ScrollToBottomResult = z.infer<typeof scrollToBottomOutputSchema>;

// Hover schemas
export const hoverInputSchema = z.object({
  pageId: z.string(),
  selector: z.string(),
});

export type HoverArgs = z.infer<typeof hoverInputSchema>;

export const hoverOutputSchema = z.object({
  pageId: z.string(),
  success: z.boolean(),
});

export type HoverResult = z.infer<typeof hoverOutputSchema>;

// Get Tree schemas
export const getTreeInputSchema = z.object({
  pageId: z.string(),
  maxDepth: z.number().optional().default(10),
  includeHidden: z.boolean().optional().default(false),
});

export type GetTreeArgs = z.infer<typeof getTreeInputSchema>;

// Enhanced tree node schema with selectors and identifiers
const treeNodeSchemaBase = {
  tag: z.string(),
  role: z.string(),
  name: z.string().optional(),
  value: z.string().optional(),
  description: z.string().optional(),
  state: z.record(z.any()).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  selectors: z.object({
    css: z.string(),
    xpath: z.string().optional(),
  }),
  isInteractive: z.boolean(),
  isFocusable: z.boolean(),
  hasAria: z.boolean(),
  boundingBox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
  children: z.array(z.any()).optional(),
};

export const treeNodeSchema = z.object(treeNodeSchemaBase);

export const getTreeOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  tree: treeNodeSchema,
});

export type GetTreeResult = z.infer<typeof getTreeOutputSchema>;

// Get Screenshot schemas
export const getScreenshotInputSchema = z.object({
  pageId: z.string(),
  format: z.enum(["png", "jpeg"]).optional().default("png"),
  quality: z.number().min(0).max(100).optional().default(80),
  fullPage: z.boolean().optional().default(false),
  selector: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type GetScreenshotArgs = z.infer<typeof getScreenshotInputSchema>;

export const getScreenshotOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  format: z.enum(["png", "jpeg"]),
  data: z.string(), // base64 encoded image data
  width: z.number(),
  height: z.number(),
});

export type GetScreenshotResult = z.infer<typeof getScreenshotOutputSchema>;

// Get CSS schemas
export const getCssInputSchema = z.object({
  pageId: z.string(),
  selector: z.string().optional(), // Optional: get CSS for specific element
  includeComputed: z.boolean().optional().default(false), // Include computed styles
});

export type GetCssArgs = z.infer<typeof getCssInputSchema>;

export const getCssOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  css: z.string(), // CSS text content
  selector: z.string().optional(),
  styles: z.record(z.string(), z.string()).optional(), // Computed styles if requested
});

export type GetCssResult = z.infer<typeof getCssOutputSchema>;

// Get DOM schemas
export const getDomInputSchema = z.object({
  pageId: z.string(),
  selector: z.string().optional(), // Optional: get DOM for specific element(s)
  includeAttributes: z.boolean().optional().default(true), // Include element attributes
  includeText: z.boolean().optional().default(true), // Include text content
  includeChildren: z.boolean().optional().default(true), // Include child elements
});

export type GetDomArgs = z.infer<typeof getDomInputSchema>;

export const getDomOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  dom: z.any(), // Structured DOM tree
  selector: z.string().optional(),
  elementCount: z.number().optional(), // Number of elements returned
});

export type GetDomResult = z.infer<typeof getDomOutputSchema>;

// Get Markdown schemas
export const getMarkdownInputSchema = z.object({
  pageId: z.string(),
  selector: z.string().optional(), // Optional: convert specific element to markdown
  includeImages: z.boolean().optional().default(true), // Include images as markdown
  includeLinks: z.boolean().optional().default(true), // Include links as markdown
  includeHeadings: z.boolean().optional().default(true), // Include heading structure
  includeLists: z.boolean().optional().default(true), // Include lists
  includeTables: z.boolean().optional().default(true), // Include tables
  includeCode: z.boolean().optional().default(true), // Include code blocks
  stripTags: z.array(z.string()).optional().default([]), // Tags to strip completely
  convertNewlines: z.boolean().optional().default(true), // Convert <br> to newlines
});

export type GetMarkdownArgs = z.infer<typeof getMarkdownInputSchema>;

export const getMarkdownOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  markdown: z.string(), // Markdown text content
  selector: z.string().optional(),
  wordCount: z.number().optional(), // Word count of converted content
  characterCount: z.number().optional(), // Character count of converted content
});

export type GetMarkdownResult = z.infer<typeof getMarkdownOutputSchema>;

// Get Event Log schemas
export const getEventLogInputSchema = z.object({
  pageIds: z.array(z.string()).optional(), // Filter by specific page IDs
  startTime: z.number().optional(), // Start timestamp (inclusive)
  endTime: z.number().optional(), // End timestamp (exclusive)
  eventTypes: z.array(z.enum(['llm_action', 'dom_change', 'network', 'console', 'browser'])).optional(), // Filter by event types
  sources: z.array(z.enum(['dom_mutation', 'network_monitor', 'console_monitor', 'browser_monitor' ])).optional(), // Filter by event sources
  limit: z.number().optional(), // Maximum number of events to return
  offset: z.number().optional(), // Number of events to skip (for pagination)
});

export type GetEventLogArgs = z.infer<typeof getEventLogInputSchema>;

export const getEventLogOutputSchema = z.object({
  events: z.array(z.object({
    id: z.string(), // Unique event identifier
    timestamp: z.number(), // Event timestamp (milliseconds since epoch)
    pageId: z.string(), // Associated page ID
    eventType: z.enum(['llm_action', 'dom_change', 'network', 'console', 'browser']), // High-level event category
    source: z.string(), // Source of the event (tool name, browser, etc.)
    data: z.any(), // Event-specific data payload
    metadata: z.object({
      url: z.string().optional(), // Current page URL
      title: z.string().optional(), // Page title
      selector: z.string().optional(), // CSS selector for DOM-related events
      status: z.number().optional(), // HTTP status code for network events
      duration: z.number().optional(), // Event duration in milliseconds
      error: z.string().optional(), // Error message if applicable
    }),
  })),
  metadata: z.object({
    totalCount: z.number(), // Total events matching filter
    filteredCount: z.number(), // Events after filtering
    timeRange: z.object({
      start: z.number(), // Earliest event timestamp
      end: z.number(), // Latest event timestamp
    }),
    hasMore: z.boolean(), // More events available
    query: z.object({
      startTime: z.number().optional(),
      endTime: z.number().optional(),
      eventTypes: z.array(z.enum(['llm_action', 'dom_change', 'network', 'console', 'browser'])).optional(),
      pageIds: z.array(z.string()).optional(),
      sources: z.array(z.string()).optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }), // Applied query parameters
  }),
});

export type GetEventLogResult = z.infer<typeof getEventLogOutputSchema>;

export function errorResponse(err: any) {
  return {
    content: [
      {
        type: "text" as const,
        text: `Error: ${err instanceof Error ? err.message : String(err)}`,
      },
    ],
  };
}
