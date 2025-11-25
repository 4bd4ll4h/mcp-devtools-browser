# Development Guide

This guide covers the architecture, development setup, and extension patterns for Puppeteer Developer Browser MCP.

## Architecture Overview

### Core Components

```
src/
├── browser/
│   └── BrowserManager.ts          # Singleton browser instance management
├── event/
│   ├── EventLogger.ts             # Thread-safe event logging
│   ├── BrowserManagerExtensions.ts # Event recording extensions
│   ├── EventFilter.ts             # Event filtering utilities
│   └── types.ts                   # Event type definitions
├── tools/
│   ├── toolsRegister.ts           # Main tool registration
│   ├── browserControl/            # Page management tools
│   ├── userInteractions/          # Click, type, scroll tools
│   └── inspection/                # DOM analysis tools
├── resources/
│   └── *.ts                       # Resource handlers
├── schema/
│   ├── toolsSchema.ts             # Tool input/output schemas
│   └── resourcesSchema.ts         # Resource schemas
├── config/
│   └── browserConfig.json         # Puppeteer configuration
└── helper/
    └── methods.ts                 # Utility functions
```

### Data Flow

1. **MCP Client** → **Tool/Resource Request** → **MCP Server**
2. **MCP Server** → **Tool Handler** → **BrowserManager**
3. **BrowserManager** → **Puppeteer** → **Browser Instance**
4. **Browser Instance** → **Event Logger** → **Structured Response**
5. **Structured Response** → **Toon Encoding** → **MCP Client**

## Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/4bd4ll4h/mcp-devtools-browser.git
   cd mcp-devtools-browser
   npm install
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Development Mode**
   ```bash
   npm run watch  # Auto-rebuild on changes
   ```

4. **Test with MCP Inspector**
   ```bash
   npm run inspector
   ```

### Testing

Run the test suite:
```bash
npm test
```

## Core Architecture

### BrowserManager

The `BrowserManager` is a singleton that manages browser instances and pages:

```typescript
class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private pages: Map<string, Page> = new Map();

  // Page lifecycle management
  async createPage(url?: string): Promise<string>
  async closePage(pageId: string): Promise<void>
  async getPage(pageId: string): Promise<Page>

  // Event monitoring
  setupEventMonitoring(page: Page, pageId: string): void

  // Resource cleanup
  async cleanup(): Promise<void>
}
```

### Event System

The event system provides comprehensive session tracking:

```typescript
class EventLogger {
  private events: BrowserEvent[] = [];
  private mutex = new Mutex();

  // Thread-safe event logging
  async logEvent(event: BrowserEvent): Promise<void>

  // Event querying with filtering
  async getEvents(filter?: EventFilter): Promise<BrowserEvent[]>

  // Event filtering utilities
  filterByType(events: BrowserEvent[], type: string): BrowserEvent[]
}
```

### Tool System

Tools are organized by category and registered in `toolsRegister.ts`:

```typescript
// Tool registration
const tools: Record<string, Tool> = {
  open_page: {
    description: "Opens a new browser page",
    inputSchema: openPageSchema,
    handler: openPageHandler
  },
  // ... more tools
};
```

## Extending the Project

### Adding New Tools

1. **Define Tool Schema**
   ```typescript
   // In src/schema/toolsSchema.ts
   export const newToolSchema = z.object({
     pageId: z.string(),
     parameter: z.string()
   });
   ```

2. **Implement Tool Handler**
   ```typescript
   // In appropriate category directory
   export const newToolHandler: ToolHandler = async (
     args: z.infer<typeof newToolSchema>
   ) => {
     const { pageId, parameter } = args;
     const page = await BrowserManager.getInstance().getPage(pageId);

     // Implement tool logic
     const result = await page.evaluate((param) => {
       // Browser context code
       return "result";
     }, parameter);

     return { success: true, result };
   };
   ```

3. **Register Tool**
   ```typescript
   // In src/tools/toolsRegister.ts
   import { newToolSchema } from "../schema/toolsSchema";
   import { newToolHandler } from "./category/newToolHandler";

   const tools: Record<string, Tool> = {
     // ... existing tools
     new_tool: {
       description: "Description of new tool",
       inputSchema: newToolSchema,
       handler: newToolHandler
     }
   };
   ```

### Adding New Resources

1. **Define Resource Schema**
   ```typescript
   // In src/schema/resourcesSchema.ts
   export const newResourceSchema = z.object({
     pageId: z.string()
   });
   ```

2. **Implement Resource Handler**
   ```typescript
   // In src/resources/newResource.ts
   export const newResourceHandler: ResourceTemplate["handler"] = async (
     uri: URL,
    { pageId }: z.infer<typeof newResourceSchema>
   ) => {
     const page = await BrowserManager.getInstance().getPage(pageId);

     // Extract resource data
     const data = await page.evaluate(() => {
       return document.title;
     });

     return [
       {
         uri: uri.href,
         mimeType: "text/plain",
         text: data
       }
     ];
   };
   ```

3. **Register Resource**
   ```typescript
   // In main server file
   import { newResourceHandler } from "./src/resources/newResource";

   server.setResourceHandler("new-resource", newResourceHandler);
   ```

## Code Patterns

### Error Handling

Use structured error responses:

```typescript
try {
  // Tool logic
  return { success: true, data: result };
} catch (error) {
  return {
    error: {
      type: "SpecificErrorType",
      message: error.message,
      details: { /* context */ }
    }
  };
}
```

### Event Logging

Log meaningful events for debugging:

```typescript
await EventLogger.getInstance().logEvent({
  type: "tool_execution",
  pageId,
  tool: "click",
  timestamp: Date.now(),
  data: { selector, success: true }
});
```

### Resource Management

Always clean up resources:

```typescript
// In tool handlers
const page = await BrowserManager.getInstance().getPage(pageId);

try {
  // Use page
} finally {
  // Optional cleanup if needed
}
```

## Performance Considerations

### Memory Management

- **Page Limits**: BrowserManager enforces maximum page limits
- **Event Pruning**: Old events are automatically pruned
- **DOM Chunking**: Large DOM trees are processed in chunks

### Token Efficiency

- **Toon Encoding**: Responses use Toon format for efficiency
- **Selective Data**: Only necessary data is returned
- **Compression**: Large responses are compressed when possible

### Browser Optimization

- **Instance Reuse**: Browser instances are reused
- **Headless Mode**: Default headless for performance
- **Resource Limits**: Memory and CPU limits enforced

## Testing Strategy

### Unit Tests

Test individual components:

```typescript
// Example unit test
describe("BrowserManager", () => {
  it("should create pages with unique IDs", async () => {
    const manager = BrowserManager.getInstance();
    const pageId1 = await manager.createPage();
    const pageId2 = await manager.createPage();
    expect(pageId1).not.toEqual(pageId2);
  });
});
```

### Integration Tests

Test tool workflows:

```typescript
// Example integration test
describe("Web Scraping Workflow", () => {
  it("should extract data from page", async () => {
    const pageId = await openPage("https://example.com");
    const tree = await getTree(pageId);
    expect(tree).toBeDefined();
    await closePage(pageId);
  });
});
```

### E2E Tests

Test complete MCP workflows:

```typescript
// Example E2E test
describe("MCP Integration", () => {
  it("should handle tool requests", async () => {
    const client = createTestClient();
    const result = await client.callTool("open_page", { url: "https://example.com" });
    expect(result.pageId).toBeDefined();
  });
});
```

## Deployment

### Building for Production

```bash
npm run build
```

### Publishing to npm

```bash
npm version patch  # or minor/major
npm publish
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
CMD ["node", "dist/index.js"]
```

## Monitoring and Debugging

### Event Logs

Use event logs for debugging:

```typescript
const events = await EventLogger.getInstance().getEvents({
  pageId: "specific-page",
  type: "network"
});
```

### Performance Metrics

Monitor browser performance:

```typescript
const metrics = await page.metrics();
console.log("Memory usage:", metrics.JSHeapUsedSize);
```

This development guide provides the foundation for understanding and extending the Puppeteer Developer Browser MCP project.