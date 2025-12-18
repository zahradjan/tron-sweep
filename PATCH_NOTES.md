# Patch Notes

## v1.0.3

### Changed

- Updated Tron disc and score images for improved visuals.

## v1.0.2

### Changed

- Updated project version to 1.0.2 in package.json.
- Refactored BadgesDisplay and Badge classes for better OOP and maintainability.
- Centralized badge creation and animation logic in Badge class.
- Improved naming conventions for badge popup and display update methods (e.g., presentHighScoreBadgePopups, updateBadgeDisplay).
- Clarified GameEngine orchestration pattern and UI dependencies in code comments.

### Fixed

- Ensured badges are properly shown/hidden and animated when counts change.
- Fixed visibility issues with badge containers and labels.

## v1.0.1

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
