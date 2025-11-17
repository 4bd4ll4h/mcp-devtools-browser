import { z } from "zod";

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

/**
 * Schema for get_event_log resource
 */

export const getEventLogInputSchema = z.object({
  startTime: z.number().optional(),                    // Start timestamp (milliseconds since epoch)
  endTime: z.number().optional(),                      // End timestamp (milliseconds since epoch)
  eventTypes: z.array(z.enum([
    'llm_action',
    'dom_change',
    'network',
    'console',
    'browser'
  ])).optional(),                                      // Filter by event types
  pageIds: z.array(z.string()).optional(),             // Filter by page IDs
  sources: z.array(z.string()).optional(),             // Filter by event sources
  metadata: z.object({
    url: z.string().optional(),                        // Filter by URL
    selector: z.string().optional(),                   // Filter by selector
    status: z.number().optional(),                     // Filter by status code
    hasError: z.boolean().optional(),                  // Filter by error presence
  }).optional(),                                       // Filter by metadata fields
  limit: z.number().min(1).max(1000).optional(),       // Maximum events to return (1-1000)
  offset: z.number().min(0).optional(),                // Number of events to skip
});

export type GetEventLogArgs = z.infer<typeof getEventLogInputSchema>;

// Event log entry schema for response
export const eventLogEntrySchema = z.object({
  id: z.string(),                                      // Unique event identifier
  timestamp: z.number(),                               // Event timestamp
  pageId: z.string(),                                  // Associated page ID
  eventType: z.enum([
    'llm_action',
    'dom_change',
    'network',
    'console',
    'browser'
  ]),                                                  // Event category
  source: z.string(),                                  // Event source
  data: z.any(),                                       // Event-specific data
  metadata: z.object({
    url: z.string().optional(),                        // Page URL
    title: z.string().optional(),                      // Page title
    selector: z.string().optional(),                   // CSS selector
    status: z.number().optional(),                     // HTTP status
    duration: z.number().optional(),                   // Event duration
    error: z.string().optional(),                      // Error message
    userAgent: z.string().optional(),                  // Browser user agent
    viewport: z.object({
      width: z.number(),
      height: z.number(),
      deviceScaleFactor: z.number().optional(),
    }).optional(),                                     // Viewport info
    performance: z.object({
      memoryUsage: z.number().optional(),
      cpuUsage: z.number().optional(),
      networkLatency: z.number().optional(),
    }).optional(),                                     // Performance metrics
  }),
});

export const getEventLogOutputSchema = z.object({
  events: z.array(eventLogEntrySchema),                // Filtered events
  metadata: z.object({
    totalCount: z.number(),                            // Total events matching filter
    filteredCount: z.number(),                         // Events after filtering
    timeRange: z.object({
      start: z.number(),                               // Earliest event timestamp
      end: z.number(),                                 // Latest event timestamp
    }),
    hasMore: z.boolean(),                              // More events available
    query: z.object({
      startTime: z.number().optional(),
      endTime: z.number().optional(),
      eventTypes: z.array(z.string()).optional(),
      pageIds: z.array(z.string()).optional(),
      sources: z.array(z.string()).optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }),                                                // Applied query parameters
  }),
});

export type GetEventLogResult = z.infer<typeof getEventLogOutputSchema>;