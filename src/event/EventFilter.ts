import { EventLogEntry, EventFilter as EventFilterType, EventQueryResult, EventType } from './types.js';
import { EventLogger } from './EventLogger.js';

/**
 * Utility class for filtering and querying event logs across multiple pages
 * Handles queries across multiple page-specific EventLoggers
 */
export class EventFilter {
  /**
   * Query events across multiple page EventLoggers
   * @param eventLoggers - Map of pageId to EventLogger instances
   * @param filter - Filter criteria
   * @returns Combined and filtered events from all relevant pages
   */
  public static async queryMultipleLoggers(
    eventLoggers: Map<string, EventLogger>,
    filter: EventFilterType
  ): Promise<EventQueryResult> {
    // Collect events from all relevant page loggers
    const allEvents: EventLogEntry[] = [];
    let totalCount = 0;

    // Filter by specified pageIds if provided
    const targetPageIds = filter.pageIds && filter.pageIds.length > 0
      ? filter.pageIds
      : Array.from(eventLoggers.keys());

    // Get events from each target page logger
    for (const pageId of targetPageIds) {
      const logger = eventLoggers.get(pageId);
      if (logger) {
        const pageResult = await logger.queryEvents(filter);
        if (pageResult && Array.isArray(pageResult.events)) {
          allEvents.push(...pageResult.events);
          totalCount += typeof pageResult.totalCount === 'number' ? pageResult.totalCount : pageResult.events.length;
        }
      }
    }

    // Apply global filtering and sorting
    const filteredEvents = EventFilter.applyFilter(allEvents, filter);

    // Return unified query result
    return EventFilter.createQueryResult(filteredEvents, filter, totalCount || allEvents.length);
  }

  /**
   * Apply filter criteria to event array
   * @param events - Array of events to filter
   * @param filter - Filter criteria
   * @returns Filtered events
   */
  public static applyFilter(events: EventLogEntry[], filter: EventFilterType): EventLogEntry[] {
    let filteredEvents = events;

    // Filter by time range
    filteredEvents = EventFilter.filterByTimeRange(filteredEvents, filter.startTime, filter.endTime);

    // Filter by event types
    filteredEvents = EventFilter.filterByEventType(filteredEvents, filter.eventTypes);

    // Filter by sources
    filteredEvents = EventFilter.filterBySource(filteredEvents, filter.sources);

    // Filter by metadata
    filteredEvents = EventFilter.filterByMetadata(filteredEvents, filter.metadata);

    // Sort events chronologically
    filteredEvents = EventFilter.sortEvents(filteredEvents);

    // Apply pagination
    filteredEvents = EventFilter.applyPagination(filteredEvents, filter.limit, filter.offset);

    return filteredEvents;
  }

  /**
   * Create query result with metadata
   * @param events - Filtered events
   * @param filter - Applied filter criteria
   * @param totalCount - Total events before filtering
   * @returns Structured query result
   */
  public static createQueryResult(
    events: EventLogEntry[],
    filter: EventFilterType,
    totalCount: number
  ): EventQueryResult {
    // Calculate time range of returned events
    let timeRange = { start: 0, end: 0 };
    if (events.length > 0) {
      const timestamps = events.map(event => event.timestamp);
      timeRange = {
        start: Math.min(...timestamps),
        end: Math.max(...timestamps)
      };
    }

    // Determine if more events are available
    const hasMore = filter.limit ? events.length >= filter.limit : false;

    // Create result object with metadata
    return {
      events,
      totalCount,
      filteredCount: events.length,
      timeRange,
      hasMore
    };
  }

  /**
   * Parse filter from query parameters
   * @param params - Query parameters (from URL or request)
   * @returns Structured filter object
   */
  public static parseFilter(params: Record<string, any>): EventFilterType {
    // TODO: Parse time range parameters
    // TODO: Parse event type array
    // TODO: Parse page ID array
    // TODO: Parse source array
    // TODO: Parse metadata filters
    // TODO: Parse pagination parameters
    // TODO: Validate and normalize filter
    return {};
  }

  /**
   * Validate filter criteria
   * @param filter - Filter to validate
   * @throws Error if filter is invalid
   */
  public static validateFilter(filter: EventFilterType): void {
    // TODO: Validate time range (startTime <= endTime)
    // TODO: Validate event types are valid
    // TODO: Validate limit and offset are positive
    // TODO: Validate metadata filter structure
  }

  /**
   * Get events within time range
   * @param events - Events to filter
   * @param startTime - Start timestamp
   * @param endTime - End timestamp
   * @returns Events within time range
   */
  private static filterByTimeRange(
    events: EventLogEntry[],
    startTime?: number,
    endTime?: number
  ): EventLogEntry[] {
    return events.filter(event => {
      const timestamp = event.timestamp;
      const afterStart = startTime ? timestamp >= startTime : true;
      const beforeEnd = endTime ? timestamp < endTime : true;
      return afterStart && beforeEnd;
    });
  }

  /**
   * Filter events by type
   * @param events - Events to filter
   * @param eventTypes - Event types to include
   * @returns Filtered events
   */
  private static filterByEventType(
    events: EventLogEntry[],
    eventTypes?: EventType[]
  ): EventLogEntry[] {
    if (!eventTypes || eventTypes.length === 0) {
      return events;
    }
    return events.filter(event => eventTypes.includes(event.eventType));
  }

  /**
   * Filter events by page ID
   * @param events - Events to filter
   * @param pageIds - Page IDs to include
   * @returns Filtered events
   */
  private static filterByPageId(
    events: EventLogEntry[],
    pageIds?: string[]
  ): EventLogEntry[] {
    // TODO: Return all events if no page IDs specified
    // TODO: Filter events matching specified page IDs
    // TODO: Return filtered events
    return events;
  }

  /**
   * Filter events by source
   * @param events - Events to filter
   * @param sources - Sources to include
   * @returns Filtered events
   */
  private static filterBySource(
    events: EventLogEntry[],
    sources?: string[]
  ): EventLogEntry[] {
    if (!sources || sources.length === 0) {
      return events;
    }
    return events.filter(event => sources.includes(event.source));
  }

  /**
   * Filter events by metadata criteria
   * @param events - Events to filter
   * @param metadataFilter - Metadata filter criteria
   * @returns Filtered events
   */
  private static filterByMetadata(
    events: EventLogEntry[],
    metadataFilter?: any
  ): EventLogEntry[] {
    if (!metadataFilter) {
      return events;
    }

    return events.filter(event => {
      const metadata = event.metadata;

      // Apply URL filter if specified
      if (metadataFilter.url && metadata.url !== metadataFilter.url) {
        return false;
      }

      // Apply selector filter if specified
      if (metadataFilter.selector && metadata.selector !== metadataFilter.selector) {
        return false;
      }

      // Apply status filter if specified
      if (metadataFilter.status !== undefined && metadata.status !== metadataFilter.status) {
        return false;
      }

      // Apply error filter if specified
      if (metadataFilter.hasError !== undefined) {
        const hasError = !!metadata.error;
        if (metadataFilter.hasError !== hasError) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Apply pagination to events
   * @param events - Events to paginate
   * @param limit - Maximum events to return
   * @param offset - Number of events to skip
   * @returns Paginated events
   */
  private static applyPagination(
    events: EventLogEntry[],
    limit?: number,
    offset?: number
  ): EventLogEntry[] {
    const start = offset || 0;
    const end = limit ? start + limit : events.length;
    return events.slice(start, end);
  }

  /**
   * Sort events chronologically
   * @param events - Events to sort
   * @returns Sorted events (oldest first)
   */
  private static sortEvents(events: EventLogEntry[]): EventLogEntry[] {
    return events.sort((a, b) => a.timestamp - b.timestamp);
  }
}