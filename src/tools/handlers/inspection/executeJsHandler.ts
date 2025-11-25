import { BrowserManager } from "../../../browser/BrowserManager.js";
import { ExecuteJsArgs, ExecuteJsResult } from "../../../schema/toolsSchema.js";
import { browserManagerExtensions } from "../../../tools/toolsRegister.js";

export async function executeJsHandler(args: ExecuteJsArgs): Promise<ExecuteJsResult> {
  const { pageId, script, args: scriptArgs = [], timeoutMs } = args;

  const startTime = Date.now();

  const browserManager = BrowserManager.getInstance();
  const page = browserManager.getPage(pageId);

  if (!page) {
    throw new Error(`Page with ID ${pageId} not found`);
  }

  // Record tool invocation event
  await browserManagerExtensions.recordToolInvocation(pageId, 'execute_js', {
    pageId,
    scriptLength: script.length,
    hasArgs: scriptArgs.length > 0,
    timeoutMs,
  });

  try {
    // Get page metadata
    const url = page.url();
    const title = await page.title().catch(() => null);

    // Execute JavaScript in the browser context
    const result = await page.evaluate(
      (scriptToExecute: string, args: any[]) => {
        try {
          // Create a function from the script string
          const func = new Function(...args.map((_, i) => `arg${i}`), scriptToExecute);

          // Execute the function with provided arguments
          return func(...args);
        } catch (error: any) {
          // Return error information instead of throwing
          return {
            __error: true,
            name: error.name,
            message: error.message,
            stack: error.stack
          };
        }
      },
      script,
      scriptArgs
    );

    // Check if the result contains an error
    const success = !(result && typeof result === 'object' && result.__error === true);

    const executionResult = {
      pageId,
      url,
      title,
      result: success ? result : undefined,
      success,
    };

    const executionTime = Date.now() - startTime;

    // Record tool result event
    await browserManagerExtensions.recordToolResult(pageId, 'execute_js', {
      pageId,
      url,
      title,
      success,
      executionTime,
      scriptLength: script.length,
    }, executionTime);

    return executionResult;
  } catch (err: any) {
    const executionTime = Date.now() - startTime;

    // Record tool error event
    await browserManagerExtensions.recordToolError(pageId, 'execute_js', err, executionTime);

    console.error(`❌ Failed to execute JavaScript for page ${pageId}:`, err.message);
    throw new Error(`Failed to execute JavaScript: ${err.message}`);
  }
}