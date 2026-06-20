import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("example.supabase.co") &&
      key !== "local-dev-placeholder"
  );
}

export async function middleware(request: NextRequest) {
  const protectedPath = ["/student", "/teacher", "/lesson", "/quiz", "/tutor", "/analytics", "/profile", "/leaderboard", "/progress"].some((path) => request.nextUrl.pathname.startsWith(path));

  if (protectedPath && !isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const { data } = await supabase.auth.getUser();
  if (protectedPath && !data.user) return NextResponse.redirect(new URL("/login", request.url));

  const role = data.user?.user_metadata?.role;
  if (request.nextUrl.pathname.startsWith("/teacher") && role !== "teacher") return NextResponse.redirect(new URL("/student", request.url));
  if (request.nextUrl.pathname.startsWith("/student") && role === "teacher") return NextResponse.redirect(new URL("/teacher", request.url));

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)"]
};
