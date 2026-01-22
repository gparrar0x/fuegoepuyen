# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

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
