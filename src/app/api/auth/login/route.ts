import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getLoginRateLimitIdentity,
  getSessionToken,
  verifyCredentials,
} from "@/lib/auth";
import {
  checkLoginRateLimit,
  clearLoginFailures,
  recordLoginFailure,
} from "@/lib/login-rate-limit";
import { readBoundedJson, RequestBodyTooLargeError } from "@/lib/request-body";

const MAX_LOGIN_BODY_BYTES = 4 * 1024;

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { ok: false, message: "Terlalu banyak percobaan. Coba lagi beberapa saat." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, retryAfterSeconds)) },
    },
  );
}

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return NextResponse.json({ ok: false, message: "Content-Type harus application/json." }, { status: 415 });
    }

    const { username, email, password } = await readBoundedJson<{
      username?: string;
      email?: string;
      password?: string;
    }>(request, MAX_LOGIN_BODY_BYTES);
    const identifier = username ?? email;
    if (typeof identifier !== "string" || typeof password !== "string") {
      return NextResponse.json({ ok: false, message: "Username dan password wajib berupa teks." }, { status: 400 });
    }
    if (identifier.length > 254 || password.length > 512) {
      return NextResponse.json({ ok: false, message: "Username atau password terlalu panjang." }, { status: 400 });
    }

    const rateLimit = await checkLoginRateLimit(request, getLoginRateLimitIdentity(identifier));
    if (!rateLimit.allowed) return rateLimitedResponse(rateLimit.retryAfterSeconds);

    if (!verifyCredentials(identifier, password)) {
      const retryAfterSeconds = await recordLoginFailure(rateLimit.keys);
      if (retryAfterSeconds > 0) return rateLimitedResponse(retryAfterSeconds);
      return NextResponse.json({ ok: false, message: "Username atau password salah." }, { status: 401 });
    }

    await clearLoginFailures(rateLimit.keys);
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: getSessionToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ ok: false, message: "Request terlalu besar." }, { status: 413 });
    }
    if (error instanceof SyntaxError || error instanceof TypeError) {
      return NextResponse.json({ ok: false, message: "Format request tidak valid." }, { status: 400 });
    }
    console.error("Login gagal diproses:", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, message: "Layanan login sedang tidak tersedia." }, { status: 503 });
  }
}
