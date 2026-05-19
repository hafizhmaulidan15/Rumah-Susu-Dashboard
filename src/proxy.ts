import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Route protection modes:
 * - No env vars (GRAPHQL_URL, NEXT_PUBLIC_AUTH_URL) → standalone demo, no protection
 * - Env vars configured → route protection enabled (redirects to /login)
 */

const handleI18nRouting = createMiddleware(routing);

const publicPaths = ["/login", "/register", "/forgot-password"];

const isPublicPath = (pathname: string): boolean => {
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");
  return publicPaths.some((path) => pathWithoutLocale.startsWith(path));
};

/** Returns true if both GRAPHQL_URL and NEXT_PUBLIC_AUTH_URL are configured */
const isAuthConfigured = (): boolean => {
  const graphqlUrl = process.env.GRAPHQL_URL;
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;
  return Boolean(graphqlUrl && authUrl);
};

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

function withNoStore(response: NextResponse) {
  for (const [key, value] of Object.entries(NO_STORE_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

/* ------------------------------------------------------------------ */
/*  Content-Security-Policy (nonce-based)                             */
/* ------------------------------------------------------------------ */

function generateCSP(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  const connectSrc = [
    "'self'",
    "https://raw.githubusercontent.com",
    "https://script.google.com",
    "https://script.googleusercontent.com",
    "https://p.typekit.net",
    ...(process.env.NEXT_PUBLIC_AUTH_URL
      ? [new URL(process.env.NEXT_PUBLIC_AUTH_URL).origin]
      : []),
    ...(isDev ? ["http://localhost:4000"] : []),
  ].join(" ");

  return [
    `default-src 'self'`,
    `worker-src 'self'`,
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: https://res.cloudinary.com https://avatars.githubusercontent.com`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src ${connectSrc}`,
    `frame-ancestors 'none'`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'none'`,
  ].join("; ");
}

/* ------------------------------------------------------------------ */
/*  Middleware                                                         */
/* ------------------------------------------------------------------ */

const proxy = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const nonce = crypto.randomUUID();

  const addSecurityHeaders = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", generateCSP(nonce));
    return withNoStore(response);
  };

  /** Public paths - always accessible. */
  if (isPublicPath(pathname)) {
    return addSecurityHeaders(handleI18nRouting(request));
  }

  /** No auth configured - standalone demo mode, skip protection. */
  if (!isAuthConfigured()) {
    return addSecurityHeaders(handleI18nRouting(request));
  }

  /** Auth configured - check session. */
  const sessionCookie = getSessionCookie(request);
  if (sessionCookie) {
    return addSecurityHeaders(handleI18nRouting(request));
  }

  /** No session - redirect to login. */
  const locale = pathname.match(/^\/([a-z]{2})\//)?.at(1) || "";
  return addSecurityHeaders(
    NextResponse.redirect(
      new URL(`/${locale ? locale + "/" : ""}login`, request.url),
    ),
  );
};

export default proxy;

export const config = {
  matcher: ["/((?!api|_next|_vercel|trpc|.*\\..*).*)"],
};
