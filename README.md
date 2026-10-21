# Hotel PNS Nakshatra

Hotel PNS Nakshatra is a React 19 and Next.js App Router website styled with Tailwind CSS 4.
The existing page components, design system, images, transitions, and browser-side interactions
are retained in `src/`; Next.js route entries live in `app/`.

## Development

Use Node.js 20.9 or later.

```sh
npm install
npm run dev
```

Available checks and production commands:

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

The production build runs on the Next.js server. Do not configure this application as a static
export: its App Router runtime, metadata routes, and Vercel analytics integration require Next.js
deployment support.

## Routes

| URL                           | Page                                  |
| ----------------------------- | ------------------------------------- |
| `/`                           | Home                                  |
| `/about-us`                   | About                                 |
| `/rooms`                      | Rooms                                 |
| `/dining`                     | Dining                                |
| `/gallery`                    | Gallery                               |
| `/contact`                    | Home page with the contact panel open |
| `/privacy-policy`             | Privacy policy                        |
| `/terms-and-conditions`       | Terms                                 |
| `/refund-cancellation-policy` | Refund and cancellation policy        |
| `/admin`                      | Admin dashboard prototype             |
| `/admin/login`                | Admin login prototype                 |
| `/admin/create-account`       | Admin account prototype               |
| `/admin/forgot-password`      | Password reset prototype              |

The admin pages are not protected by real authentication or authorization. Their current form
handlers are prototypes, and image settings are stored in the current browser only. Do not treat
the admin interface as a production administration system.

## Room and dining image libraries

The public room and dining pages, homepage previews, galleries, and admin selectors read from
`src/services/roomImageRepository.ts`. Existing image binaries remain in `src/assets/rooms/` and
`src/assets/dining/`; `src/lib/asset-manifest.ts` statically maps these assets for Next.js builds.

When adding a supported room or dining photograph, place it in its existing category folder and
add its static import and path entry to `src/lib/asset-manifest.ts`. Image selection, display order,
and dining display-count settings are versioned in browser `localStorage`; images are bundled into
the website and are not uploaded or synchronized. Local storage is not shared between visitors or
browsers.

Hero slide images are also statically listed in `src/lib/asset-manifest.ts`. Preserve their source
files and update the corresponding manifest entries when changing those collections.

## Environment and deployment

`SITE_URL` is an optional server-only environment variable used for canonical URLs, the sitemap,
and `robots.txt`. It defaults to `https://hotelpnsnakshatra.com`; set it to the canonical HTTPS
origin for a different production domain before building. These metadata routes are generated at
build time. The variable is read only by server-side code and is not exposed to browser code.

Public pages include page-specific titles, descriptions, canonical URLs, Open Graph and Twitter
metadata. The root layout also emits Hotel structured data using the existing site name, address,
and contact number. Admin URLs are marked `noindex` and excluded from the sitemap.

Vercel should use its Next.js framework detection and the normal `npm run build` command. The
custom `vercel.json` security headers remain in place; the old Vite SPA rewrite has been removed.
Keep environment values in the deployment platform rather than committing private `.env` files.

The admin image controls use the Next.js server runtime. Room image routes are
`/api/admin/room-images` and `/api/admin/room-images/:imageId`; dining image routes are
`/api/admin/dining-images` and `/api/admin/dining-images/:imageId`. Both collections support
authenticated `GET`, multipart `POST` uploads, JSON URL `POST` requests, and `DELETE`. Public
website consumers read `/api/images/room?type=...` and `/api/images/dining?type=...`, while bundled
assets remain the fallback if the public read is unavailable.

Set `ADMIN_IMAGE_API_TOKEN` in the deployment environment before using the admin controls. The
existing login screens are still prototypes and do not establish a server session, so the current
admin UI asks for this deployment token and keeps it only in session storage. Do not expose this
token in source control. Upload metadata is stored in `data/uploads/image-manifest.json` and files
in `public/uploads/<room-or-dining>/<category>/` by default. Set `PNS_IMAGE_MANIFEST` and
`PNS_IMAGE_STORAGE_DIR` to a persistent mounted volume or object-storage adapter in deployments
where the local filesystem is ephemeral, such as serverless hosting. External URLs are stored as
references and are never downloaded or deleted remotely.
