import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const BLOCKED_PATHS = [
  /^\/\.env(?:\..*)?$/i,
  /^\/\.git(?:\/.*)?$/i,
  /^\/\.vercel(?:\/.*)?$/i,
  /^\/node_modules(?:\/.*)?$/i,
];

export async function proxy(request: NextRequest) {
  if (request.headers.has("x-middleware-subrequest")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (BLOCKED_PATHS.some((pattern) => pattern.test(request.nextUrl.pathname))) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)$).*)",
  ],
};
