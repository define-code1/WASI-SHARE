# WASI SHARE — Windows Setup Guide

## System Requirements
- Windows 10 or Windows 11 (64-bit)
- Wi-Fi network with client-to-client communication permitted
- Node.js 18+ (for development builds)

---

## Windows Firewall Configuration

When running WASI SHARE for the first time on Windows, Windows Defender Firewall will prompt you:

1. **Select**: "Private networks, such as my home or work network".
2. **Click**: "Allow access".
3. **If missed**:
   - Open **Windows Defender Firewall** > **Allow an app or feature through Windows Defender Firewall**.
   - Check **WASI SHARE** for **Private** networks.

---

## Development & Build Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Desktop App in Development Mode
```bash
npm run dev:desktop
```

### 3. Build Windows Installer (.exe)
```bash
npm run build:desktop
```
The output installer will be created in `apps/desktop/dist/`.
