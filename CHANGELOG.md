# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Breaking

- **Rebrand: `fuegoepuyen` → `Igni`** [2026-04-23]
  - Package renamed: `package.json#name` now `igni`
  - All UI strings, metadata, OpenGraph, login page updated
  - GitHub repo renamed: `gparrar0x/fuegoepuyen` → `gparrar0x/igni`
  - Project directory renamed: `projects/fuegoepuyen/` → `projects/igni/`
  - Pending externals: Vercel project rename, domain `igni.skyw.app`, Supabase project name (all blocked on cross-team auth)

### Added

- **AGPL-3.0-or-later license** [2026-04-23]
  - `LICENSE` (official GNU text, v3)
  - `package.json#license` set to `AGPL-3.0-or-later`
  - Community data (focos, reportes, verificaciones) published under CC BY 4.0
- **OSS governance docs** [2026-04-23]
  - `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1
  - `CONTRIBUTING.md` — contribution workflow, coding conventions, PR checklist
  - `GOVERNANCE.md` — roles (maintainers, steering committee), decision-making, succession, funding rules
  - `DEPLOYMENT.md` — step-by-step self-hosting guide targeting <2h to a working instance
  - `SECURITY.md` — vulnerability disclosure process, safe harbor, SLAs
  - `PRIVACY.md` — data handling, user rights, retention, LATAM legal context
  - `TERMS.md` — acceptable use, licensing, jurisdiction
- **CAP 1.2 output** [2026-04-23]
  - `src/lib/cap.ts` — CAP alert + Atom feed builders with status/intensity mappings
  - `GET /api/alerts/cap.atom` — Atom 1.0 feed of recent verified alerts (7-day window, max 200 entries)
  - `GET /api/alerts/cap/[id]` — individual CAP 1.2 XML per fire report
  - Enables interop with Defensa Civil, OpenEWS, federated Igni instances without custom integration
- **Health endpoint** [2026-04-23]
  - `GET /api/health` — returns `{status, service, timestamp, checks: {supabase}}`
  - 503 when Supabase check fails
- **Public footer: OSS credits** [2026-04-23]
  - `(public)` layout footer now shows "Bien común digital · AGPL-3.0 · Ver código fuente" with links to GNU and GitHub
- **README** [2026-04-23]
  - Licencia section (AGPL-3 + CC BY 4.0 rationale)
  - Contribuir section linking to `CONTRIBUTING.md` and repo
- **Documentation (docs/)** [2026-04-23]
  - `docs/MARKET_RESEARCH.md` — OSS civic-tech landscape, funding paths, sustainability to 3 years
  - `docs/OSS_DEEP_DIVE.md` — deep dive on 7 wildfire OSS projects (PyroNear, ODIN-fire, bcgov/wps, FireAlert, OpenEWS, Wildfire Commons, TAK-NZ/etl-firms)
  - `docs/PYRONEAR_RPI_INTEGRATION.md` — RPi + PyroNear integration feasibility (parked, low priority)
  - `docs/ROADMAP.md` — rewritten under OSS/bien común frame; 4 parallel tracks, 5 phases, explicit parked features

### Removed

- `projects/fuego-alerta/` — orphan directory (only residual `.env.local` + `.next`), 48KB, pre-dated rebrand

### Added
- **GitHub Actions CI** [2026-02-25] (SKY-121)
  - Biome check + tsc + vitest gates on PR/push to main
- **RLS optimization migration** [2026-02-22] (SKY-110)
  - `004_optimize_rls_auth_uid.sql`: 6 policies optimized

### Changed
- **Biome + Lefthook** [2026-02-22] (SKY-113)
  - Biome 2.4.4 for formatting/linting, Lefthook pre-commit hook

### Changed (previous)

- NASA FIRMS cron schedule: daily → every 15 minutes for fresher data
- NASA data fetch window: 5 days → 2 days (optimized for 15min cron)
- Deduplication window: 10 days → 5 days (matches fetch + buffer)
- Proximity threshold: 1km → 500m for more accurate deduplication
- Source ID precision: 4 decimals → 3 decimals (~111m vs ~11m)
- Fire markers visual hierarchy based on recency:
  - Very active (<12h): pulse animation, larger size, red NASA badge
  - Active (<24h): normal fire with blue NASA badge
  - Inactive (>24h): grayscale, smaller, muted badge
- Community markers now show status visually (contained=orange ring, extinguished=check)
- Popup shows time ago, status label with color indicator, intensity

### Added

- `papaparse` for robust CSV parsing (replaces custom parser)
- `FIRMSError` class with typed error codes (NO_API_KEY, API_ERROR, PARSE_ERROR)
- Coordinate validation (range check + Argentina bbox filter)
- `extreme` intensity classification based on FRP > 100 MW
- Helper functions exported from nasa-firms: `generateSourceId`, `parseDetectionDate`, `generateDescription`

### Fixed

- NASA API key validation: now throws with clear error instead of silent empty array
- CSV parser: handles quoted fields, header normalization, empty lines
- Type safety: proper typing for Supabase insert operations

- Mobile navigation: sidebar replaced with bottom navigation bar
  - Fixed bottom nav with icons + labels (Mapa, Focos, Recursos, Público)
  - Desktop sidebar unchanged (collapsible lateral)
  - Main content padded to avoid bottom nav overlap
- Map controls layout: search bar aligned left with system colors (slate-800)
  - FAB buttons positioned below search bar
  - Results dropdown styled with dark theme
- Resource marker click: opens detail popup instead of Mapbox popup
  - Read mode shows all resource fields
  - Edit mode (pencil button) allows updating resource data
  - Status badge shows availability state
- Vehicle owner field: changed from text input to select dropdown
  - Only registered persons (volunteers) can be selected as owners
  - Shows owner name in read mode instead of ID

### Added

- Add fire report directly from map via FAB button toggle mode
  - FAB button (amber) in bottom-right corner activates "add mode"
  - Crosshair cursor indicates active placement mode
  - Click on map opens report form in Sheet with pre-filled coordinates
  - Tooltip guides user during add mode
- `isAddMode`, `toggleAddMode`, `setAddMode` in map-store for add mode state
