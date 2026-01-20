import { auth0 } from "./src/lib/auth0";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Let Auth0 handle /auth/* routes (login, logout, callback, me)
  const authRes = await auth0.middleware(request);

  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authRes;
  }

  // For now, don't protect any routes - just pass through
  // Phase 19/20 will add protection after deployment
  return authRes;
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
