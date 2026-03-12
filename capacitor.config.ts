import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.testreact.app',
  appName: 'testreact',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    path: 'mobile/android',
  },
};

export default config;
