"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type ManagedImageRecord = {
  id: string;
  category: string;
  url: string;
  path: string | null;
  sourceType: "bundled" | "upload" | "external";
  filename: string | null;
};

type ImageManagementControlsProps = {
  collection: "room" | "dining";
  category: string;
  categoryLabel: string;
};

const tokenStorageKey = "pns-admin-image-token";

export function ImageManagementControls({
  collection,
  category,
  categoryLabel,
}: ImageManagementControlsProps) {
  const [token, setToken] = useState("");
  const [images, setImages] = useState<ManagedImageRecord[]>([]);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const endpoint = `/api/admin/${collection}-images`;

  useEffect(() => {
    setToken(sessionStorage.getItem(tokenStorageKey) ?? "");
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(url.trim() || null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, url]);

  const requestHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${endpoint}?type=${encodeURIComponent(category)}`, {
        headers: requestHeaders,
        cache: "no-store",
      });
      const body = (await response.json()) as {
        images?: ManagedImageRecord[];
        error?: { message?: string };
      };
      if (!response.ok) throw new Error(body.error?.message ?? "Images could not be loaded.");
      setImages(body.images ?? []);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Images could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [category, endpoint, requestHeaders]);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  const saveToken = (value: string) => {
    setToken(value);
    if (value) sessionStorage.setItem(tokenStorageKey, value);
    else sessionStorage.removeItem(tokenStorageKey);
  };

  const resetForm = () => {
    setFile(null);
    setUrl("");
    setPreview(null);
  };

  const addImage = async () => {
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      let response: Response;
      if (file) {
        const form = new FormData();
        form.set("category", category);
        form.set("file", file);
        response = await fetch(endpoint, { method: "POST", headers: requestHeaders, body: form });
      } else {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { ...requestHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ category, imageUrl: url.trim() }),
        });
      }
      const body = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? "Image could not be added.");
      resetForm();
      setFeedback("Image saved on the server.");
      await loadImages();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Image could not be added.");
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async (image: ManagedImageRecord) => {
    if (!window.confirm(`Delete this image from ${categoryLabel}?`)) return;
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      const response = await fetch(
        `${endpoint}/${encodeURIComponent(image.id)}?type=${encodeURIComponent(category)}`,
        {
          method: "DELETE",
          headers: requestHeaders,
        },
      );
      const body = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? "Image could not be deleted.");
      setFeedback("Image deleted.");
      await loadImages();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Image could not be deleted.");
    } finally {
      setSaving(false);
    }
  };

  const canSave = Boolean(file || url.trim()) && !saving;

  return (
    <section
      className="rounded-2xl border border-[var(--color-border-warm)] bg-white/50 p-5"
      aria-labelledby={`${collection}-${category}-crud-title`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gold)]">
            Server-managed media
          </p>
          <h3
            id={`${collection}-${category}-crud-title`}
            className="mt-1 text-xl font-semibold text-[#051838]"
          >
            {categoryLabel} images
          </h3>
          <p className="mt-1 text-sm text-[#46536b]">
            {images.length} saved image{images.length === 1 ? "" : "s"}
          </p>
        </div>
        <label className="grid gap-1 text-xs text-[#46536b]">
          Admin API token
          <input
            type="password"
            value={token}
            onChange={(event) => saveToken(event.target.value)}
            placeholder="Configured deployment token"
            className="rounded-lg border border-[var(--color-border-warm)] bg-white px-3 py-2 text-sm text-[#051838]"
            autoComplete="off"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl border border-[var(--color-border-warm)] bg-white/60 p-4 md:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm text-[#46536b]">
            Upload from computer
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setUrl("");
              }}
              disabled={saving}
              className="block w-full rounded-lg border border-[var(--color-border-warm)] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="grid gap-1 text-sm text-[#46536b]">
            Add image URL
            <input
              type="url"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setFile(null);
              }}
              placeholder="https://example.com/image.webp"
              disabled={saving}
              className="rounded-lg border border-[var(--color-border-warm)] bg-white px-3 py-2 text-sm text-[#051838]"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            onClick={() => void addImage()}
            disabled={!canSave}
            className="luxury-button px-4 py-2 text-xs uppercase tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save image"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="rounded-lg border border-[var(--color-border-warm)] px-4 py-2 text-xs text-[#051838] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
        {preview ? (
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[#46536b]">Preview</p>
            <img
              src={preview}
              alt="Selected image preview"
              className="h-28 w-44 rounded-lg object-cover"
            />
          </div>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-[#46536b]" role="status">
          Loading images...
        </p>
      ) : null}
      {error ? (
        <p
          className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {feedback ? (
        <p
          className="mt-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900"
          role="status"
        >
          {feedback}
        </p>
      ) : null}
      {!loading && !error && images.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-[var(--color-border-warm)] p-5 text-sm text-[#46536b]">
          No server-managed images in this category.
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => (
          <article
            key={image.id}
            className="overflow-hidden rounded-xl border border-[var(--color-border-warm)] bg-white"
          >
            <img
              src={image.url}
              alt={`${categoryLabel} managed image`}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="grid gap-2 p-3 text-xs text-[#46536b]">
              <p className="font-medium text-[#051838]">
                {image.sourceType === "external"
                  ? "External URL"
                  : image.sourceType === "bundled"
                    ? "Bundled website asset"
                    : "Uploaded image"}
              </p>
              <p className="break-all">
                <strong>Image URL:</strong> {image.url}
              </p>
              <p className="break-all">
                <strong>Storage path:</strong> {image.path ?? "External URL"}
              </p>
              <button
                type="button"
                onClick={() => void deleteImage(image)}
                disabled={saving}
                className="mt-1 w-fit rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-800 disabled:opacity-50"
              >
                Delete image
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
