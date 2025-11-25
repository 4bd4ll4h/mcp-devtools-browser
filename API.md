# API Reference

## Overview

Puppeteer Developer Browser MCP provides a comprehensive set of tools and resources for browser automation and web scraping. This document describes all available MCP tools and their usage.

## Tool Categories

### Browser Control Tools

#### `open_page`
Opens a new browser page.

**Parameters:**
- `url` (string, optional): URL to navigate to immediately

**Returns:**
- `pageId` (string): Unique identifier for the created page
- `url` (string): Current page URL

**Example:**
```json
{
  "name": "open_page",
  "arguments": {
    "url": "https://example.com"
  }
}
```

#### `list_pages`
Lists all currently open pages.

**Parameters:** None

**Returns:**
- `pages` (array): List of page objects with `pageId` and `url`

#### `navigate`
Navigates a page to a specific URL.

**Parameters:**
- `pageId` (string): Target page identifier
- `url` (string): URL to navigate to

**Returns:**
- `success` (boolean): Navigation status
- `finalUrl` (string): Final URL after navigation

#### `close_page`
Closes a specific page.

**Parameters:**
- `pageId` (string): Page identifier to close

**Returns:**
- `success` (boolean): Close operation status

#### `reload_page`
Reloads the current page.

**Parameters:**
- `pageId` (string): Page identifier to reload

**Returns:**
- `success` (boolean): Reload status

#### `go_back`
Navigates back in browser history.

**Parameters:**
- `pageId` (string): Target page identifier

**Returns:**
- `success` (boolean): Navigation status

#### `go_forward`
Navigates forward in browser history.

**Parameters:**
- `pageId` (string): Target page identifier

**Returns:**
- `success` (boolean): Navigation status

### User Interaction Tools

#### `click`
Clicks on an element matching the selector.

**Parameters:**
- `pageId` (string): Target page identifier
- `selector` (string): CSS selector for the element
- `waitForNavigation` (boolean, optional): Wait for navigation after click

**Returns:**
- `success` (boolean): Click operation status

#### `type`
Types text into an input element.

**Parameters:**
- `pageId` (string): Target page identifier
- `selector` (string): CSS selector for the input element
- `text` (string): Text to type
- `clear` (boolean, optional): Clear input before typing

**Returns:**
- `success` (boolean): Type operation status

#### `press_key`
Presses a keyboard key.

**Parameters:**
- `pageId` (string): Target page identifier
- `key` (string): Key to press (e.g., "Enter", "Tab", "Escape")

**Returns:**
- `success` (boolean): Key press status

#### `hover`
Hovers over an element.

**Parameters:**
- `pageId` (string): Target page identifier
- `selector` (string): CSS selector for the element

**Returns:**
- `success` (boolean): Hover operation status

#### `scroll`
Scrolls the page by a specified amount.

**Parameters:**
- `pageId` (string): Target page identifier
- `amount` (number): Pixels to scroll (positive for down, negative for up)

**Returns:**
- `success` (boolean): Scroll operation status

#### `scroll_to_bottom`
Scrolls to the bottom of the page.

**Parameters:**
- `pageId` (string): Target page identifier
- `timeout` (number, optional): Maximum time to wait for scrolling

**Returns:**
- `success` (boolean): Scroll operation status

### Inspection Tools

#### `get_tree`
Gets an accessibility-focused DOM tree.

**Parameters:**
- `pageId` (string): Target page identifier
- `maxDepth` (number, optional): Maximum depth for tree traversal

**Returns:**
- `tree` (object): Structured DOM tree with accessibility information

#### `get_screenshot`
Captures a screenshot of the page.

**Parameters:**
- `pageId` (string): Target page identifier
- `fullPage` (boolean, optional): Capture full page or just viewport

**Returns:**
- `screenshot` (string): Base64 encoded image data

#### `get_css`
Extracts CSS styles from the page.

**Parameters:**
- `pageId` (string): Target page identifier
- `selector` (string, optional): Specific selector to extract styles for

**Returns:**
- `css` (object): Structured CSS information

#### `get_dom`
Extracts structured DOM information.

**Parameters:**
- `pageId` (string): Target page identifier
- `selector` (string, optional): Specific DOM element to extract

**Returns:**
- `dom` (object): Structured DOM representation

#### `get_markdown`
Converts page content to Markdown format.

**Parameters:**
- `pageId` (string): Target page identifier

**Returns:**
- `markdown` (string): Page content in Markdown format

#### `get_event_log`
Gets the event log for a session.

**Parameters:**
- `pageId` (string): Target page identifier
- `filter` (string, optional): Filter events by type

**Returns:**
- `events` (array): List of logged events

#### `execute_js`
Executes JavaScript code in the page context.

**Parameters:**
- `pageId` (string): Target page identifier
- `code` (string): JavaScript code to execute

**Returns:**
- `result` (any): Result of JavaScript execution

## Resources

### `css`
Provides CSS styles for a page.

**Parameters:**
- `pageId` (string): Target page identifier

### `dom`
Provides structured DOM information.

**Parameters:**
- `pageId` (string): Target page identifier

### `markdown`
Provides page content in Markdown format.

**Parameters:**
- `pageId` (string): Target page identifier

### `screenshot`
Provides page screenshots.

**Parameters:**
- `pageId` (string): Target page identifier

### `event_log`
Provides event logs for debugging.

**Parameters:**
- `pageId` (string): Target page identifier

## Error Handling

All tools return structured error responses when operations fail:

```json
{
  "error": {
    "type": "ErrorType",
    "message": "Human-readable error message",
    "details": {
      "additional": "context"
    }
  }
}
```

### Common Error Types

- `SelectorNotFound`: Element matching selector not found
- `NavigationTimeout`: Page navigation timed out
- `InvalidPageId`: Provided page ID does not exist
- `BrowserError`: General browser automation error
- `NetworkError`: Network-related operation failed

## Best Practices

### Selector Stability

- Prefer `data-*` attributes over CSS classes
- Use semantic HTML elements when possible
- Avoid auto-generated class names and IDs
- Test selectors across multiple page loads

### Performance Considerations

- Use `maxDepth` parameter to limit DOM tree size
- Capture screenshots only when necessary
- Close unused pages to free resources
- Use event filtering to reduce log noise

### Memory Management

- Pages are automatically cleaned up after inactivity
- Browser instances are reused across operations
- Large DOM trees are chunked to prevent memory issues

## Examples

### Complete Workflow

```json
{
  "tools": [
    {
      "name": "open_page",
      "arguments": {
        "url": "https://example.com"
      }
    },
    {
      "name": "get_tree",
      "arguments": {
        "pageId": "page-123",
        "maxDepth": 3
      }
    },
    {
      "name": "click",
      "arguments": {
        "pageId": "page-123",
        "selector": "a.more-info",
        "waitForNavigation": true
      }
    }
  ]
}
```

### Error Handling Example

```json
{
  "error": {
    "type": "SelectorNotFound",
    "message": "Element with selector '.nonexistent' not found",
    "details": {
      "selector": ".nonexistent",
      "pageId": "page-123"
    }
  }
}
```