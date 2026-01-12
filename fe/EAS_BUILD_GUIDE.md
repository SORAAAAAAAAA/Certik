# EAS Build Setup Guide

## Prerequisites

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```

2. Login to your Expo account:
   ```bash
   eas login
   ```

3. Initialize EAS for your project (if not already done):
   ```bash
   eas build:configure
   ```
   This will generate a project ID. Copy the project ID and update `app.json`:
   - Replace `"projectId": "your-eas-project-id"` with your actual project ID
   - Replace `"url": "https://u.expo.dev/your-eas-project-id"` with your actual project ID

## Setting Up Secrets

For security, sensitive environment variables should be stored as EAS Secrets, NOT in eas.json.

Run these commands to set up your secrets:

```bash
# Pinata JWT Token
eas secret:create --scope project --name EXPO_PUBLIC_PINATA_JWT --value "your-pinata-jwt-token"

# Owner Private Key (for minting)
eas secret:create --scope project --name EXPO_PUBLIC_OWNER_PRIVATE_KEY --value "your-private-key"
```

To verify secrets are set:
```bash
eas secret:list
```

## Building the App

### Development Build (with Expo Dev Client)
```bash
npm run build:dev:android    # Android only
npm run build:dev:ios        # iOS only
npm run build:dev            # Both platforms
```

### Preview Build (Internal Testing APK)
```bash
npm run build:preview:android    # Android APK for testing
npm run build:preview:ios        # iOS for TestFlight
npm run build:preview            # Both platforms
```

### Production Build (Store Release)
```bash
npm run build:prod:android    # Android AAB for Play Store
npm run build:prod:ios        # iOS for App Store
npm run build:prod            # Both platforms
```

## Downloading the Build

After the build completes, you can:
1. Download directly from the EAS dashboard: https://expo.dev
2. Use the QR code shown in terminal
3. Run: `eas build:list` to see recent builds

## Submitting to Stores

### Android (Google Play Store)
1. Create a service account in Google Cloud Console
2. Download the JSON key and save as `play-store-key.json`
3. Update `eas.json` submit configuration
4. Run: `npm run submit:android`

### iOS (App Store)
1. Update Apple ID and ASC App ID in `eas.json`
2. Run: `npm run submit:ios`

## Environment Variables Reference

| Variable | Description | Storage |
|----------|-------------|---------|
| EXPO_PUBLIC_SUPABASE_URL | Supabase project URL | eas.json |
| EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY | Supabase public key | eas.json |
| EXPO_PUBLIC_CONTRACT_ADDRESS | Smart contract address | eas.json |
| EXPO_PUBLIC_PINATA_GATEWAY | Pinata IPFS gateway | eas.json |
| EXPO_PUBLIC_BASE_SEPOLIA_RPC | Base Sepolia RPC URL | eas.json |
| EXPO_PUBLIC_PINATA_JWT | Pinata JWT token | EAS Secrets |
| EXPO_PUBLIC_OWNER_PRIVATE_KEY | Owner wallet private key | EAS Secrets |

## Troubleshooting

### Build fails with missing environment variable
Ensure all secrets are set with `eas secret:list`

### App crashes on startup
Check that all EXPO_PUBLIC_* variables are properly set in eas.json or EAS Secrets

### Metro bundler issues
Run `npm start -- --clear` to clear cache before building
