const FALLBACK_VERSION = "development";

/**
 * Version baked into this deployment by next.config.ts. Keeping the client,
 * layout, and API on this same inlined value avoids false positives from a
 * runtime environment that differs from the build environment.
 */
export function getAppVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION || FALLBACK_VERSION;
}
