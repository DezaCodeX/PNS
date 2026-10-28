import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE;
const email =
  process.env.INITIAL_SUPERADMIN_EMAIL ??
  process.env.ADMIN_LOGIN_TEST_EMAIL ??
  "dezacodex@gmail.com";
const password =
  process.env.INITIAL_SUPERADMIN_PASSWORD ??
  process.env.ADMIN_LOGIN_TEST_PASSWORD ??
  "Mohan2212@";
const baseUrl = process.env.ADMIN_LOGIN_TEST_BASE_URL ?? "http://localhost:3000";
const sessionCookieName = "pns_admin_session";
const hasDatabaseConfig = Boolean(supabaseUrl && supabaseKey);

function parseSessionToken(setCookieHeader) {
  const value = setCookieHeader
    ?.split(";")
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(`${sessionCookieName}=`));
  if (!value) {
    throw new Error("Missing session cookie in response headers");
  }
  return decodeURIComponent(value.slice(`${sessionCookieName}=`.length));
}

test(
  "admin login persists and retrieves the session from Supabase",
  { skip: !hasDatabaseConfig },
  async () => {
    const db = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: user, error: userLookupError } = await db
      .from("admin_users")
      .select("id,email")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    assert.ifError(userLookupError);
    assert.ok(user, `No admin user was found for ${email} in Supabase`);

    const loginResponse = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    assert.equal(loginResponse.status, 200, `Login request failed: ${loginResponse.status}`);
    const loginBody = await loginResponse.json();
    assert.equal(loginBody.success, true, JSON.stringify(loginBody));
    assert.equal(loginBody.user.email, email.trim().toLowerCase());

    const sessionToken = parseSessionToken(loginResponse.headers.get("set-cookie"));
    const tokenHash = createHash("sha256").update(sessionToken).digest("hex");

    const { data: persistedSession, error: sessionLookupError } = await db
      .from("admin_sessions")
      .select("user_id,expires_at")
      .eq("token_hash", tokenHash)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    assert.ifError(sessionLookupError);
    assert.ok(persistedSession, "Admin session should be inserted into admin_sessions");
    assert.equal(persistedSession.user_id, user.id);

    const meResponse = await fetch(`${baseUrl}/api/admin/auth/me`, {
      headers: { Cookie: `${sessionCookieName}=${encodeURIComponent(sessionToken)}` },
    });

    assert.equal(meResponse.status, 200, `Auth check failed: ${meResponse.status}`);
    const meBody = await meResponse.json();
    assert.equal(meBody.user.email, email.trim().toLowerCase());
    assert.equal(meBody.user.id, user.id);
  },
);
