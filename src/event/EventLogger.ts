import { Mutex } from 'async-mutex';
import * as crypto from 'crypto';
import { EventLogEntry, EventFilter as EventFilterType, EventQueryResult } from './types.js';

/**
 * Page-specific event logger for managing browser session event logging
 * Each page gets its own EventLogger instance for better separation and cleanup
 */
export class EventLogger {
  private events: EventLogEntry[] = [];
  private maxEvents: number = 2000; // Configurable maximum events per page
  private isEnabled: boolean = true;
  private pageId: string;
  private mutex = new Mutex(); // 🔒 Mutex for thread-safe operations

  constructor(pageId: string) {
    this.pageId = pageId;
    // Event buffer initialized with empty array
    // No periodic cleanup needed - cleanup happens on buffer overflow
  }

  /**
   * Record a new event in the event log
   * @param event - The event to record
   */
  public async recordEvent(event: Omit<EventLogEntry, 'id' | 'timestamp'>): Promise<void> {
    if (!this.isEnabled) return;

    const release = await this.mutex.acquire(); // 🔒 Acquire mutex lock
    try {
      // Generate unique event ID and timestamp
      const eventEntry: EventLogEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        ...event
      };

      // Validate event structure
      if (!this.validateEvent(eventEntry)) {
        console.warn(`❌ Invalid event structure for page ${this.pageId}:`, eventEntry);
        return;
      }

      // Add event to buffer
      this.events.push(eventEntry);

      // Cleanup if buffer exceeds maximum size
      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(-this.maxEvents);
        console.warn(`📊 Event buffer for page ${this.pageId} trimmed to ${this.maxEvents} events`);
      }
    } finally {
      release(); // 🔒 Release mutex lock
    }
  }

  /**
   * Validate event structure
   * @param event - Event to validate
   * @returns Whether event is valid
   */
  private validateEvent(event: EventLogEntry): boolean {
    // Basic validation
    if (!event.id || !event.timestamp || !event.pageId || !event.eventType || !event.source) {
      return false;
    }

    // Validate event type
    const validEventTypes = ['llm_action', 'dom_change', 'network', 'console', 'browser'];
    if (!validEventTypes.includes(event.eventType)) {
      return false;
    }

    // Validate page ID matches this logger's page
    if (event.pageId !== this.pageId) {
      return false;
    }

    return true;
  }

  /**
   * Query events based on filter criteria
   * @param filter - Filter criteria for events
   * @returns Filtered and sorted events
   */
  public async queryEvents(filter: EventFilterType): Promise<EventQueryResult> {
    const release = await this.mutex.acquire(); // 🔒 Acquire mutex lock for reading
    try {
      // Work with a copy of events to avoid modification during filtering
      const eventsCopy = [...this.events];

      // Apply filtering
      let filteredEvents = eventsCopy;

      // Filter by time range
      if (filter.startTime || filter.endTime) {
        filteredEvents = filteredEvents.filter(event => {
          const matchesStart = !filter.startTime || event.timestamp >= filter.startTime;
          const matchesEnd = !filter.endTime || event.timestamp <= filter.endTime;
          return matchesStart && matchesEnd;
        });
      }

      // Filter by event type
      if (filter.eventTypes && filter.eventTypes.length > 0) {
        filteredEvents = filteredEvents.filter(event =>
          filter.eventTypes!.includes(event.eventType)
        );
      }

      // Filter by source
      if (filter.sources && filter.sources.length > 0) {
        filteredEvents = filteredEvents.filter(event =>
          filter.sources!.includes(event.source)
        );
      }

      // Apply metadata filters
      if (filter.metadata) {
        filteredEvents = filteredEvents.filter(event => {
          if (!event.metadata) return false;

          const metadata = filter.metadata!;

          // Check URL filter
          if (metadata.url && event.metadata.url !== metadata.url) {
            return false;
          }

          // Check selector filter
          if (metadata.selector && event.metadata.selector !== metadata.selector) {
            return false;
          }

          // Check status filter
          if (metadata.status && event.metadata.status !== metadata.status) {
            return false;
          }

          // Check error filter
          if (metadata.hasError !== undefined) {
            const hasError = !!event.metadata.error;
            if (metadata.hasError !== hasError) {
              return false;
            }
          }

          return true;
        });
      }

      // Sort chronologically (oldest first)
      filteredEvents.sort((a, b) => a.timestamp - b.timestamp);

      // Apply pagination
      const offset = filter.offset || 0;
      const limit = filter.limit || filteredEvents.length;
      const paginatedEvents = filteredEvents.slice(offset, offset + limit);

      // Calculate time range for returned events
      const returnedEvents = paginatedEvents.length > 0 ? paginatedEvents : filteredEvents;
      const timeRange = {
        start: returnedEvents.length > 0 ? returnedEvents[0].timestamp : Date.now(),
        end: returnedEvents.length > 0 ? returnedEvents[returnedEvents.length - 1].timestamp : Date.now()
      };

      return {
        events: paginatedEvents,
        totalCount: this.events.length,
        filteredCount: filteredEvents.length,
        timeRange,
        hasMore: offset + limit < filteredEvents.length
      };
    } finally {
      release(); // 🔒 Release mutex lock
    }
  }

  /**
   * Clear events based on filter criteria
   * @param filter - Filter criteria for events to clear
   */
  public async clearEvents(filter?: EventFilterType): Promise<void> {
    const release = await this.mutex.acquire(); // 🔒 Acquire mutex lock
    try {
      if (!filter) {
        // Clear all events if no filter provided
        this.events = [];
        return;
      }

      // Filter events to keep (inverse of clear criteria)
      const eventsToKeep = this.events.filter(event => {
        // Check time range
        if (filter.startTime && event.timestamp < filter.startTime) return true;
        if (filter.endTime && event.timestamp >= filter.endTime) return true;

        // Check event type
        if (filter.eventTypes && filter.eventTypes.length > 0 &&
            filter.eventTypes.includes(event.eventType)) {
          return false;
        }

        // Check source
        if (filter.sources && filter.sources.length > 0 &&
            filter.sources.includes(event.source)) {
          return false;
        }

        // Check metadata filters
        if (filter.metadata && event.metadata) {
          const metadata = filter.metadata;
          if (metadata.url && event.metadata.url === metadata.url) return false;
          if (metadata.selector && event.metadata.selector === metadata.selector) return false;
          if (metadata.status && event.metadata.status === metadata.status) return false;
          if (metadata.hasError !== undefined) {
            const hasError = !!event.metadata.error;
            if (metadata.hasError === hasError) return false;
          }
        }

        return true;
      });

      const clearedCount = this.events.length - eventsToKeep.length;
      this.events = eventsToKeep;

      if (clearedCount > 0) {
        console.warn(`🧹 Cleared ${clearedCount} events for page ${this.pageId}`);
      }
    } finally {
      release(); // 🔒 Release mutex lock
    }
  }

  /**
   * Get statistics about stored events
   */
  public getStatistics(): any {
    const stats = {
      totalEvents: this.events.length,
      maxEvents: this.maxEvents,
      isEnabled: this.isEnabled,
      pageId: this.pageId,
      timeRange: {
        start: this.events.length > 0 ? this.events[0].timestamp : null,
        end: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : null
      },
      eventsByType: {} as Record<string, number>,
      eventsBySource: {} as Record<string, number>,
      memoryUsage: this.calculateMemoryUsage()
    };

    // Count events by type and source
    for (const event of this.events) {
      stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1;
      stats.eventsBySource[event.source] = (stats.eventsBySource[event.source] || 0) + 1;
    }

    return stats;
  }

  /**
   * Calculate approximate memory usage of stored events
   */
  private calculateMemoryUsage(): number {
    // Rough estimate: each event takes ~1KB on average
    return this.events.length * 1024;
  }

  /**
   * Enable or disable event logging
   * @param enabled - Whether event logging should be enabled
   */
  public setEnabled(enabled: boolean): void {
    const wasEnabled = this.isEnabled;
    this.isEnabled = enabled;

    if (wasEnabled && !enabled) {
      // Clear events when disabling to free memory
      this.events = [];
      console.warn(`🔇 Event logging disabled for page ${this.pageId}, events cleared`);
    } else if (!wasEnabled && enabled) {
      console.warn(`🔊 Event logging enabled for page ${this.pageId}`);
    }
  }

  /**
   * Configure event logger settings
   * @param config - Configuration options
   */
  public configure(config: any): void {
    if (config.maxEvents !== undefined) {
      const oldMax = this.maxEvents;
      this.maxEvents = Math.max(1, config.maxEvents); // Ensure at least 1 event

      // Trim events if new max is smaller than current count
      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(-this.maxEvents);
        console.warn(`⚙️  Event buffer for page ${this.pageId} trimmed from ${oldMax} to ${this.maxEvents} events`);
      }
    }

    if (config.enabled !== undefined) {
      this.setEnabled(config.enabled);
    }

    console.warn(`⚙️  Event logger for page ${this.pageId} configured`);
  }

  /**
   * Clean up old events based on retention policy
   */
  private cleanupOldEvents(): void {
    // This method is called automatically when buffer overflows
    // No need for periodic cleanup - events are trimmed on overflow
    // This keeps the implementation simple and efficient
  }
}