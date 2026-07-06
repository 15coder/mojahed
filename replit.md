# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains "كاشيرك" (Casherk) — an inventory management mobile app built with Expo/React Native.

## Stack

- **Monorepo tool**: pnpm workspaces (v10.26.1)
- **Node.js version**: 22.14.0
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile framework**: Expo (v54) + React Native + expo-router
- **UI**: RTL Arabic interface, Tajawal font, dark/light mode

## Artifacts

### `artifacts/casherk` — كاشيرك (Casherk)
- **Type**: Expo mobile app
- **Preview path**: `/`
- **Slug**: `casherk`
- **Bundle ID**: `com.needaa.casherk`
- **Version**: 1.3.0
- **Features**:
  - Product inventory management (CRUD)
  - Dual-currency pricing (SYP / USD) with live conversion
  - **Currency display selector**: ليرة سورية جديدة / ليرة سورية قديمة (×100) / دولار
  - Barcode scanner (expo-camera) — wide rectangular frame, double beep, auto-navigate
  - Scanner auto-fills barcode in add product page (via route params)
  - Product images (expo-image-picker)
  - Biometric lock (expo-local-authentication)
  - Fuzzy search (fuse.js)
  - Price trend tracking
  - **Invoice store** with customerName + notes on each saved invoice
  - **Invoice tab renamed** to "الفواتير" with expandable item details per invoice
  - **Custom item modal** — add item by name+price directly to invoice (replaces share button)
  - **Leave guard** — asks save/leave when navigating away with unsaved invoice items
  - **JSON backup/restore** — includes invoices; restores invoices on import
  - **Keyboard avoidance** fixed for customer/notes modal on Android
  - RTL Arabic UI with Tajawal font
  - Dark/light mode support
  - AsyncStorage persistence (keys prefixed `@casherk:`)
  - Custom in-app Toast notifications (ToastContext)
  - No bottom tab bar — settings accessible via icon in main header
  - Settings page has back button for navigation
  - **Template system removed** (templateStore.ts deleted)
  - **License/activation system removed** — app opens directly to the product list (PIN/biometric lock is a separate, retained feature)

## Storage Keys
- `@casherk:settings` — app settings
- `@casherk:products` — product inventory
- `@casherk:categories` — categories
- `@casherk:recently_viewed` — recently viewed products
- `@casherk:recent_barcodes` — recent barcode scans

Note: renamed from the `@mujahid:` prefix used in earlier builds. This intentionally breaks compatibility with any previously installed preview APK — that tradeoff was explicitly requested by the user in order to fully rebrand.

## Currency System
- **SYP_NEW** (ليرة جديدة): stored value as-is, shown as "ل.س"
- **SYP_OLD** (ليرة قديمة): stored value × 100, shown as "ل.س.ق"
- **USD**: converted via exchange rate, shown as "$"

## Backup Path
- Saved to: `${FileSystem.documentDirectory}Nidaa/Backups/`
- Filename format: `نسخة_YYYY-MM-DD_HHMMSS.json`
- Auto-shared via system share sheet after creation

## EAS Build (expo.dev)

`artifacts/casherk/eas.json` — configured for EAS builds:
- pnpm version: `10.26.1` (must be full semver)
- node version: `22.14.0`
- Profiles: `development` (APK), `preview` (APK), `production` (AAB)
- Note: the app was renamed from slug `mojahed`/package `com.needaa.mujahid` to slug `casherk`/package `com.needaa.casherk`. The old EAS project (`@15coder/mojahed`) no longer matches — the next `eas build` will create a fresh EAS project under the new slug.

## Other Artifacts
- `artifacts/mujahid-trading` — legacy web artifact ("مجاهد للتجارة"), moved off the root preview path (`/mujahid-trading`) to free up `/` for the casherk mobile app, which is now the main artifact.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
