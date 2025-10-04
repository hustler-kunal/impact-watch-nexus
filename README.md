# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/2cfc8a34-288c-4370-b16e-1c08ec85d49b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2cfc8a34-288c-4370-b16e-1c08ec85d49b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2cfc8a34-288c-4370-b16e-1c08ec85d49b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Textured Earth (Optional)

The 3D viewer uses a procedural Earth by default (no external assets). To enable a high-resolution textured Earth instead:

1. Create the directory: `public/textures/earth`
2. Add one or more of these files (only `earth_day.jpg` is strictly required):
	- `earth_day.jpg` (required – daytime color map)
	- `earth_night.jpg` (city lights / night map)
	- `earth_normal.jpg` (normal map for terrain relief)
	- `earth_specular.jpg` (specular map – oceans reflections)
	- `earth_clouds.png` (transparent clouds layer)
3. Start the dev server if not already running.
4. Open the app with the query flag:

```
http://localhost:5173/?earth=texture
```

If the day texture fails to load, the viewer automatically falls back to the procedural Earth so you never get a blank screen.

## Production Setup

1. Copy `.env.example` to `.env` and set `VITE_NASA_API_KEY`.
2. Run the linter & type check to ensure no issues.
3. Build:
	- `npm run build` (outputs to `dist/`).
4. Serve statically (e.g. with `npm install -g serve` then `serve dist`).
5. Optional: Configure a CDN (Cloudflare / Netlify / Vercel) + cache immutable assets.

### Hardening & Polishing Already Implemented
| Area | Status |
|------|--------|
| NASA API key externalized | ✅ via `import.meta.env.VITE_NASA_API_KEY` |
| Fetch error handling & retry avoidance | ✅ (cache key prevents duplicate window fetch) |
| Graceful fallback for Earth rendering | ✅ procedural fallback + optional textured mode |
| Location picking UX | ✅ presets + globe + search (OSM) |
| Simulation engine | ✅ base + beta physics card |
| Export/Share | ✅ JSON/TXT + Web Share / clipboard |
| Dark/Light theme | ✅ toggle present |
| Scroll performance | ✅ Lenis + reduced layout thrash |
| Error boundary | ✅ wraps app |

### Suggested Future Enhancements
* Add unit tests for physics formulas in `lib/geo.ts`.
* Implement service worker for offline caching of static assets.
* Add Sentry (or similar) for runtime error telemetry.
* Provide quality selection (reduce shader detail / star count for low-end devices).
* Integrate real orbit propagation for selected NEO.


