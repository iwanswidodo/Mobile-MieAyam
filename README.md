# Mobile-MieAyam

Android POS client for Mie Ayam Pak De Surya.

## Stack
- React Native 0.81.5 + TypeScript
- Android native project with Gradle
- Go REST API: `iwanswidodo/BE-MieAyam`
- Local-first transaction storage (implementation planned)
- Rongta Bluetooth printer (migration planned; legacy v3.2.0 remains the verified reference)

## Run

```bash
npm install
npm run start
```

In another terminal:

```bash
npm run android
```

## Android debug build

```bash
cd android
gradle assembleDebug
```

## Architecture decisions
- Product CRUD is web-only; Android consumes the product catalog.
- Android owns cashier, cart, payment, transaction history, offline transactions, and Rongta printing.
- The Go backend is the shared business-logic and synchronization service.
- Do not remove the legacy APK workflow until React Native feature parity and physical-device regression tests pass.

## Migration status
React Native Android foundation is being established. The existing v3.2.0 APK is the baseline and remains the fallback while migration proceeds.
