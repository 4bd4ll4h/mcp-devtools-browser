# Examples and Tutorials

This document provides practical examples and tutorials for using Puppeteer Developer Browser MCP.

## Quick Start Examples

### Basic Page Navigation

```json
{
  "tools": [
    {
      "name": "open_page",
      "arguments": {
        "url": "https://httpbin.org/html"
      }
    },
    {
      "name": "get_tree",
      "arguments": {
        "pageId": "page-123",
        "maxDepth": 2
      }
    }
  ]
}
```

### Taking a Screenshot

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
      "name": "get_screenshot",
      "arguments": {
        "pageId": "page-123",
        "fullPage": true
      }
    }
  ]
}
```

## Common Use Cases

### Web Scraping Workflow

#### 1. Extract Product Information

```json
{
  "tools": [
    {
      "name": "open_page",
      "arguments": {
        "url": "https://example-store.com/products"
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
      "name": "get_markdown",
      "arguments": {
        "pageId": "page-123"
      }
    }
  ]
}
```

#### 2. Fill Out a Form

```json
{
  "tools": [
    {
      "name": "open_page",
      "arguments": {
        "url": "https://example.com/contact"
      }
    },
    {
      "name": "type",
      "arguments": {
        "pageId": "page-123",
        "selector": "input[name='name']",
        "text": "John Doe"
      }
    },
    {
      "name": "type",
      "arguments": {
        "pageId": "page-123",
        "selector": "input[name='email']",
        "text": "john@example.com"
      }
    },
    {
      "name": "click",
      "arguments": {
        "pageId": "page-123",
        "selector": "button[type='submit']"
      }
    }
  ]
}
```

### Debugging and Analysis

#### 1. Analyze Page Structure

```json
{
  "tools": [
    {
      "name": "open_page",
      "arguments": {
        "url": "https://complex-web-app.com"
      }
    },
    {
      "name": "get_dom",
      "arguments": {
        "pageId": "page-123"
      }
    },
    {
      "name": "get_css",
      "arguments": {
        "pageId": "page-123"
      }
    },
    {
      "name": "get_event_log",
      "arguments": {
        "pageId": "page-123"
      }
    }
  ]
}
```

#### 2. Monitor Network Activity

```json
{
  "tools": [
    {
      "name": "open_page",
      "arguments": {
        "url": "https://api-heavy-app.com"
      }
    },
    {
      "name": "click",
      "arguments": {
        "pageId": "page-123",
        "selector": "button.load-data"
      }
    },
    {
      "name": "get_event_log",
      "arguments": {
        "pageId": "page-123",
        "filter": "network"
      }
    }
  ]
}
```

## Advanced Scenarios

### Handling Infinite Scroll

```json
{
  "tools": [
    {
      "name": "open_page",
      "arguments": {
        "url": "https://social-media.com/feed"
      }
    },
    {
      "name": "scroll_to_bottom",
      "arguments": {
        "pageId": "page-123",
        "timeout": 10000
      }
    },
    {
      "name": "get_tree",
      "arguments": {
        "pageId": "page-123",
        "maxDepth": 2
      }
    }
  ]
}
```

### Multi-Page Workflow

```json
{
  "tools": [
    {
      "name": "open_page",
      "arguments": {
        "url": "https://news-site.com"
      }
    },
    {
      "name": "click",
      "arguments": {
        "pageId": "page-123",
        "selector": "a.article-link",
        "waitForNavigation": true
      }
    },
    {
      "name": "get_markdown",
      "arguments": {
        "pageId": "page-123"
      }
    },
    {
      "name": "go_back",
      "arguments": {
        "pageId": "page-123"
      }
    },
    {
      "name": "click",
      "arguments": {
        "pageId": "page-123",
        "selector": "a.next-article",
        "waitForNavigation": true
      }
    }
  ]
}
```

### Dynamic Content Interaction

```json
{
  "tools": [
    {
      "name": "open_page",
      "arguments": {
        "url": "https://single-page-app.com"
      }
    },
    {
      "name": "hover",
      "arguments": {
        "pageId": "page-123",
        "selector": ".menu-item"
      }
    },
    {
      "name": "click",
      "arguments": {
        "pageId": "page-123",
        "selector": ".submenu-item"
      }
    },
    {
      "name": "execute_js",
      "arguments": {
        "pageId": "page-123",
        "code": "window.scrollTo(0, document.body.scrollHeight)"
      }
    }
  ]
}
```

## Integration Examples

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "devtools-browser": {
      "command": "@4bd4ll4h/mcp-devtools-browser"
    }
  }
}
```

### With Custom MCP Client

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: '@4bd4ll4h/mcp-devtools-browser'
});

const client = new Client({
  name: 'my-client',
  version: '1.0.0'
});

await client.connect(transport);
```

## Troubleshooting

### Common Issues

#### Selector Not Found
**Problem:** `SelectorNotFound` error
**Solution:** Use `get_tree` to inspect the DOM structure and find stable selectors

```json
{
  "name": "get_tree",
  "arguments": {
    "pageId": "page-123",
    "maxDepth": 3
  }
}
```

#### Navigation Timeout
**Problem:** `NavigationTimeout` error
**Solution:** Increase timeout or check network connectivity

#### Page Not Loading
**Problem:** Page stays blank or doesn't load
**Solution:** Use `get_event_log` to debug network issues

```json
{
  "name": "get_event_log",
  "arguments": {
    "pageId": "page-123",
    "filter": "network"
  }
}
```

### Performance Tips

1. **Limit DOM Depth**: Use `maxDepth` parameter to control tree size
2. **Close Unused Pages**: Use `close_page` to free resources
3. **Use Screenshots Sparingly**: Screenshots consume significant memory
4. **Filter Events**: Use event filtering to reduce log noise

### Best Practices

1. **Start Simple**: Begin with basic navigation before complex interactions
2. **Inspect First**: Always inspect the DOM structure before interacting
3. **Handle Errors**: Implement proper error handling for robust workflows
4. **Clean Up**: Close pages when done to prevent resource leaks

## Real-World Scenarios

### E-commerce Price Monitoring

```json
{
  "tools": [
    {
      "name": "open_page",
      "arguments": {
        "url": "https://amazon.com/dp/PRODUCT_ID"
      }
    },
    {
      "name": "get_tree",
      "arguments": {
        "pageId": "page-123",
        "maxDepth": 2
      }
    },
    {
      "name": "execute_js",
      "arguments": {
        "pageId": "page-123",
        "code": "document.querySelector('.a-price-whole').innerText"
      }
    }
  ]
}
```

### News Article Extraction

```json
{
  "tools": [
    {
      "name": "open_page",
      "arguments": {
        "url": "https://news-site.com/article"
      }
    },
    {
      "name": "get_markdown",
      "arguments": {
        "pageId": "page-123"
      }
    },
    {
      "name": "get_screenshot",
      "arguments": {
        "pageId": "page-123",
        "fullPage": true
      }
    }
  ]
}
```

These examples demonstrate the flexibility and power of Puppeteer Developer Browser MCP for various web automation and scraping tasks.