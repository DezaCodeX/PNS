import { createClient } from "@supabase/supabase-js";
import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);
const email = process.env.INITIAL_SUPERADMIN_EMAIL ?? "dezacodex@gmail.com";
const password = process.env.INITIAL_SUPERADMIN_PASSWORD;
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key || !password) {
  console.error(
    "Set SUPABASE_URL, SUPABASE_SECRET_KEY, and INITIAL_SUPERADMIN_PASSWORD before bootstrapping.",
  );
  process.exit(1);
}
if (password.length < 12) {
  console.error("INITIAL_SUPERADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}

const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const normalizedEmail = email.trim().toLowerCase();
const { data: role, error: roleError } = await db
  .from("admin_roles")
  .select("id")
  .eq("name", "Super Admin")
  .single();
if (roleError) throw roleError;
const { data: existing, error: existingError } = await db
  .from("admin_users")
  .select("id")
  .eq("email", normalizedEmail)
  .maybeSingle();
if (existingError) throw existingError;
if (existing) {
  console.log("Super Admin already exists; no password was changed.");
  process.exit(0);
}

const salt = randomBytes(16);
const derived = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
const passwordHash = `scrypt$16384$8$1$${salt.toString("base64url")}$${Buffer.from(derived).toString("base64url")}`;
const { data: user, error: userError } = await db
  .from("admin_users")
  .insert({
    email: normalizedEmail,
    display_name: "Super Admin",
    password_hash: passwordHash,
    role_id: role.id,
  })
  .select("id")
  .single();
if (userError) throw userError;
const { data: group, error: groupError } = await db
  .from("admin_groups")
  .select("id")
  .eq("name", "Super Admins")
  .single();
if (groupError) throw groupError;
const { error: membershipError } = await db
  .from("admin_user_groups")
  .insert({ user_id: user.id, group_id: group.id });
if (membershipError && membershipError.code !== "23505") throw membershipError;
console.log("Super Admin bootstrap completed.");
