
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.20393405a36c4480a1f2164bed9c1459',
  appName: 'dashapp',
  webDir: 'dist',
  server: {
    url: 'https://20393405-a36c-4480-a1f2-164bed9c1459.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
