
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  registerOpenPageTool,
  registerListPagesTool,
  registerReloadPageTool,
  registerClosePageTool,
  registerNavigateTool,
  registerGoBackTool,
  registerGoForwardTool,
  registerClickTool,
  registerTypeTool,
  registerPressKeyTool,
  registerScrollTool,
  registerScrollToBottomTool,
  registerHoverTool
} from "./src/tools/toolsRegister.js";

const server = new McpServer({
    name: "puppteer-developer-browser-server",
    version: "1.0.0"
  });


registerOpenPageTool(server);
registerListPagesTool(server);
registerReloadPageTool(server);
registerClosePageTool(server);
registerNavigateTool(server);
registerGoBackTool(server);
registerGoForwardTool(server);
registerClickTool(server);
registerTypeTool(server);
registerPressKeyTool(server);
registerScrollTool(server);
registerScrollToBottomTool(server);
registerHoverTool(server);


  // Start receiving messages on stdin and sending messages on stdout
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
