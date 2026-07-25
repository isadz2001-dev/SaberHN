/**
 * Forwards runtime errors to any registered error-reporting hook.
 * Framework-agnostic: works with Bolt's runtime error reporting when
 * present, and silently degrades to console.error otherwise.
 */
export function reportRuntimeError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  // Forward to a reporting hook if one is registered on the window object.
  const w = window as unknown as {
    __boltReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
  };

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  w.__boltReportRuntimeError?.({
    message,
    stack: error instanceof Error ? error.stack : undefined,
    filename: window.location.pathname,
  });

  if (import.meta.env.DEV) {
    console.error("[runtime-error]", message, context);
  }
}
