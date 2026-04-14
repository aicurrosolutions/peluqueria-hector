/**
 * Structured logger for Vercel — outputs JSON to stdout/stderr.
 * Vercel ingests console.* calls natively; structured JSON makes them
 * filterable and searchable in the Vercel dashboard.
 */

type LogLevel = "info" | "warn" | "error";

interface LogContext {
  route?: string;
  [key: string]: unknown;
}

function buildEntry(level: LogLevel, message: string, context?: LogContext) {
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    ...context,
  });
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    };
  }
  return { raw: String(error) };
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.log(buildEntry("info", message, context));
  },

  warn(message: string, context?: LogContext) {
    console.warn(buildEntry("warn", message, context));
  },

  error(message: string, error?: unknown, context?: LogContext) {
    console.error(
      buildEntry("error", message, {
        ...context,
        error: error !== undefined ? serializeError(error) : undefined,
      })
    );
  },
};
