import assert from "node:assert/strict";
import test from "node:test";

import { validateAuthConfig } from "../src/lib/auth.ts";
import { getPostgresSslConfig } from "../src/lib/postgres-ssl.ts";
import { readBoundedJson, RequestBodyTooLargeError } from "../src/lib/request-body.ts";
import { getSafeLocalPath } from "../src/lib/safe-local-path.ts";

test("getSafeLocalPath preserves local paths and rejects external variants", () => {
  assert.equal(getSafeLocalPath("/admin/content?tab=hero"), "/admin/content?tab=hero");
  for (const value of [
    "https://example.invalid",
    "//example.invalid",
    "/\\example.invalid",
    "javascript:alert(1)",
    "/admin\nhttps://example.invalid",
  ]) {
    assert.equal(getSafeLocalPath(value), "/admin");
  }
});

test("readBoundedJson accepts normal JSON and rejects fixed or streamed overflow", async () => {
  const normal = new Request("http://localhost/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "valid" }),
  });
  assert.deepEqual(await readBoundedJson(normal, 1024), { username: "admin", password: "valid" });

  const fixedOverflow = new Request("http://localhost/login", {
    method: "POST",
    headers: { "content-length": "2048" },
    body: "{}",
  });
  await assert.rejects(() => readBoundedJson(fixedOverflow, 1024), RequestBodyTooLargeError);

  const streamedOverflow = new Request("http://localhost/login", {
    method: "POST",
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(600));
        controller.enqueue(new Uint8Array(600));
        controller.close();
      },
    }),
    duplex: "half",
  } as RequestInit & { duplex: "half" });
  await assert.rejects(() => readBoundedJson(streamedOverflow, 1024), RequestBodyTooLargeError);
});

test("validateAuthConfig fails closed on defaults and enforces production strength", () => {
  assert.throws(() => validateAuthConfig({}, false), /ADMIN_USERNAME/);
  assert.throws(() => validateAuthConfig({
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "clevio123",
    AUTH_SECRET: "clevio-development-secret",
  }, false), /default/i);
  assert.throws(() => validateAuthConfig({
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "short",
    AUTH_SECRET: "a".repeat(64),
  }, true), /16 karakter/);
  assert.deepEqual(validateAuthConfig({
    ADMIN_USERNAME: "admin",
    ADMIN_PASSWORD: "a-strong-random-password",
    AUTH_SECRET: "a".repeat(64),
  }, true), {
    username: "admin",
    password: "a-strong-random-password",
    secret: "a".repeat(64),
  });
});

test("getPostgresSslConfig verifies peers and supports explicit CA material", () => {
  const previousMode = process.env.DATABASE_SSL;
  const previousCertificate = process.env.DATABASE_CA_CERT;
  try {
    delete process.env.DATABASE_SSL;
    delete process.env.DATABASE_CA_CERT;
    assert.equal(getPostgresSslConfig(), undefined);

    process.env.DATABASE_SSL = "require";
    assert.deepEqual(getPostgresSslConfig(), { rejectUnauthorized: true });

    process.env.DATABASE_CA_CERT = "line-1\\nline-2";
    assert.deepEqual(getPostgresSslConfig(), { rejectUnauthorized: true, ca: "line-1\nline-2" });
  } finally {
    if (previousMode === undefined) delete process.env.DATABASE_SSL;
    else process.env.DATABASE_SSL = previousMode;
    if (previousCertificate === undefined) delete process.env.DATABASE_CA_CERT;
    else process.env.DATABASE_CA_CERT = previousCertificate;
  }
});
