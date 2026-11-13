import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build work on GitHub Pages sub-paths AND inside
// Capacitor (iOS/Android) where files are served from the device.
export default defineConfig({
  plugins: [react()],
  base: './',
});
