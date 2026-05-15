/**
 * Presentation Mode Detection Utilities
 * Automatically detects if auth is available and enables presentation mode if not.
 */

/**
 * Check if Better Auth is configured and valid
 */
export const hasValidAuthUrl = (): boolean => {
  const url = process.env.NEXT_PUBLIC_AUTH_URL;
  return !!url && (url.startsWith("http://") || url.startsWith("https://"));
};

/**
 * Check if app is running in presentation mode (no auth configured)
 * Server-side detection
 */
export const isPresentationMode = (): boolean => {
  // If auth is not configured, we are in presentation/demo mode
  return !hasValidAuthUrl();
};

/**
 * Check if auth is available
 */
export const isAuthAvailable = (): boolean => {
  return hasValidAuthUrl();
};

/**
 * Client-side presentation mode detection
 */
export const isPresentationModeClient = (): boolean => {
  if (typeof window === "undefined") return isPresentationMode();
  return !hasValidAuthUrl();
};
