# WASI SHARE — Android Setup Guide

## Requirements
- Android 9.0 (Pie / API 28) or newer
- Camera for scanning PC QR code
- Connected to the same Wi-Fi router / Access Point as the Windows PC

---

## Permissions Handled
- **Camera (`CAMERA`)**: Required only to scan the pairing QR code.
- **Local Network Access**: Connects to the PC's private Wi-Fi IP address.
- **Storage / Media Access**: Handled via modern Android Document Picker (`Storage Access Framework`) with zero intrusive full-disk storage permissions.

---

## Development & Build Instructions

### 1. Run Android with Expo Go
```bash
cd apps/android
npm install
npm run start
```
Scan the terminal QR code using the Expo Go app on your Android phone.

### 2. Build Release APK for Testing
```bash
npm run build:apk
```
Or for local standalone Android Studio builds:
```bash
npm run android
```
