import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sportcoreos.mobile',
  appName: 'SportCoreOS Mobile',
  webDir: 'dist/sport-core-os-mobile/browser',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#070b14'
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0b0f19',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
