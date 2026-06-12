# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn start        # Dev server at http://localhost:3000
yarn build        # Production build
yarn test         # Run tests (watch mode)
yarn test --watchAll=false  # Run tests once
```

## Architecture

All state lives in `Garage.js`, which is the single top-level component (`App.js` just renders `<Garage />`). State flows down as props:

- **budget / budgetLeft** → `Budget.js` (display + update form)
- **searchFilters** → `Collection.js` (filters the vehicle list)
- **garage** (array of selected vehicles) → `Cars.js` (shows current collection)
- `selectCar` / `deSelectCar` callbacks are defined in `Garage.js` and passed down

**Data flow for search:** `SearchBar.js` calls `onSearch(filters)` → `Garage.js` stores it in `searchFilters` state → passed as `filters` prop to `Collection.js` → `Collection.filterCars()` applies the filter logic.

The filter logic runs entirely in `Collection.js:filterCars()`. The `filters` object has a `type` field (`"budget"` or `"maker"`) plus a `searchQuery` field that applies a name substring match independently of the tab.

## Key files

- `src/Data.js` — static array of all vehicles. Each entry: `{ car, cost (INR), img, maker, type, fuel_type, drivetrain }`. Images use `/images/<filename>` paths (served from `public/images/`). A handful of newer entries use external Wikipedia URLs instead.
- `src/Styles.js` — legacy plain JS style objects used by `Collection.js` and `Cars.js` for layout containers. New components use MUI `styled()` inline instead.
- `src/Filters.js` — effectively empty; ignore it.

## Styling

Components use MUI `styled()` from `@mui/material/styles`. The design system is dark-themed: `#121212`/`#1a1a1a` backgrounds, `#ff4081` as the accent color, glassmorphism cards with `rgba(255,255,255,0.05–0.1)` fills and `backdropFilter: blur(10px)`.

## Adding vehicles

Add an entry to the `cars` array in `src/Data.js`. Drop the image in `public/images/` and reference it as `/images/<filename>`. Valid `type` values: `Hatchback`, `Sedan`, `SUV`, `Compact SUV`, `Sports`, `Pickup`, `Minivan`, `Convertible`, `Coupe`, `Two Wheeler`. The maker filter list in `SearchBar.js` is hardcoded — add new makers there if needed.
