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
