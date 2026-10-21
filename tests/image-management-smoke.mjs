import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { test } from "node:test";

const baseUrl = process.env.IMAGE_TEST_BASE_URL ?? "http://localhost:3100";
const token = process.env.IMAGE_TEST_TOKEN ?? "test-token";
const manifestPath = process.env.PNS_IMAGE_MANIFEST ?? "/tmp/pns-image-manifest-test.json";
const storageRoot = process.env.PNS_IMAGE_STORAGE_DIR ?? "/tmp/pns-image-storage-test";
const authHeaders = { Authorization: `Bearer ${token}` };
const rooms = ["vajra", "garuda", "arohana", "madhurya", "maayukha"];
const dining = ["vrindavan", "cloud9", "clinq"];
const created = [];

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const body = await response.json();
  return { response, body };
}

function imageUrl(collection, category) {
  return `/api/admin/${collection}-images?type=${category}`;
}

async function addUrl(collection, category, imageUrlValue) {
  const result = await request(`/api/admin/${collection}-images`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ category, imageUrl: imageUrlValue }),
  });
  assert.equal(result.response.status, 201);
  assert.equal(result.body.success, true);
  created.push({ collection, category, id: result.body.image.id });
  return result.body.image;
}

async function removeCreatedImages() {
  for (const item of created.reverse()) {
    await request(
      `/api/admin/${item.collection}-images/${encodeURIComponent(item.id)}?type=${item.category}`,
      {
        method: "DELETE",
        headers: authHeaders,
      },
    );
  }
}

test.after(async () => {
  await removeCreatedImages();
});

test("SEC-001/SEC-013 admin mutations require authorization", async () => {
  const result = await request(imageUrl("room", "arohana"));
  assert.equal(result.response.status, 401);
  assert.equal(result.body.error.code, "unauthorized");
});

test("ROOM-GET-001/004 every room category is isolated", async () => {
  for (const category of rooms) {
    const result = await request(imageUrl("room", category), { headers: authHeaders });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.category, category);
    assert.ok(result.body.images.length > 0);
    assert.ok(result.body.images.every((image) => image.category === category));
  }
});

test("DINING-GET-001 every dining category is isolated", async () => {
  for (const category of dining) {
    const result = await request(imageUrl("dining", category), { headers: authHeaders });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.category, category);
    assert.ok(result.body.images.length > 0);
    assert.ok(result.body.images.every((image) => image.category === category));
  }
});

test("ROOM-GET-002/003 and DINING-GET invalid categories return validation responses", async () => {
  const emptyRoom = await request(imageUrl("room", "arohana"), { headers: authHeaders });
  assert.equal(emptyRoom.response.status, 200);
  const invalidRoom = await request(imageUrl("room", "does-not-exist"), { headers: authHeaders });
  const invalidDining = await request(imageUrl("dining", "does-not-exist"), {
    headers: authHeaders,
  });
  assert.equal(invalidRoom.response.status, 400);
  assert.equal(invalidDining.response.status, 400);
});

test("ROOM-POST-001/002/003 and DINING-POST upload supported image formats", async () => {
  const fixtures = [
    ["room", "arohana", "image/jpeg", "room-fixture.jpg"],
    ["room", "garuda", "image/png", "room-fixture.png"],
    ["room", "vajra", "image/webp", "room-fixture.webp"],
    ["dining", "vrindavan", "image/png", "dining-fixture.png"],
  ];
  for (const [collection, category, type, name] of fixtures) {
    const form = new FormData();
    form.set("category", category);
    form.set("file", new File([Buffer.from(`fixture-${type}`)], name, { type }));
    const result = await request(`/api/admin/${collection}-images`, {
      method: "POST",
      headers: authHeaders,
      body: form,
    });
    assert.equal(result.response.status, 201);
    assert.equal(result.body.image.sourceType, "upload");
    assert.equal(result.body.image.category, category);
    assert.match(result.body.image.path, new RegExp(`^uploads/${collection}/${category}/`));
    assert.ok(existsSync(`${storageRoot}/${result.body.image.path.replace(/^uploads\//, "")}`));
    created.push({ collection, category, id: result.body.image.id, path: result.body.image.path });
  }
});

test("ROOM-POST-004/005/006/007/008 server-side upload validation", async () => {
  const invalidType = new FormData();
  invalidType.set("category", "arohana");
  invalidType.set("file", new File(["not an image"], "bad.txt", { type: "text/plain" }));
  const invalidTypeResult = await request("/api/admin/room-images", {
    method: "POST",
    headers: authHeaders,
    body: invalidType,
  });
  assert.equal(invalidTypeResult.response.status, 400);
  assert.equal(invalidTypeResult.body.error.code, "invalid_file_type");

  const tooLarge = new FormData();
  tooLarge.set("category", "arohana");
  tooLarge.set(
    "file",
    new File([Buffer.alloc(8 * 1024 * 1024 + 1)], "large.png", { type: "image/png" }),
  );
  const tooLargeResult = await request("/api/admin/room-images", {
    method: "POST",
    headers: authHeaders,
    body: tooLarge,
  });
  assert.equal(tooLargeResult.response.status, 400);
  assert.equal(tooLargeResult.body.error.code, "file_too_large");

  for (const body of [
    { category: "arohana" },
    { imageUrl: "https://example.com/a.webp" },
    { category: "bad", imageUrl: "https://example.com/a.webp" },
  ]) {
    const result = await request("/api/admin/room-images", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    assert.equal(result.response.status, 400);
  }
});

test("ROOM-URL and DINING-URL URL policy and category persistence", async () => {
  const roomImage = await addUrl("room", "arohana", "  https://images.example.test/room.webp  ");
  const diningImage = await addUrl("dining", "cloud9", "http://images.example.test/dining.png");
  assert.equal(roomImage.url, "https://images.example.test/room.webp");
  assert.equal(diningImage.path, null);
  assert.equal(diningImage.sourceType, "external");
  for (const value of [
    "not-a-url",
    "javascript:alert(1)",
    "file:///etc/passwd",
    "data:image/png;base64,abc",
  ]) {
    const result = await request("/api/admin/room-images", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ category: "arohana", imageUrl: value }),
    });
    assert.equal(result.response.status, 400);
  }
});

test("ROOM-DELETE/DINING-DELETE correct records, files, and isolation", async () => {
  const roomImage = await addUrl(
    "room",
    "madhurya",
    "https://images.example.test/delete-room.webp",
  );
  const diningImage = await addUrl(
    "dining",
    "clinq",
    "https://images.example.test/delete-dining.webp",
  );
  const wrongCategory = await request(
    `/api/admin/room-images/${encodeURIComponent(roomImage.id)}?type=vajra`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );
  assert.equal(wrongCategory.response.status, 404);
  const wrongCollection = await request(
    `/api/admin/dining-images/${encodeURIComponent(roomImage.id)}?type=clinq`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );
  assert.equal(wrongCollection.response.status, 404);
  const deleteRoom = await request(
    `/api/admin/room-images/${encodeURIComponent(roomImage.id)}?type=madhurya`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );
  assert.equal(deleteRoom.response.status, 200);
  const roomAfter = await request(imageUrl("room", "madhurya"), { headers: authHeaders });
  assert.ok(!roomAfter.body.images.some((image) => image.id === roomImage.id));
  const deleteDining = await request(
    `/api/admin/dining-images/${encodeURIComponent(diningImage.id)}?type=clinq`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );
  assert.equal(deleteDining.response.status, 200);
  const missing = await request(
    `/api/admin/dining-images/${encodeURIComponent(diningImage.id)}?type=clinq`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );
  assert.equal(missing.response.status, 404);
});

test("PERSIST-001/002/003/004 metadata and storage persist across reads", async () => {
  const image = await addUrl("room", "maayukha", "https://images.example.test/persist.webp");
  const first = await request(imageUrl("room", "maayukha"), { headers: authHeaders });
  const second = await request(imageUrl("room", "maayukha"), { headers: authHeaders });
  assert.ok(first.body.images.some((candidate) => candidate.id === image.id));
  assert.deepEqual(
    second.body.images.find((candidate) => candidate.id === image.id),
    first.body.images.find((candidate) => candidate.id === image.id),
  );
  assert.ok(readFileSync(manifestPath, "utf8").includes(image.id));
});

test("REG-003 public routes never mix collections", async () => {
  for (const category of rooms) {
    const result = await request(`/api/images/room?type=${category}`);
    assert.equal(result.response.status, 200);
    assert.ok(result.body.images.every((image) => image.category === category));
  }
  for (const category of dining) {
    const result = await request(`/api/images/dining?type=${category}`);
    assert.equal(result.response.status, 200);
    assert.ok(result.body.images.every((image) => image.category === category));
  }
});

process.on("exit", () => {
  if (process.env.KEEP_IMAGE_TEST_DATA !== "1") {
    rmSync(manifestPath, { force: true });
    rmSync(storageRoot, { recursive: true, force: true });
  }
});
