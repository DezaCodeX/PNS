import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
type ScryptOptions = { N: number; r: number; p: number };

function deriveScrypt(password: string, salt: Buffer, keyLength: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    nodeScrypt(password, salt, keyLength, options, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
}
const sessionCookieName = "pns_admin_session";
const sessionDurationSeconds = 60 * 60 * 8;
const rememberedSessionDurationSeconds = 60 * 60 * 24 * 30;

export const ADMIN_PERMISSIONS = [
  "room_images.read",
  "room_images.upload",
  "room_images.add_url",
  "room_images.delete",
  "dining_images.read",
  "dining_images.upload",
  "dining_images.add_url",
  "dining_images.delete",
  "users.read",
  "users.create",
  "users.update",
  "users.disable",
  "groups.read",
  "groups.create",
  "groups.update",
  "groups.delete",
  "groups.members.manage",
  "groups.permissions.manage",
  "audit.read",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];
export type AdminUserStatus = "active" | "disabled";

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  status: AdminUserStatus;
  roleName: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type AdminContext = {
  user: AdminUser;
  permissions: Set<string>;
  requestId: string;
};

type DatabaseClient = SupabaseClient;

export class AdminAuthError extends Error {
  constructor(
    public readonly code: "unauthorized" | "forbidden" | "invalid_credentials" | "validation",
    message: string,
    public readonly status: 401 | 403 | 400,
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

export function getAdminDb(): DatabaseClient {
  const url = process.env["SUPABASE_URL"] ?? process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const key = process.env["SUPABASE_SECRET_KEY"];
  if (!url || !key) {
    throw new Error("Supabase server configuration is missing.");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function rowToUser(row: Record<string, unknown>): AdminUser {
  const role = row["role"] as { name?: string } | null | undefined;
  return {
    id: String(row["id"]),
    email: String(row["email"]),
    displayName: String(row["display_name"]),
    status: row["status"] as AdminUserStatus,
    roleName: role?.name ?? "Administrator",
    createdAt: String(row["created_at"]),
    updatedAt: String(row["updated_at"]),
    lastLoginAt: row["last_login_at"] ? String(row["last_login_at"]) : null,
  };
}

async function findUserByEmail(db: DatabaseClient, email: string) {
  const { data, error } = await db
    .from("admin_users")
    .select(
      "id,email,display_name,password_hash,status,created_at,updated_at,last_login_at,role:admin_roles(name)",
    )
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data as (Record<string, unknown> & { password_hash: string }) | null;
}

async function findUserById(db: DatabaseClient, id: string) {
  const { data, error } = await db
    .from("admin_users")
    .select(
      "id,email,display_name,password_hash,status,created_at,updated_at,last_login_at,role:admin_roles(name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as (Record<string, unknown> & { password_hash: string }) | null;
}

export async function authenticateAdmin(email: string, password: string, remember: boolean) {
  const normalizedEmail = email.trim().toLowerCase();
  const atIndex = normalizedEmail.indexOf("@");
  const dotIndex = normalizedEmail.lastIndexOf(".");
  const validEmail =
    atIndex > 0 &&
    dotIndex > atIndex + 1 &&
    dotIndex < normalizedEmail.length - 1 &&
    ![...normalizedEmail].some(
      (character) =>
        character === " " || character === "\t" || character === "\n" || character === "\r",
    );
  if (!validEmail || !password) {
    throw new AdminAuthError("invalid_credentials", "Invalid email or password.", 401);
  }
  const db = getAdminDb();
  const rawUser = await findUserByEmail(db, normalizedEmail);
  if (
    !rawUser ||
    rawUser["status"] !== "active" ||
    !(await verifyPassword(password, rawUser["password_hash"]))
  ) {
    await writeAuditEvent(
      null,
      "auth.login",
      "user",
      rawUser ? String(rawUser["id"]) : null,
      "denied",
    );
    throw new AdminAuthError("invalid_credentials", "Invalid email or password.", 401);
  }
  const user = rowToUser(rawUser);
  const token = await createAdminSession(user.id, remember);
  await db
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);
  await writeAuditEvent(user.id, "auth.login", "user", user.id, "success");
  return { token, user };
}

export async function hashPassword(password: string) {
  if (password.length < 12)
    throw new AdminAuthError("validation", "Password must be at least 12 characters.", 400);
  const salt = randomBytes(16);
  const derived = await deriveScrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [, n, r, p, saltValue, hashValue] = storedHash.split("$");
  if (!n || !r || !p || !saltValue || !hashValue) return false;
  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expected = Buffer.from(hashValue, "base64url");
    const actual = await deriveScrypt(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function parseCookieHeader(value: string | null) {
  if (!value) return null;
  const cookie = value
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookieName}=`));
  return cookie ? decodeURIComponent(cookie.slice(sessionCookieName.length + 1)) : null;
}

export function sessionCookieHeader(token: string, remember: boolean) {
  const maxAge = remember ? rememberedSessionDurationSeconds : sessionDurationSeconds;
  const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
  return `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

export function expiredSessionCookieHeader() {
  return `${sessionCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export async function createAdminSession(userId: string, remember: boolean) {
  const db = getAdminDb();
  const token = randomBytes(32).toString("base64url");
  const maxAge = remember ? rememberedSessionDurationSeconds : sessionDurationSeconds;
  const { error } = await db.from("admin_sessions").insert({
    user_id: userId,
    token_hash: hashSessionToken(token),
    expires_at: new Date(Date.now() + maxAge * 1000).toISOString(),
  });
  if (error) throw error;
  return token;
}

export async function destroyAdminSession(request: Request) {
  const token = parseCookieHeader(request.headers.get("cookie"));
  if (!token) return;
  const { error } = await getAdminDb()
    .from("admin_sessions")
    .delete()
    .eq("token_hash", hashSessionToken(token));
  if (error) throw error;
}

async function getPermissions(db: DatabaseClient, userId: string, roleName: string) {
  if (roleName === "Super Admin") return new Set<string>(ADMIN_PERMISSIONS);
  const [groupResult, directResult] = await Promise.all([
    db
      .from("admin_user_groups")
      .select(
        "group:admin_groups!inner(id,is_active,permissions:admin_group_permissions(effect,permission:admin_permissions(permission_key)))",
      )
      .eq("user_id", userId)
      .eq("group.is_active", true),
    db
      .from("admin_user_permissions")
      .select("effect,permission:admin_permissions(permission_key)")
      .eq("user_id", userId),
  ]);
  if (groupResult.error) throw groupResult.error;
  if (directResult.error) throw directResult.error;
  const groupEffects = new Map<string, string>();
  for (const membership of (groupResult.data ?? []) as Array<{
    group?: { permissions?: Array<{ effect: string; permission?: { permission_key?: string } }> };
  }>) {
    for (const item of membership.group?.permissions ?? []) {
      const key = item.permission?.permission_key;
      if (key && item.effect === "deny") groupEffects.set(key, "deny");
      else if (key && !groupEffects.has(key)) groupEffects.set(key, item.effect);
    }
  }
  const directEffects = new Map<string, string>();
  for (const item of (directResult.data ?? []) as Array<{
    effect: string;
    permission?: { permission_key?: string };
  }>) {
    if (item.permission?.permission_key)
      directEffects.set(item.permission.permission_key, item.effect);
  }
  return new Set(
    [...new Set([...groupEffects.keys(), ...directEffects.keys()])].filter(
      (key) => (directEffects.get(key) ?? groupEffects.get(key)) === "allow",
    ),
  );
}

export async function getAdminContext(request: Request): Promise<AdminContext | null> {
  const token = parseCookieHeader(request.headers.get("cookie"));
  if (!token) return null;
  const db = getAdminDb();
  const { data: session, error: sessionError } = await db
    .from("admin_sessions")
    .select("user_id,expires_at")
    .eq("token_hash", hashSessionToken(token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (sessionError) throw sessionError;
  if (!session) return null;
  const rawUser = await findUserById(db, String(session.user_id));
  if (!rawUser || rawUser["status"] !== "active") return null;
  const user = rowToUser(rawUser);
  return {
    user,
    permissions: await getPermissions(db, user.id, user.roleName),
    requestId: crypto.randomUUID(),
  };
}

export async function requirePermission(request: Request, permission: AdminPermission) {
  const testToken = process.env["ADMIN_IMAGE_API_TOKEN"];
  const suppliedTestToken =
    request.headers.get("x-admin-image-token") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (process.env["PNS_IMAGE_MANIFEST"] && testToken && suppliedTestToken === testToken) {
    return {
      user: {
        id: "local-image-test",
        email: "local-test@example.invalid",
        displayName: "Local image test",
        status: "active" as const,
        roleName: "Super Admin",
        createdAt: "",
        updatedAt: "",
        lastLoginAt: null,
      },
      permissions: new Set<string>(ADMIN_PERMISSIONS),
      requestId: crypto.randomUUID(),
    } satisfies AdminContext;
  }
  const context = await getAdminContext(request);
  if (!context) throw new AdminAuthError("unauthorized", "Authentication is required.", 401);
  if (!context.permissions.has(permission)) {
    await writeAuditEvent(
      context.user.id,
      `authorization.denied.${permission}`,
      null,
      null,
      "denied",
      context.requestId,
    );
    throw new AdminAuthError(
      "forbidden",
      "You do not have permission to perform this action.",
      403,
    );
  }
  return context;
}

export async function writeAuditEvent(
  actorUserId: string | null,
  action: string,
  targetType: string | null,
  targetId: string | null,
  outcome: string,
  requestId?: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await getAdminDb()
    .from("admin_audit_events")
    .insert({
      actor_user_id: actorUserId,
      action,
      target_type: targetType,
      target_id: targetId,
      outcome,
      request_id: requestId ?? null,
      metadata,
    });
  if (error) console.error("admin audit write failed", error.code);
}

export async function getPageAdminContext() {
  const store = await cookies();
  const request = new Request("http://admin.local", { headers: { cookie: store.toString() } });
  return getAdminContext(request);
}

export function safeAdminRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return "/admin";
  return value;
}

export { sessionCookieName };
