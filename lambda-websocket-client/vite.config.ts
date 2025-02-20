// // vite.config.js
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000,
//     open: true
//   },
//   // Optional: Enable source maps for easier debugging during build
//   build: {
//     sourcemap: true
//   },
//   // Optional: Keep the console output for easier debugging
//   clearScreen: false,
//   logLevel: 'info'
// });
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    sourcemap: true // Enables source maps for easier debugging
  },
  clearScreen: false, // Keeps console output visible
  logLevel: 'info' // Sets log level
});
