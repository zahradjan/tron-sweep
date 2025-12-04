# Patch Notes

## v1.0.1 (2025-12-04)

### Added

- Created PATCH_NOTES.md for tracking changes.

### Changed

- Updated project version to 1.0.1 in package.json.
- Improved badge display logic: badge and label animations now use a data-driven approach.
- Refactored high score logic to use an array for easier mapping and maintainability.
- Made UI layout and resize logic more responsive for mobile devices.
- Centralized config for grid size, sweep cost, and high score ranges.

### Fixed

- Fixed circular import issue by moving HighScoreBadge enum to its own file.
- Fixed bug where badge display would disappear instead of updating label.
- Fixed mobile access to Vite dev server by using --host and correct port.

---

## v1.0.0 (Initial Release)

- First public release of Tron Sweep.
- Core gameplay, grid, badges, and UI implemented.
