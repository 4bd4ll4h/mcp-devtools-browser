import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getScreenshotHandler } from "./handlers/getScreenshotHandler.js";
import { getCssHandler } from "./handlers/getCssHandler.js";
import { getDomHandler } from "./handlers/getDomHandler.js";
import { getMarkdownHandler } from "./handlers/getMarkdownHandler.js";
import {
  GetScreenshotArgs,
  getScreenshotInputSchema,
  GetScreenshotResult,
  GetCssArgs,
  getCssInputSchema,
  GetCssResult,
  GetDomArgs,
  getDomInputSchema,
  GetDomResult,
  GetMarkdownArgs,
  getMarkdownInputSchema,
  GetMarkdownResult,
} from "../schema/resourcesSchema.js";
import { get } from "http";
import { getPageIds } from "../helper/methods.js";
import { getEventLogHandler } from "./handlers/getEventLogHandler.js";
import {
  GetEventLogArgs,
  getEventLogInputSchema,
  GetEventLogResult,
} from "../schema/resourcesSchema.js";

export function registerGetScreenshotResource(server: McpServer) {
  const screenshotTemplate = new ResourceTemplate(
    "screenshot://{pageId}",
    {
      list: undefined, // No listing for dynamic screenshots
      complete: {
        pageId: async () => {
          // This would ideally return available page IDs, but for now return empty
          return [];
        },
      },
    }
  );

  server.registerResource(
    "get_screenshot",
    screenshotTemplate,
    {
      title: "Capture browser screenshot",
      description: "Captures a PNG or JPEG screenshot of the entire page, specific element, or region.",
      inputSchema: getScreenshotInputSchema.shape,
    },
    async (uri: URL, variables: Record<string, string | string[]>) => {
      try {
        // Extract pageId from URI variables
        const pageId = variables.pageId as string;
        if (!pageId) {
          throw new Error("pageId is required");
        }

        // Create args from variables with proper type conversion
        const args: GetScreenshotArgs = {
          pageId,
          format: variables.format as "png" | "jpeg" || "png",
          quality: variables.quality ? parseInt(variables.quality as string) : 80,
          fullPage: variables.fullPage === "true",
          selector: variables.selector as string,
          x: variables.x ? parseInt(variables.x as string) : undefined,
          y: variables.y ? parseInt(variables.y as string) : undefined,
          width: variables.width ? parseInt(variables.width as string) : undefined,
          height: variables.height ? parseInt(variables.height as string) : undefined,
        };

        const result: GetScreenshotResult = await getScreenshotHandler(args);
        return {
          contents: [
            {
              uri: `data:image/${result.format};base64,${result.data}`,
              blob: result.data, // Base64 encoded image data
              mimeType: `image/${result.format}`,
            },
          ],
        };
      } catch (err) {
        throw new Error(`Failed to capture screenshot: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  );
}

export function registerGetCssResource(server: McpServer) {
  const cssTemplate = new ResourceTemplate(
    "css://{pageId}",
    {
      list: undefined, // No listing for dynamic CSS
      complete: {
        pageId: async () => {
          // This would ideally return available page IDs, but for now return empty
          return [];
        },
      },
    }
  );

  server.registerResource(
    "get_css",
    cssTemplate,
    {
      title: "Get CSS information",
      description: "Returns CSS information for the entire document or specific elements. Useful for debugging style conflicts and understanding layout logic.",
      inputSchema: getCssInputSchema.shape,
    },
    async (uri: URL, variables: Record<string, string | string[]>) => {
      try {
        // Extract pageId from URI variables
        const pageId = variables.pageId as string;
        if (!pageId) {
          throw new Error("pageId is required");
        }

        // Create args from variables with proper type conversion
        const args: GetCssArgs = {
          pageId,
          selector: variables.selector as string,
          includeComputed: variables.includeComputed === "true",
        };

        const result: GetCssResult = await getCssHandler(args);
        return {
          contents: [
            {
              uri: `data:text/css;charset=utf-8,${encodeURIComponent(result.css)}`,
              blob: Buffer.from(result.css).toString('base64'),
              mimeType: "text/css",
            },
          ],
        };
      } catch (err) {
        throw new Error(`Failed to get CSS: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  );
}

export function registerGetDomResource(server: McpServer) {
  const domTemplate = new ResourceTemplate(
    "dom://{pageId}{?*}",
    {
      list: undefined, 
      
      complete: {
        pageId: async () => getPageIds(),
        selector: async () => {
          return [];
        },
        includeAttributes: async () => {
          return ["true", "false"];
        },
        includeText: async () => {
          return ["true", "false"];
        },
        includeChildren: async () => {
          return ["true", "false"];
        },
      },
    }
  );
  
  server.registerResource(
    "get_dom",
    domTemplate,
    {
      title: "Get structured DOM tree",
      description: "Returns a structured DOM tree for the entire document or specific elements. Useful for programmatic DOM analysis and manipulation.",
      inputSchema: getDomInputSchema.shape,
    },
    async (uri: URL, variables: Record<string, string | string[]>) => {
        console.error("GET DOM VARIABLES", variables);
      try {
        // Extract pageId from URI variables
        const pageId = variables.pageId as string;
        if (!pageId) {
          throw new Error("pageId is required");
        }
        
        
        // Extract optional parameters from variables (not from URI search params)
        // ResourceTemplate passes query params as variables
        const includeAttributes = variables.includeAttributes as string || 'true';
        const includeText = variables.includeText as string || 'true';
        const includeChildren = variables.includeChildren as string || 'true';
        const selector = variables.selector as string || undefined;
       
        // Create args from variables with proper type conversion
        const args: GetDomArgs = {
          pageId,
          selector: selector || undefined,
          includeAttributes: includeAttributes === "true",
          includeText: includeText === "true",
          includeChildren: includeChildren === "true",
        };
        
        const result: GetDomResult = await getDomHandler(args);
        
        // Return DOM as JSON data
        const jsonString = JSON.stringify(result.dom, null, 2);
     
        
        return {
          contents: [
            {
              uri: uri.href,
              text: jsonString
            },
          ],
        };
      } catch (err) {
        throw new Error(`Failed to get DOM: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  );
}

export function registerGetMarkdownResource(server: McpServer) {
  const markdownTemplate = new ResourceTemplate(
    "markdown://{pageId}",
    {
      list: undefined, // No listing for dynamic markdown
      complete: {
        pageId: async () => {
          // This would ideally return available page IDs, but for now return empty
          return [];
        },
      },
    }
  );

  server.registerResource(
    "get_markdown",
    markdownTemplate,
    {
      title: "Convert web page to Markdown",
      description: "Converts a web page or selected DOM section into Markdown format. Similar to Python's markdownify library.",
      inputSchema: getMarkdownInputSchema.shape,
    },
    async (uri: URL, variables: Record<string, string | string[]>) => {
      try {
        // Extract pageId from URI variables
        const pageId = variables.pageId as string;
        if (!pageId) {
          throw new Error("pageId is required");
        }

        // Create args from variables with proper type conversion
        const args: GetMarkdownArgs = {
          pageId,
          selector: variables.selector as string,
          includeImages: variables.includeImages === "true",
          includeLinks: variables.includeLinks === "true",
          includeHeadings: variables.includeHeadings === "true",
          includeLists: variables.includeLists === "true",
          includeTables: variables.includeTables === "true",
          includeCode: variables.includeCode === "true",
          stripTags: Array.isArray(variables.stripTags) ? variables.stripTags as string[] : [],
          convertNewlines: variables.convertNewlines === "true",
        };

        const result: GetMarkdownResult = await getMarkdownHandler(args);

        // Return markdown as text data
        return {
          contents: [
            {
              uri: `data:text/markdown;charset=utf-8,${encodeURIComponent(result.markdown)}`,
              blob: Buffer.from(result.markdown).toString('base64'),
              mimeType: "text/markdown",
            },
          ],
        };
      } catch (err) {
        throw new Error(`Failed to convert to markdown: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  );
}

/**
 * Register get_event_log resource
 */
export function registerGetEventLogResource(server: McpServer) {
  const eventLogTemplate = new ResourceTemplate(
    "eventlog://{?*}",
    {
      list: undefined, // No listing for dynamic event logs
      complete: {
        startTime: async () => [],
        endTime: async () => [],
        eventTypes: async () => [
          'llm_action',
          'dom_change',
          'network',
          'console',
          'browser'
        ],
        pageIds: async () => getPageIds(),
        sources: async () => [],
        limit: async () => ['10', '50', '100', '500', '1000'],
        offset: async () => [],
      },
    }
  );

  server.registerResource(
    "get_event_log",
    eventLogTemplate,
    {
      title: "Get browser session event log",
      description: "Retrieves chronological event log with LLM actions, DOM changes, network activity, console logs, and browser events. Supports filtering by time, type, page, and metadata.",
      inputSchema: getEventLogInputSchema.shape,
    },
    async (uri: URL, variables: Record<string, string | string[]>) => {
      try {
        // TODO: Parse filter parameters from variables
        // TODO: Convert string values to appropriate types
        // TODO: Call getEventLogHandler with parsed arguments
        // TODO: Format response as JSON text
        // TODO: Return proper resource response

        // Placeholder return to satisfy TypeScript
        return {
          contents: [
            {
              uri: uri.href,
              text: "Event log functionality not yet implemented"
            },
          ],
        };
      } catch (err) {
        throw new Error(`Failed to get event log: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  );
}


