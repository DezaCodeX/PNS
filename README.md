# Dynamic 3D Realm

i need to build a website based on the given details attached using the react i need it as 3d attractive dynamic

This project was built with [Lovable](https://lovable.dev).

##

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9df929d2-a46a-4f68-bfdb-f7f5fe9f088c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Room image library

Place room photographs under `src/assets/rooms/<room-type>/` using one of the supported image
extensions (`webp`, `avif`, `jpg`, `jpeg`, or `png`). Vite discovers and bundles those files at
build time; adding a file locally does not upload it to the deployed site. The room types are
`vajra`, `garuda`, `arohana`, `madhurya`, and `maayukha`.

The homepage room cards, Rooms page, and room gallery read the same typed repository in
`src/services/roomImageRepository.ts`. Their destination selections are independent and default to
enabled for each discovered image. The local adapter stores only versioned selection/order metadata
in this browser's localStorage; it does not synchronize settings between browsers or visitors.

## Dining image library

Place dining photographs under `src/assets/dining/<category>/` using the supported image extensions
listed above. The categories are `vrindavan`, `cloud9`, and `clinq`. Vite discovers and bundles
these assets at build time; adding a file locally does not upload it to the deployed site.

The homepage, Dining page and hero, About facility imagery, and Dining gallery groups use the
dining records discovered by `src/services/roomImageRepository.ts`. Each image has independent
destination selections. The Dining page and hero each have a per-category display count from one to
three, bounded by how many active images are selected for that destination. Versioned selection,
display-order, and count metadata is stored in this browser's localStorage; image binaries are not.
New dining images default to enabled for each destination.

The current `/admin` dashboard and login are prototypes (the login does not authenticate users).
Dining image-management controls are available in the dashboard without authentication for now;
image selections remain local to this browser and are not shared with visitors. Add real server-side
authentication and authorization before using this as a production admin workflow. Future uploads
need a backend to validate and store files locally on the server or in object storage; browser code
must not contain AWS credentials or write arbitrary server paths.
hello
