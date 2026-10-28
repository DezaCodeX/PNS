import { createClient } from "@supabase/supabase-js";
import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);
const email = (process.env.INITIAL_SUPERADMIN_EMAIL ?? "dezacodex@gmail.com").trim().toLowerCase();
const password = process.env.INITIAL_SUPERADMIN_PASSWORD ?? "";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE;

function isPlaceholderValue(value) {
  if (!value) return true;
  const normalized = String(value).trim();
  return (
    normalized === "[SENSITIVE]" ||
    normalized === "your-server-only-secret-key" ||
    normalized === "your-project.supabase.co" ||
    normalized === "https://your-project.supabase.co" ||
    normalized.startsWith("https://your-project") ||
    normalized.startsWith("your-") ||
    normalized.includes("replace-with-")
  );
}

async function readLocalStore() {
  const filePath = path.join(process.cwd(), "data", "admin-auth-store.json");
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return { users: [], sessions: [], audit: [] };
  }
}

async function writeLocalStore(store) {
  const filePath = path.join(process.cwd(), "data", "admin-auth-store.json");
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(store, null, 2));
}

if (!url || !key || isPlaceholderValue(url) || isPlaceholderValue(key)) {
  const store = await readLocalStore();
  const existing = store.users.find((user) => user.email === email);
  if (existing) {
    console.log("Local Super Admin already exists; no password was changed.");
    process.exit(0);
  }
  if (!password || password.length < 8) {
    console.error("INITIAL_SUPERADMIN_PASSWORD must be set to a strong value with at least 8 characters.");
    process.exit(1);
  }
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
  const passwordHash = `scrypt$16384$8$1$${salt.toString("base64url")}$${Buffer.from(derived).toString("base64url")}`;
  store.users.push({
    id: crypto.randomUUID(),
    email,
    display_name: "Super Admin",
    password_hash: passwordHash,
    status: "active",
    role_name: "Super Admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: null,
  });
  await writeLocalStore(store);
  console.log("Local Super Admin bootstrap completed.");
  process.exit(0);
}

if (!password || password.length < 8) {
  console.error("INITIAL_SUPERADMIN_PASSWORD must be set to a strong value with at least 8 characters.");
  process.exit(1);
}

const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: role, error: roleError } = await db
  .from("admin_roles")
  .select("id")
  .eq("name", "Super Admin")
  .single();
if (roleError) throw roleError;
const { data: existing, error: existingError } = await db
  .from("super_admins")
  .select("id")
  .eq("email", email)
  .maybeSingle();
if (existingError) throw existingError;
if (existing) {
  console.log("Super Admin already exists; no password was changed.");
  process.exit(0);
}

const passwordHash = await bcryptHash(password);
const { data: created, error: insertError } = await db
  .from("super_admins")
  .insert({
    email,
    password_hash: passwordHash,
    is_active: true,
  })
  .select("id")
  .single();
if (insertError) throw insertError;
console.log(`Super Admin bootstrap completed for ${email}.`);

async function bcryptHash(value) {
  const bcrypt = (await import("bcrypt")).default;
  return bcrypt.hash(value, 12);
}
