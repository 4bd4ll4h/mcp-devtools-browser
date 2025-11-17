import { BrowserManager } from "../../../browser/BrowserManager.js";
import { GetEventLogArgs, GetEventLogResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";
import { EventFilter } from "../../../event/EventFilter.js";
import { EventLogger } from "../../../event/EventLogger.js";
import { EventType } from "../../../event/types.js";

/**
 * Handler for get_event_log tool
 * Provides filtered access to browser session event logs across all pages
 */
export async function getEventLogHandler(args: GetEventLogArgs): Promise<GetEventLogResult> {
  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation('system', 'get_event_log', args);

  try {
    // Get all page EventLoggers from BrowserManager
    const allPages = browserManager.getAllPages();
    const eventLoggers = new Map<string, EventLogger>();

    // Populate eventLoggers map with pageId -> EventLogger
    allPages.forEach(trackedPage => {
      eventLoggers.set(trackedPage.id, trackedPage.eventLogger);
    });

    // Convert filter parameters to EventFilter format
    const filter = {
      startTime: args.startTime,
      endTime: args.endTime,
      eventTypes: args.eventTypes,
      pageIds: args.pageIds,
      sources: args.sources,
      limit: args.limit,
      offset: args.offset
    };

    // Get events from all page loggers using EventFilter
    const queryResult = EventFilter.queryMultipleLoggers(eventLoggers, filter);

    // Format events for response
    const formattedEvents = formatEventsForResponse((await queryResult).events);

    const result = {
      events: formattedEvents,
      metadata: {
        totalCount: (await queryResult).totalCount,
        filteredCount: (await queryResult).filteredCount,
        timeRange: (await queryResult).timeRange,
        hasMore: (await queryResult).hasMore,
        query: {
          startTime: args.startTime,
          endTime: args.endTime,
          eventTypes: args.eventTypes,
          pageIds: args.pageIds,
          sources: args.sources,
          limit: args.limit,
          offset: args.offset
        }
      }
    };

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult('system', 'get_event_log', {
      totalEvents: result.metadata.totalCount,
      filteredEvents: result.metadata.filteredCount,
      timeRange: result.metadata.timeRange,
      hasMore: result.metadata.hasMore
    }, executionTime);

    return result;
  } catch (error: any) {
    const executionTime = Date.now() - startTime;

    // Record tool error event
    await browserManagerExtensions.recordToolError('system', 'get_event_log', error, executionTime);

    console.error(`❌ Failed to get event log:`, error.message);
    throw new Error(`Failed to get event log: ${error.message}`);
  }
}

/**
 * Format events for response
 * @param events - Raw event log entries
 * @returns Formatted events for API response
 */
function formatEventsForResponse(events: any[]): any[] {
  return events.map(event => ({
    id: event.id,
    timestamp: event.timestamp,
    pageId: event.pageId,
    eventType: event.eventType,
    source: event.source,
    data: event.data,
    metadata: {
      url: event.metadata?.url,
      title: event.metadata?.title,
      selector: event.metadata?.selector,
      status: event.metadata?.status,
      duration: event.metadata?.duration,
      error: event.metadata?.error,
    }
  }));
}