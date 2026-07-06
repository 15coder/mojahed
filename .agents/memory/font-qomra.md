---
name: Qomra Font
description: Custom Arabic font used throughout the Casherk app — replaces Tajawal
---

## Setup
- **Source**: `https://sytra.site/fonts/fonts/qomra.ttf`
- **Local path**: `artifacts/casherk/assets/fonts/Qomra.ttf` (104 KB)
- **Loading**: `expo-font` in `_layout.tsx` → `useFonts({ Qomra: require('@/assets/fonts/Qomra.ttf') })`
- **Usage**: `fontFamily: 'Qomra'` everywhere — single weight (no Regular/Medium/Bold variants)

## What was replaced
- `@expo-google-fonts/tajawal` package removed from casherk package.json
- All `Tajawal_400Regular`, `Tajawal_500Medium`, `Tajawal_700Bold` → `Qomra`
- 265 occurrences across 21 files replaced via sed

## PDF invoices
- `invoicePdf.ts` loads Qomra via @font-face CDN URL (requires network at print time — acceptable)

## Why
User requested this specific font from sytra.site API.
