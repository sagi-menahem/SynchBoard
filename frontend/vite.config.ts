import path from 'path';

import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // React Compiler (Vite 8 / plugin-react 6: Babel is now a separate plugin)
    babel({
      presets: [
        reactCompilerPreset({
          target: '19', // Specify React 19 as the target
        }),
      ],
    }),
    tsconfigPaths(),
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  build: {
    // Generate source maps for better debugging in production
    sourcemap: true,
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown): object-form manualChunks was removed.
        // Vendor splitting is expressed via codeSplitting.groups (first match wins).
        codeSplitting: {
          groups: [
            // React Router (matched before react-vendor)
            { name: 'react-router', test: /[\\/]node_modules[\\/]react-router/ },

            // UI Component libraries - Radix (stable APIs)
            {
              name: 'ui-components',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/](react-slider|react-radio-group)/,
            },

            // UI libraries - Visual enhancements
            { name: 'ui-vendor', test: /[\\/]node_modules[\\/](react-hot-toast|react-colorful)[\\/]/ },

            // Internationalization - Language support
            { name: 'i18n-vendor', test: /[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/ },

            // HTTP and utilities - Core utilities
            { name: 'utils-vendor', test: /[\\/]node_modules[\\/](axios|jwt-decode|clsx)[\\/]/ },

            // Icons - Large icon library
            { name: 'icons-vendor', test: /[\\/]node_modules[\\/]lucide-react[\\/]/ },

            // React ecosystem - Core React libraries (most stable; matched last)
            { name: 'react-vendor', test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/ },

            // Note: framer-motion is not in a dedicated chunk - it's code-split naturally
            // and only loaded when navigating to board workspace (not on landing page)
            // Note: @stomp/stompjs is lazy-loaded via dynamic import in websocketService.ts
          ],
        },
      },
    },
  },
});
