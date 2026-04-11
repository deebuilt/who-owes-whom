

# Ship "Who Paid?" to Google Play Store

## Overview
Prepare the app for Google Play distribution using Capacitor (wraps the web app as a native Android app), plus generate store assets and add a privacy policy page.

## Tasks

### 1. Set up Capacitor for Android
- Install `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`
- Run `npx cap init` with appId `app.lovable.248c63ecd4654a7e82fb2ca6dab5429d` and appName `Who Paid?`
- Configure `capacitor.config.ts` with the sandbox preview URL for dev, and the built `dist` folder for production

### 2. Create Web App Manifest
- Add a `public/manifest.json` with app name, short name, icons, theme color, background color, display mode (`standalone`), and start URL
- Update `index.html` with `<link rel="manifest">`, proper `<title>`, theme-color meta tag, and mobile-optimized meta tags

### 3. Create App Icons
- Generate a set of PNG icons at required sizes (192×192, 512×512) using the app's primary color and "WP?" text
- Place in `public/icons/` folder

### 4. Generate Play Store Screenshots
- Take screenshots of the app at key states (empty, with expenses, with settlements) at phone viewport size
- Wrap them in polished product-shot frames
- Save to `/mnt/documents/play-store-screenshots/`

### 5. Add Privacy Policy Page
- Create `/privacy` route with a simple, clean privacy policy page
- Content: no data collection, no accounts, no analytics, all data stays on-device
- Add a link to the privacy page in the app footer

### 6. Update index.html Metadata
- Set title to "Who Paid?"
- Update description and OG tags to match the app

## What You'll Need To Do (after approval)
After I implement all of the above, you'll need to:
1. Export to GitHub and clone locally
2. Run `npm install` then `npx cap add android`
3. Run `npm run build && npx cap sync`
4. Open in Android Studio with `npx cap open android`
5. Build a signed APK/AAB for Play Store submission
6. Upload screenshots from `/mnt/documents/play-store-screenshots/` to your Play Console listing

## Technical Details
- **Capacitor** wraps your existing React SPA as a native Android app with a WebView
- **No backend needed** — the app remains fully client-side
- **Privacy policy** is required by Google Play for all apps

