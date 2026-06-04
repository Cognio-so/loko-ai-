import "server-only";

import { NextResponse } from "next/server";
import { RateLimiter } from "@/lib/rate-limit";

const DEFAULT_MAX_JSON_BYTES = 1_000_000;
const mutationLimiter = RateLimiter({
  uniqueTokenPerInterval: 2_000,
  interval: 60 * 1000,
});

export function getClientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export function getAllowedOrigins() {
  return [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.NODE_ENV !== "production" ? "http://localhost:3000" : undefined,
    process.env.NODE_ENV !== "production" ? "http://localhost:302" : undefined,
  ].filter((origin): origin is string => Boolean(origin));
}

export function isAllowedOrigin(origin: string | null) {
  if (!origin) return true;

  try {
    const parsed = new URL(origin);
    if (process.env.NODE_ENV !== "production" && parsed.hostname === "localhost") {
      return true;
    }

    return getAllowedOrigins().some((allowedOrigin) => {
      try {
        const allowed = new URL(allowedOrigin);
        return parsed.origin === allowed.origin;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

export function securityHeaders(origin = "") {
  const allowedOrigin = isAllowedOrigin(origin) && origin ? origin : getAllowedOrigins()[0] || "";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

export function preflightResponse(req: Request) {
  const origin = req.headers.get("origin");

  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "Origin is not allowed." }, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: securityHeaders(origin || ""),
  });
}

export function rejectInvalidOrigin(req: Request) {
  const origin = req.headers.get("origin");

  if (!isAllowedOrigin(origin)) {
    return NextResponse.json(
      { error: "Origin is not allowed." },
      { status: 403, headers: securityHeaders("") }
    );
  }

  return null;
}

export function rejectRateLimited(req: Request, limit = 30) {
  const res = new NextResponse();
  const ip = getClientIp(req);

  if (mutationLimiter.check(res, limit, ip)) {
    return null;
  }

  return NextResponse.json(
    { error: "Too many requests. Please retry shortly." },
    { status: 429, headers: res.headers }
  );
}

export async function readJsonBody<T>(req: Request, maxBytes = DEFAULT_MAX_JSON_BYTES): Promise<T> {
  const contentLength = req.headers.get("content-length");

  if (contentLength && Number(contentLength) > maxBytes) {
    throw new Error("Request body is too large.");
  }

  return (await req.json()) as T;
}

export function validatePrompt(prompt: unknown, maxLength = 20_000) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    return "Prompt is required.";
  }

  if (prompt.length > maxLength) {
    return `Prompt must be ${maxLength} characters or less.`;
  }

  return null;
}

export function guarded<Args extends unknown[]>(
  handler: (req: Request, ...args: Args) => Promise<Response>,
  limit = 30
) {
  return async function guardedHandler(req: Request, ...args: Args) {
    const originError = rejectInvalidOrigin(req);
    if (originError) return originError;

    const rateLimitError = rejectRateLimited(req, limit);
    if (rateLimitError) return rateLimitError;

    const response = await handler(req, ...args);
    const headers = securityHeaders(req.headers.get("origin") || "");
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  };
}
