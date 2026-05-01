# upnest — Admin Console (Next.js)

Operator console for the upnest platform. Mirrors the original `upnest.html` Admin app pixel-for-pixel.

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3001

## Architecture

The original app was authored as inline-JSX components compiled in the browser via `@babel/standalone`. Each component attaches itself to `window` (e.g. `window.AdminApp`) and reads from other globals.

To preserve **pixel-perfect fidelity** with the original, we keep that runtime intact:

- All `.jsx` source files live under `public/src/` and are served as static assets.
- `app/page.tsx` loads React, ReactDOM and Babel UMD bundles, then loads each `.jsx` file with `type="text/babel"` so the browser compiles them — exactly like the original HTML.
- `app/globals.css` is the original `styles.css`, untouched.

## Auth (demo)

Auth state is kept in `localStorage` under `upnest:auth`. Click "→ Overview" in the bottom route bar (or the Login screen "Enter as admin" button) to sign in.

## Mock data

All data is generated in `public/src/AdminData.jsx` — no backend.
