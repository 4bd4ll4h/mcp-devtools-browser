import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
  HoverResult
} from "../schema/toolsSchema.js";

export function registerOpenPageTool(server: McpServer) {
server.registerTool(
    "open_page",
    {
      title: "Open a new browser page",
      description: "Opens a new browser page and returns its ID.",
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
      description: "Returns a list of all currently open browser pages with their details.",
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
      description: "Reloads an existing browser page and returns the updated page details.",
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
      description: "Closes a specific browser page/tab.",
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
      description: "Navigates a browser page to a new URL.",
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
      description: "Navigates back in the browser history.",
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
      description: "Navigates forward in the browser history.",
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
      description: "Clicks on a specified element using CSS selector.",
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
      description: "Types text into a specified input element using CSS selector.",
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
      description: "Presses a specified keyboard key.",
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
      description: "Scrolls the page by offset or to a specific element.",
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
      description: "Scrolls until the page ends (handles lazy loading).",
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
      description: "Hovers over a specified element using CSS selector.",
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