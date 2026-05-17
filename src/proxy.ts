import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "es"];
const defaultLocale = "en";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Protect Admin Routes
  if (pathname.startsWith("/control-panel")) {
    const hasSession = request.cookies.has("admin_session");
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 1. Exclude public assets, api, internal Next.js/Turbopack paths, and admin routes
  const isExcluded =
    pathname.startsWith("/api") ||
    pathname.startsWith("/control-panel") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/__") || // Prevents internal Next.js/Turbopack HMR paths from redirecting (e.g., /__turbopack_hmr__)
    pathname.startsWith("/assets") ||
    pathname.includes("favicon.ico") ||
    pathname.includes("icon.svg") ||
    pathname.includes("sitemap") ||
    pathname.includes("robots");

  if (isExcluded) {
    return NextResponse.next();
  }

  // 2. Check if the path already starts with a supported locale (e.g., /en or /es)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 3. Negotiate language: check browser language header
  const acceptLanguage = request.headers.get("accept-language") || "";
  let selectedLocale = defaultLocale;

  if (acceptLanguage.toLowerCase().includes("es")) {
    selectedLocale = "es";
  }

  // 4. Redirect the user to the correct localized path
  const redirectUrl = new URL(
    `/${selectedLocale}${pathname === "/" ? "" : pathname}`,
    request.url
  );

  // Preserve query parameters (if any)
  redirectUrl.search = request.nextUrl.search;

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  // Match all paths except static files
  matcher: ["/((?!_next/static|_next/image|assets|favicon.ico|icon.svg).*)"],
};
