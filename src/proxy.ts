import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Runs only for /admin/*. It refreshes the Supabase session cookie and sends
// signed-out visitors to the login page. This is a convenience layer: the real
// enforcement is (a) the owner check in the admin layout and (b) Row Level
// Security on every table and storage policy.
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isLogin = request.nextUrl.pathname === "/admin/login";

  if (!url || !key) {
    return isLogin
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
