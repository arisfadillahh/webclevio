import crypto from "node:crypto";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@clevio.id";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "clevio123";
const AUTH_SECRET = process.env.AUTH_SECRET || "clevio-secret";

export const ADMIN_SESSION_COOKIE = "clevio_admin_token";

export function verifyCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function getSessionToken(): string {
  return crypto
    .createHash("sha256")
    .update(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}:${AUTH_SECRET}`)
    .digest("hex");
}

export function isValidToken(token?: string | null): boolean {
  if (!token) return false;
  return token === getSessionToken();
}
