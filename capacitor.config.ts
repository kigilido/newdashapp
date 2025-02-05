import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.dash6b511ec435a2424e803f89322060c0f0',
  appName: 'DASH',
  webDir: 'dist',
  server: {
    url: 'https://6b511ec4-35a2-424e-803f-89322060c0f0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;