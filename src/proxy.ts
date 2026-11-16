import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { isAdminUser } from "@/lib/admin";

const locales = ["en", "es"];
const defaultLocale = "en";

type AuthContext = {
  user: User | null;
  response: NextResponse;
};

/**
 * Refreshes the Supabase session and returns the current user.
 * The response must be returned (or copied into a redirect) so rotated
 * auth cookies reach the browser.
 */
async function getAuthContext(request: NextRequest): Promise<AuthContext> {
  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.getUser();
    return { user: error ? null : data.user, response };
  } catch {
    return { user: null, response };
  }
}

function redirectWithCookies(
  request: NextRequest,
  path: string,
  response: NextResponse
) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  response.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Protect admin routes with the Supabase session and admin role.
  if (pathname.startsWith("/control-panel")) {
    const { user, response } = await getAuthContext(request);

    if (!user) {
      return redirectWithCookies(request, "/login?next=/control-panel", response);
    }

    if (!isAdminUser(user)) {
      return redirectWithCookies(request, "/login?error=forbidden", response);
    }

    return response;
  }

  // Send already-authenticated admins straight to the panel.
  if (pathname === "/login") {
    const { user, response } = await getAuthContext(request);

    if (user && isAdminUser(user)) {
      return redirectWithCookies(request, "/control-panel", response);
    }

    return response;
  }

  // 1. Exclude public assets, api, internal Next.js/Turbopack paths, auth
  // callbacks, and admin routes from locale negotiation.
  const isExcluded =
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/control-panel") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/__") ||
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
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
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
