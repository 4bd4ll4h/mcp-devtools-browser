import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BrowserManager } from "../browser/BrowserManager.js";
import { BrowserManagerExtensions } from "../event/BrowserManagerExtensions.js";
import { openPageHandler } from "./handlers/browserControl/openPageHandler.js";
import { listPagesHandler } from "./handlers/browserControl/listPagesHandler.js";
import { reloadPageHandler } from "./handlers/browserControl/reloadPageHandler.js";
import { closePageHandler } from "./handlers/browserControl/closePageHandler.js";
import { navigateHandler } from "./handlers/browserControl/navigateHandler.js";
import { goBackHandler } from "./handlers/browserControl/goBackHandler.js";
import { goForwardHandler } from "./handlers/browserControl/goForwardHandler.js";
import { clickHandler } from "./handlers/userInteractions/clickHandler.js";
import { typeHandler } from "./handlers/userInteractions/typeHandler.js";
import { pressKeyHandler } from "./handlers/userInteractions/pressKeyHandler.js";
import { scrollHandler } from "./handlers/userInteractions/scrollHandler.js";
import { scrollToBottomHandler } from "./handlers/userInteractions/scrollToBottomHandler.js";
import { hoverHandler } from "./handlers/userInteractions/hoverHandler.js";
import { getTreeHandler } from "./handlers/inspection/getTreeHandler.js";
import { getEventLogHandler } from "./handlers/inspection/getEventLogHandler.js";
import { getScreenshotHandler } from "../resources/handlers/getScreenshotHandler.js";
import { getCssHandler } from "../resources/handlers/getCssHandler.js";
import { getDomHandler } from "../resources/handlers/getDomHandler.js";
import { getMarkdownHandler } from "../resources/handlers/getMarkdownHandler.js";

// Create BrowserManagerExtensions instance for event recording
export const browserManagerExtensions = new BrowserManagerExtensions(BrowserManager.getInstance());
import {
  errorResponse,
  structuredResponse,
  OpenPageArgs,
  openPageInputSchema,
  OpenPageResult,
  ListPagesArgs,
  listPagesInputSchema,
  ListPagesResult,
  ReloadPageArgs,
  reloadPageInputSchema,
  ReloadPageResult,
  ClosePageArgs,
  closePageInputSchema,
  ClosePageResult,
  NavigateArgs,
  navigateInputSchema,
  NavigateResult,
  GoBackArgs,
  goBackInputSchema,
  GoBackResult,
  GoForwardArgs,
  goForwardInputSchema,
  GoForwardResult,
  ClickArgs,
  clickInputSchema,
  ClickResult,
  TypeArgs,
  typeInputSchema,
  TypeResult,
  PressKeyArgs,
  pressKeyInputSchema,
  PressKeyResult,
  ScrollArgs,
  scrollInputSchema,
  ScrollResult,
  ScrollToBottomArgs,
  scrollToBottomInputSchema,
  ScrollToBottomResult,
  HoverArgs,
  hoverInputSchema,
  HoverResult,
  GetTreeArgs,
  getTreeInputSchema,
  GetTreeResult,
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
  GetEventLogArgs,
  getEventLogInputSchema,
  GetEventLogResult
} from "../schema/toolsSchema.js";

export function registerOpenPageTool(server: McpServer) {
server.registerTool(
    "open_page",
    {
      title: "Open a new browser page",
      description: "Opens a new browser page/tab and returns its unique page ID. Use this to start browsing sessions and navigate to websites. Essential for initial page setup before using other tools.",
      inputSchema: openPageInputSchema.shape,
    },

    async (args: OpenPageArgs) => {
    try {
      const result: OpenPageResult = await openPageHandler(args);
      return structuredResponse(result);
    } catch (err) {
      return errorResponse(err);
    }
  }

  )
}

export function registerListPagesTool(server: McpServer) {
  server.registerTool(
    "list_pages",
    {
      title: "List all open browser pages",
      description: "Lists all currently open browser pages with their URLs, titles, and activity timestamps. Use this to manage multiple pages or switch between existing sessions.",
      inputSchema: listPagesInputSchema.shape,
    },

    async (args: ListPagesArgs) => {
      try {
        const result: ListPagesResult = await listPagesHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerReloadPageTool(server: McpServer) {
  server.registerTool(
    "reload_page",
    {
      title: "Reload a browser page",
      description: "Reloads/refreshes a browser page, useful for getting fresh content after dynamic updates or testing page loading behavior.",
      inputSchema: reloadPageInputSchema.shape,
    },

    async (args: ReloadPageArgs) => {
      try {
        const result: ReloadPageResult = await reloadPageHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerClosePageTool(server: McpServer) {
  server.registerTool(
    "close_page",
    {
      title: "Close a browser page",
      description: "Closes a specific browser page/tab to free resources and manage browser sessions efficiently.",
      inputSchema: closePageInputSchema.shape,
    },

    async (args: ClosePageArgs) => {
      try {
        const result: ClosePageResult = await closePageHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerNavigateTool(server: McpServer) {
  server.registerTool(
    "navigate",
    {
      title: "Navigate to URL",
      description: "Navigates a browser page to a new URL. Essential for moving between pages, testing navigation flows, or accessing different website sections.",
      inputSchema: navigateInputSchema.shape,
    },

    async (args: NavigateArgs) => {
      try {
        const result: NavigateResult = await navigateHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerGoBackTool(server: McpServer) {
  server.registerTool(
    "go_back",
    {
      title: "Go back in browser history",
      description: "Navigates back in browser history. Useful for testing back button functionality or returning to previous pages.",
      inputSchema: goBackInputSchema.shape,
    },

    async (args: GoBackArgs) => {
      try {
        const result: GoBackResult = await goBackHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerGoForwardTool(server: McpServer) {
  server.registerTool(
    "go_forward",
    {
      title: "Go forward in browser history",
      description: "Navigates forward in browser history. Use after going back to return to the original page.",
      inputSchema: goForwardInputSchema.shape,
    },

    async (args: GoForwardArgs) => {
      try {
        const result: GoForwardResult = await goForwardHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerClickTool(server: McpServer) {
  server.registerTool(
    "click",
    {
      title: "Click on element",
      description: "Clicks on a specified element using CSS selector. Essential for interacting with buttons, links, form elements, and triggering JavaScript events.",
      inputSchema: clickInputSchema.shape,
    },

    async (args: ClickArgs) => {
      try {
        const result: ClickResult = await clickHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerTypeTool(server: McpServer) {
  server.registerTool(
    "type",
    {
      title: "Type text into element",
      description: "Types text into input fields, textareas, or contenteditable elements. Use for form filling, search queries, and text input scenarios.",
      inputSchema: typeInputSchema.shape,
    },

    async (args: TypeArgs) => {
      try {
        const result: TypeResult = await typeHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerPressKeyTool(server: McpServer) {
  server.registerTool(
    "press_key",
    {
      title: "Press keyboard key",
      description: "Presses keyboard keys like Enter, Escape, Tab, or arrow keys. Useful for form submission, navigation, or keyboard shortcuts.",
      inputSchema: pressKeyInputSchema.shape,
    },

    async (args: PressKeyArgs) => {
      try {
        const result: PressKeyResult = await pressKeyHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerScrollTool(server: McpServer) {
  server.registerTool(
    "scroll",
    {
      title: "Scroll page",
      description: "Scrolls the page by pixel offset or to specific elements. Essential for accessing content below the fold or testing scroll behavior.",
      inputSchema: scrollInputSchema.shape,
    },

    async (args: ScrollArgs) => {
      try {
        const result: ScrollResult = await scrollHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerScrollToBottomTool(server: McpServer) {
  server.registerTool(
    "scroll_to_bottom",
    {
      title: "Scroll to bottom",
      description: "Scrolls to the bottom of the page, handling infinite scroll and lazy loading. Useful for loading all content on dynamic pages.",
      inputSchema: scrollToBottomInputSchema.shape,
    },

    async (args: ScrollToBottomArgs) => {
      try {
        const result: ScrollToBottomResult = await scrollToBottomHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerHoverTool(server: McpServer) {
  server.registerTool(
    "hover",
    {
      title: "Hover over element",
      description: "Hovers over elements to trigger hover states, tooltips, or dropdown menus. Essential for testing interactive UI components.",
      inputSchema: hoverInputSchema.shape,
    },

    async (args: HoverArgs) => {
      try {
        const result: HoverResult = await hoverHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerGetTreeTool(server: McpServer) {
  server.registerTool(
    "get_tree",
    {
      title: "Get page accessibility and DOM tree",
      description: "Returns a focused tree of interactive, focusable, and accessible elements with CSS selectors. Use for automation planning and understanding page structure for user interactions.",
      inputSchema: getTreeInputSchema.shape,
    },

    async (args: GetTreeArgs) => {
      try {
        const result: GetTreeResult = await getTreeHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerGetScreenshotTool(server: McpServer) {
  server.registerTool(
    "get_screenshot",
    {
      title: "Capture browser screenshot",
      description: "Captures screenshots of the entire page, specific elements, or regions. Use for visual verification, debugging layout issues, or documenting UI states.",
      inputSchema: getScreenshotInputSchema.shape,
    },

    async (args: GetScreenshotArgs) => {
      try {
        const result: GetScreenshotResult = await getScreenshotHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerGetCssTool(server: McpServer) {
  server.registerTool(
    "get_css",
    {
      title: "Get CSS information",
      description: "Returns CSS rules and computed styles for the entire document or specific elements. Essential for debugging styling issues, understanding layout logic, and analyzing design systems.",
      inputSchema: getCssInputSchema.shape,
    },

    async (args: GetCssArgs) => {
      try {
        const result: GetCssResult = await getCssHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerGetDomTool(server: McpServer) {
  server.registerTool(
    "get_dom",
    {
      title: "Get structured DOM tree",
      description: "Returns the complete DOM tree structure with smart text filtering. Use for comprehensive page analysis, content extraction, and understanding the full document structure.",
      inputSchema: getDomInputSchema.shape,
    },

    async (args: GetDomArgs) => {
      try {
        const result: GetDomResult = await getDomHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerGetMarkdownTool(server: McpServer) {
  server.registerTool(
    "get_markdown",
    {
      title: "Convert web page to Markdown",
      description: "Converts web page content to Markdown format, preserving headings, lists, links, and text structure. Use for content extraction, documentation, or text analysis.",
      inputSchema: getMarkdownInputSchema.shape,
    },

    async (args: GetMarkdownArgs) => {
      try {
        const result: GetMarkdownResult = await getMarkdownHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}

export function registerGetEventLogTool(server: McpServer) {
  server.registerTool(
    "get_event_log",
    {
      title: "Get browser session event log",
      description: "Retrieves comprehensive browser session event logs including LLM actions, DOM changes, network activity, console logs, and JavaScript errors. Filter by time, event type, page, source, and metadata. Use for debugging, analysis, and understanding browser session behavior.",
      inputSchema: getEventLogInputSchema.shape,
    },

    async (args: GetEventLogArgs) => {
      try {
        const result: GetEventLogResult = await getEventLogHandler(args);
        return structuredResponse(result);
      } catch (err) {
        return errorResponse(err);
      }
    }
  )
}