# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Add fire report directly from map via FAB button toggle mode
  - FAB button (amber) in bottom-right corner activates "add mode"
  - Crosshair cursor indicates active placement mode
  - Click on map opens report form in Sheet with pre-filled coordinates
  - Tooltip guides user during add mode
- `isAddMode`, `toggleAddMode`, `setAddMode` in map-store for add mode state
