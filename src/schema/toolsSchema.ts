import { z } from "zod";

export const openPageOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  status: z.number(),
});

export type OpenPageResult = z.infer<typeof openPageOutputSchema>;


export const openPageInputSchema =  z.object({
  url: z.string().url(),
  waitUntil: z.enum(["load", "domcontentloaded", "networkidle0", "networkidle2"]).optional(),
  timeoutMs: z.number().optional(),
});

export type OpenPageArgs = z.infer<typeof openPageInputSchema>;

// List Pages schemas
export const listPagesOutputSchema = z.object({
  pages: z.array(z.object({
    pageId: z.string(),
    url: z.string(),
    title: z.string().nullable(),
    lastActivity: z.number(),
  })),
});

export type ListPagesResult = z.infer<typeof listPagesOutputSchema>;

export const listPagesInputSchema = z.object({});

export type ListPagesArgs = z.infer<typeof listPagesInputSchema>;

// Reload Page schemas
export const reloadPageInputSchema = z.object({
  pageId: z.string(),
  waitUntil: z.enum(["load", "domcontentloaded", "networkidle0", "networkidle2"]).optional(),
  timeoutMs: z.number().optional(),
});

export type ReloadPageArgs = z.infer<typeof reloadPageInputSchema>;

export const reloadPageOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  status: z.number(),
});

export type ReloadPageResult = z.infer<typeof reloadPageOutputSchema>;

export function structuredResponse(data: any) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function textResponse(message: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: message,
      },
    ],
  };
}

// Close Page schemas
export const closePageInputSchema = z.object({
  pageId: z.string(),
});

export type ClosePageArgs = z.infer<typeof closePageInputSchema>;

export const closePageOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ClosePageResult = z.infer<typeof closePageOutputSchema>;

// Navigate schemas
export const navigateInputSchema = z.object({
  pageId: z.string(),
  url: z.string().url(),
  waitUntil: z.enum(["load", "domcontentloaded", "networkidle0", "networkidle2"]).optional(),
  timeoutMs: z.number().optional(),
});

export type NavigateArgs = z.infer<typeof navigateInputSchema>;

export const navigateOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  status: z.number(),
});

export type NavigateResult = z.infer<typeof navigateOutputSchema>;

// Go Back schemas
export const goBackInputSchema = z.object({
  pageId: z.string(),
});

export type GoBackArgs = z.infer<typeof goBackInputSchema>;

export const goBackOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  success: z.boolean(),
});

export type GoBackResult = z.infer<typeof goBackOutputSchema>;

// Go Forward schemas
export const goForwardInputSchema = z.object({
  pageId: z.string(),
});

export type GoForwardArgs = z.infer<typeof goForwardInputSchema>;

export const goForwardOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  success: z.boolean(),
});

export type GoForwardResult = z.infer<typeof goForwardOutputSchema>;

// Click schemas
export const clickInputSchema = z.object({
  pageId: z.string(),
  selector: z.string(),
  waitForNavigation: z.boolean().optional(),
  timeoutMs: z.number().optional(),
});

export type ClickArgs = z.infer<typeof clickInputSchema>;

export const clickOutputSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string().nullable(),
  success: z.boolean(),
});

export type ClickResult = z.infer<typeof clickOutputSchema>;

// Type schemas
export const typeInputSchema = z.object({
  pageId: z.string(),
  selector: z.string(),
  text: z.string(),
  delayMs: z.number().optional(),
  clear: z.boolean().optional(),
});

export type TypeArgs = z.infer<typeof typeInputSchema>;

export const typeOutputSchema = z.object({
  pageId: z.string(),
  success: z.boolean(),
});

export type TypeResult = z.infer<typeof typeOutputSchema>;

// PressKey schemas
export const pressKeyInputSchema = z.object({
  pageId: z.string(),
  key: z.enum([
    "Enter", "Escape", "Tab", "Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
    "Backspace", "Delete", "Home", "End", "PageUp", "PageDown", "F1", "F2", "F3", "F4",
    "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"
  ]),
});

export type PressKeyArgs = z.infer<typeof pressKeyInputSchema>;

export const pressKeyOutputSchema = z.object({
  pageId: z.string(),
  success: z.boolean(),
});

export type PressKeyResult = z.infer<typeof pressKeyOutputSchema>;

// Scroll schemas
export const scrollInputSchema = z.object({
  pageId: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  selector: z.string().optional(),
});

export type ScrollArgs = z.infer<typeof scrollInputSchema>;

export const scrollOutputSchema = z.object({
  pageId: z.string(),
  success: z.boolean(),
});

export type ScrollResult = z.infer<typeof scrollOutputSchema>;

// ScrollToBottom schemas
export const scrollToBottomInputSchema = z.object({
  pageId: z.string(),
  timeoutMs: z.number().optional(),
});

export type ScrollToBottomArgs = z.infer<typeof scrollToBottomInputSchema>;

export const scrollToBottomOutputSchema = z.object({
  pageId: z.string(),
  success: z.boolean(),
});

export type ScrollToBottomResult = z.infer<typeof scrollToBottomOutputSchema>;

// Hover schemas
export const hoverInputSchema = z.object({
  pageId: z.string(),
  selector: z.string(),
});

export type HoverArgs = z.infer<typeof hoverInputSchema>;

export const hoverOutputSchema = z.object({
  pageId: z.string(),
  success: z.boolean(),
});

export type HoverResult = z.infer<typeof hoverOutputSchema>;

export function errorResponse(err: any) {
  return {
    content: [
      {
        type: "text" as const,
        text: `Error: ${err instanceof Error ? err.message : String(err)}`,
      },
    ],
  };
}
