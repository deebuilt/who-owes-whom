import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.whopaid',
  appName: 'Who Paid?',
  webDir: 'dist',
  server: {
    url: "https://248c63ec-d465-4a7e-82fb-2ca6dab5429d.lovableproject.com?forceHideBadge=true",
    cleartext: true
  }
};

export default config;
