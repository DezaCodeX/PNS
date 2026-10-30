import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const manifestPath = path.resolve(process.env.PNS_IMAGE_MANIFEST ?? "data/uploads/image-manifest.json");
  const raw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  const entries = Array.isArray(manifest?.images) ? manifest.images : [];

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE ??
    "";

  if (!url || !key) {
    console.warn("No Supabase credentials found; skipping image-manifest import.");
    process.exit(0);
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const rows = entries.map((image) => {
    const destinationKey = image.destinationKey ?? `${image.category ?? "unknown"}:${image.id ?? image.filename ?? "item"}`;
    const folderPath = image.path ?? image.folderPath ?? "uploads/unknown";
    const publicUrlPrefix = image.publicUrlPrefix ?? image.url ?? "";
    const displayPlacement = image.displayLocation ?? image.display_placement ?? "gallery";
    const metadata = {
      id: image.id ?? null,
      category: image.category ?? null,
      sourceType: image.sourceType ?? null,
      filename: image.filename ?? null,
      url: image.url ?? null,
      path: image.path ?? null,
      deleted: Boolean(image.deleted),
      active: image.active ?? true,
    };

    return {
      config_key: `manifest:${image.id ?? destinationKey}`,
      category: String(image.category ?? "unknown"),
      destination_key: String(destinationKey),
      folder_path: String(folderPath),
      public_url_prefix: publicUrlPrefix ? String(publicUrlPrefix) : null,
      display_placement: String(displayPlacement),
      metadata,
    };
  });

  if (!rows.length) {
    console.log(`No image-manifest entries found in ${manifestPath}.`);
    process.exit(0);
  }

  const { error } = await client.from("image_manifest_config").upsert(rows, {
    onConflict: "config_key",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Imported ${rows.length} image-manifest entries into Supabase.`);
}

main().catch((error) => {
  console.error("Failed to import image manifest.", error);
  process.exit(1);
});
