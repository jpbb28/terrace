export function logError(
  context: string,
  error: unknown,
  meta?: Record<string, unknown>,
) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(
    JSON.stringify({
      level: "error",
      context,
      message,
      stack,
      ...meta,
      ts: new Date().toISOString(),
    }),
  );
}
