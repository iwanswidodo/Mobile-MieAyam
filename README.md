# POS-MieAyam

Android client for POS Mie Ayam Pak De Surya.

## Target stack
- React Native + TypeScript
- Shared REST API from `iwanswidodo/BE-MieAyam`
- Local-first transactions with background sync
- Native Bluetooth integration for Rongta thermal printer

## Current state
This repository is being migrated from the legacy generated Android APK workflow (v3.2.0). The legacy workflow is intentionally retained as a fallback while the React Native app is scaffolded and features are ported and tested. Do not remove the legacy build until feature parity, offline persistence, and Rongta printing have been verified on-device.

## Development
```bash
npm install
npm run start
```
