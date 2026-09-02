import crypto from "node:crypto";

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const KNOWN_DEFAULTS = new Set([
  "clevio123",
  "clevio-development-secret",
  "replace-with-a-long-random-password",
  "replace-with-at-least-32-random-characters",
  "ganti-dengan-string-random",
]);

interface AuthEnvironment {
  ADMIN_USERNAME?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  AUTH_SECRET?: string;
}

interface AuthConfig {
  username: string;
  password: string;
  secret: string;
}

let cachedConfig: { signature: string; value: AuthConfig } | undefined;

export const ADMIN_SESSION_COOKIE = "clevio_admin_token";

export function validateAuthConfig(environment: AuthEnvironment, isProduction: boolean): AuthConfig {
  const username = (environment.ADMIN_USERNAME || environment.ADMIN_EMAIL || "").trim();
  const password = environment.ADMIN_PASSWORD?.trim() ?? "";
  const secret = environment.AUTH_SECRET?.trim() ?? "";

  if (!username) throw new Error("ADMIN_USERNAME wajib diisi.");
  if (!password) throw new Error("ADMIN_PASSWORD wajib diisi.");
  if (!secret) throw new Error("AUTH_SECRET wajib diisi.");
  if (KNOWN_DEFAULTS.has(password) || KNOWN_DEFAULTS.has(secret)) {
    throw new Error("Kredensial default tidak boleh digunakan.");
  }
  if (isProduction && password.length < 16) {
    throw new Error("ADMIN_PASSWORD production minimal 16 karakter.");
  }
  if (isProduction && secret.length < 32) {
    throw new Error("AUTH_SECRET production minimal 32 karakter.");
  }

  return { username, password, secret };
}

function getAuthConfig() {
  const signature = [
    process.env.NODE_ENV,
    process.env.ADMIN_USERNAME,
    process.env.ADMIN_EMAIL,
    process.env.ADMIN_PASSWORD,
    process.env.AUTH_SECRET,
  ].join("\u0000");
  if (cachedConfig?.signature === signature) return cachedConfig.value;

  const value = validateAuthConfig({
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    AUTH_SECRET: process.env.AUTH_SECRET,
  }, process.env.NODE_ENV === "production");
  cachedConfig = { signature, value };
  return value;
}

export function verifyCredentials(username: string, password: string): boolean {
  const config = getAuthConfig();
  return secureEqual(username, config.username) && secureEqual(password, config.password);
}

export function getLoginRateLimitIdentity(username: string) {
  const { username: configuredUsername } = getAuthConfig();
  return secureEqual(username, configuredUsername) ? "admin" : "unknown";
}

export function getSessionToken(): string {
  const { secret } = getAuthConfig();
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_DURATION_MS })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isValidToken(token?: string | null): boolean {
  if (!token) return false;
  let secret: string;
  try {
    secret = getAuthConfig().secret;
  } catch {
    return false;
  }
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  if (!secureEqual(signature, expected)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}
