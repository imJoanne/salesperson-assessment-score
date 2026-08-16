import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, skip the auth refresh and pass through.
  // Without this guard createServerClient throws "Your project's URL and Key
  // are required", crashing the edge middleware on every route (500
  // MIDDLEWARE_INVOCATION_FAILED).
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  try {
    let response = supabaseResponse;
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // Refresh session so it doesn't expire while user is active
    const { data: { user } } = await supabase.auth.getUser();
    const pathname = request.nextUrl.pathname;
    const isProtected = pathname.startsWith("/reports") || pathname.startsWith("/dashboard") || pathname.startsWith("/products");
    if (isProtected && !user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return copyCookies(response, NextResponse.redirect(loginUrl));
    }
    if (user && (pathname.startsWith("/dashboard") || pathname.startsWith("/products"))) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role !== "operator") {
        const reportsUrl = request.nextUrl.clone();
        reportsUrl.pathname = "/reports";
        reportsUrl.search = "?notice=operator-only";
        return copyCookies(response, NextResponse.redirect(reportsUrl));
      }
    }
    return response;
  } catch {
    // Never let an auth hiccup crash the entire edge middleware
    return supabaseResponse;
  }
}

function copyCookies(source: NextResponse, destination: NextResponse) {
  for (const cookie of source.cookies.getAll()) destination.cookies.set(cookie);
  return destination;
}
