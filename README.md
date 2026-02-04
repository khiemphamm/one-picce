# Champ champ champ

## Features
- Proxy pool management and session stats dashboard.
- Auto-update via GitHub Releases (Windows NSIS installer).
- Local-first: config and SQLite data stored on the machine.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Zustand
- **Backend/Core**: Node.js, Puppeteer (stealth), SQLite
- **IPC**: Electron IPC (Main <-> Renderer)

## Project Structure
- `electron/` — Electron main process + preload (IPC bridge)
- `src/` — React renderer UI
- `core/` — Automation engine, proxy management, database
- `config/` — JSON configuration templates
- `data/` — Local SQLite storage

## Requirements
- Node.js 20+
- npm 9+

## Setup
```bash
npm install
```

## Development
Start Electron + Vite dev servers:
```bash
npm run dev
```

## Build
Build renderer + main process:
```bash
npm run build
```

Package for Windows (NSIS + portable):
```bash
npm run package:win
```

## Auto-Update (Windows)
Auto-update is powered by `electron-updater` and GitHub Releases. See:
- `AUTO_UPDATE_GUIDE.md`

Key notes:
- Version in `package.json` must always increase.
- Auto-update works with **NSIS installer**, not portable builds.

## Configuration
- `config/` contains template configs.
- Runtime data and logs are stored under the Electron user data directory.

## Logging
Centralized logging uses Winston (`core/utils/logger.ts`).

## Testing
No automated tests yet.

## License
MIT
