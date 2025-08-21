# TASK_WEBAPP_FRONTEND

A React + Vite frontend for a punch-in / task-tracking application. This README is generated from a short analysis of the repository and reflects the actual code (scripts, dependencies, routing, key pages and utilities).

## Quick summary

- Vite + React app using SCSS and Tailwind plugin.
- Leaflet is used for maps (custom `mapHelpers.js` provides hybrid Google/OSM tile logic).
- Camera capture, geolocation, and a punch-in flow live in `src/pages/Punchin/PunchIn.jsx`.

## Table of contents

- About
- Scripts & dev commands
- Dependencies
- Project layout (actual)
- PunchIn page — detailed
- Map helpers & utilities
- Styling & UI notes
- ENV variables
- Build & deploy
- Tests & next steps
- Troubleshooting

## Scripts & dev commands

All scripts come from `package.json`:

```cmd
npm run dev      # start Vite dev server
npm run build    # build production files to dist/
npm run preview  # preview production build locally
npm run lint     # run ESLint
```

Install deps:

```cmd
npm install
```

Recommended Node: 18+ (use the same Node major across CI/dev machines).

## Dependencies (observed)

- react, react-dom (React 19 RC present in package.json)
- vite, @vitejs/plugin-react
- axios
- react-router-dom
- framer-motion
- leaflet
- react-icons
- react-toastify
- tailwindcss (via @tailwindcss/vite plugin)
- sass (Sass support for .scss)

DevDeps include ESLint, types for React, and Vite tooling.

## Project layout (actual)

- src/
  - api/ (PunchAPI client exists)
  - components/ (Navbar, ProtectedRoute, Modals, Punchin/AddLocation, ...)
  - pages/ (Login, Dashboard_admin, Dashboard_user, Punchin, CashBook, BankBook, Debtors)
  - utils/ (geoDis.js, geolocation.js, mapHelpers.js)
  - assets/ (images)
  - main.jsx, App.jsx (routing uses react-router-dom)

App routing notes (from `App.jsx`):
- Navbar is conditionally rendered: hidden for `/` and `/login` routes.
- Protected routes wrap dashboard/user pages and the `PunchIn` page.

## PunchIn page — detailed

Location: `src/pages/Punchin/PunchIn.jsx` — main behaviors:

- Fetches firms/customers using `PunchAPI.getFirms()` and displays a searchable dropdown.
- When a customer with latitude/longitude is selected, the UI shows a photo capture flow and map.
- Camera modal uses `navigator.mediaDevices.getUserMedia` to capture an image, converts it to a Blob/File and stores a preview URL in state.
- Geolocation: `getCurrentPosition()` from `src/utils/geolocation.js` is used to get the user's coords and show it on the map.
- Distance calculation uses `distanceKm(lat1, lon1, lat2, lon2)` from `src/utils/geoDis.js` and updates a `distance` state displayed in the UI.
- The final Punch In action is gated behind a confirmation modal (`ConfirmModal`) and shows a green Punch In button only when a location is captured.

UI/UX notes from code:
- The Punch In button lives inside the `preview_section` and appears when `capturedLocation` exists. For a sticky bottom button across the full viewport, make `.container` `min-height:100vh` and place the button as a direct child of `.container` (or use `position: fixed` on mobile).
- Camera modal is fullscreen-like and uses a dark, blurred overlay.

## Map helpers & utilities (actual behavior)

Key functions in `src/utils/mapHelpers.js`:

- `initHybridMap(container, { center, zoom })` — initializes a Leaflet map and attempts to use Google tiles first. If Google tiles fail to respond within 5s, it falls back to OpenStreetMap tiles. Returns the Leaflet map instance.
- `setViewAndMarker(map, markerRef, lat, lng, zoom)` — centers map and creates/updates a marker stored in `markerRef`.
- `addAccuracyCircle(map, lat, lng, accuracy)` — creates a Leaflet `circle` showing accuracy. Note: current implementation uses `radius: accuracy > 20 ? 10 : accuracy` which may not be the intended logic (see "Actionables" below).

Distance util: `src/utils/geoDis.js` exposes `distanceKm(lat1, lon1, lat2, lon2)` which computes the haversine distance and returns a string with 3 decimals (e.g. `"1.234"`). Keep in mind it returns a string, not a number.

If you want to draw a validation radius on the map (allowed punch-in distance), convert kilometers to meters and use Leaflet's `L.circle(center, { radius: meters })`.

## Styling & UI notes

- SCSS files live alongside pages/components (e.g., `src/pages/Punchin/punchin.scss`, `components/Navbar.scss`).
- Tailwind is present as a Vite plugin but project uses SCSS as primary stylesheet.

Sticky Punch-In button tip (from codebase):
- If a fixed top Navbar exists, add `padding-top: <navbar-height>` to `.container` and set `.container { min-height: 100vh; display:flex; flex-direction:column; }`.
- Remove large `margin-top` on `.container` — that prevents `min-height:100vh` from covering the full viewport and breaks sticky positioning.

## ENV variables observed / recommended

- `VITE_API_BASE_URL` — backend API base
- `VITE_MAP_PROVIDER` — if you plan to select between providers
- `VITE_MAPBOX_KEY` — optional if you switch to Mapbox

Place secrets in your hosting environment rather than committing `.env`.

## Build & deploy

- `npm run build` produces `dist/` — deploy to Vercel, Netlify, S3 + CloudFront, or any static host.
- Ensure environment variables are configured in the host dashboard.

## Tests & next steps

Repository doesn't contain tests yet. I can add a small Vitest setup and the following tests:

- Unit tests for `src/utils/geoDis.js` (haversine correctness, input edge-cases).
- Unit tests for `src/utils/mapHelpers.js` (test that `initHybridMap` returns a Leaflet map object and that `setViewAndMarker` adds a marker).

Would you like me to add those tests now? I can create Vitest config, install dev deps, and add two tests.

## Actionables / Observations

1. `geoDis.distanceKm` returns a string. Consider returning a number and formatting where displayed.
2. `addAccuracyCircle` uses `radius: accuracy > 20 ? 10 : accuracy` — likely the condition should be `accuracy < 20 ? 10 : accuracy` or simply `radius: accuracy` (or convert accuracy from meters to a sane minimum radius). I can fix this if you want.
3. For a global sticky Punch In button, move the button out of `.preview_section` into `.container` or use `position: fixed` on smaller screens.

## Troubleshooting (observed issues)

- Windows `npm` (PowerShell) execution policy may block running `npm` from PowerShell — run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` in an Admin PowerShell to allow scripts.
- If maps don't load in production, ensure tile provider is reachable and set correct `attribution`/CSP headers.

---

If you want, I will now:

- Add Vitest and two unit tests for `geoDis.js` and `mapHelpers.js` (fast, low-risk).
- Or implement the `addAccuracyCircle` fix and draw a punch-in validation circle on the map inside `PunchIn.jsx`.

Tell me which task to do next.


- Vercel — connect repo, set `build` to `npm run build`, `dist` as output dir.
- Netlify — similar settings; set environment variables in dashboard.
- S3 + CloudFront — set appropriate caching headers for `index.html` and assets.

CI/CD: run `npm ci`, `npm run build`, and run `npm run lint` and `npm run test` as part of the pipeline.

## Troubleshooting

- `npm` fails to run on Windows with `npm.ps1` execution policy: open PowerShell as admin and run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.
- Sticky button not reaching bottom: check `.container` for top `margin` — replace with `padding-top` equal to navbar height and set `.container { min-height: 100vh; display:flex; flex-direction:column }`.
- Map not rendering: ensure CSS for the map library is imported (e.g., `import 'leaflet/dist/leaflet.css'`).

## Contributing

- Fork the repo and create feature branches.
- Follow code style and run lint/tests before opening PR.
- Document larger changes in the PR description.

## License

Specify the project's license here.

---

If you want, I can also:

- Add a `CONTRIBUTING.md` template.
- Add Vitest and one or two unit tests for `src/utils/geoDis.js` and `src/utils/mapHelpers.js`.
- Create a small `deploy` script for Netlify/Vercel.

Tell me which of the above you'd like next.
