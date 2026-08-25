import path from 'path';

import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { nonBlockingCss } from './plugins/nonBlockingCss';

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
    nonBlockingCss(),
  ],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    // Fail instead of silently moving to 5174. The Google OAuth redirect URI and the
    // backend CORS origin both hardcode 5173, so a shifted port produces confusing
    // auth failures rather than an obvious "port in use" error.
    //
    // This used to add "`npm run dev:frontend` frees the port first" — it did, with
    // `kill-port 5173`, and that was actively harmful: kill-port matches any local
    // ADDRESS ending in the port and TaskKills it, and `tailscale serve` maps 5173, so
    // tailscaled was a match and died on every start (measured 2026-08-25). strictPort
    // alone gives the obvious "port in use" error this comment already wanted.
    strictPort: true,
    // 5173 is mapped in Tailscale and this project has a row in the port table, but the
    // origin was never allowed here — so dev assets over `…ts.net:5173` were refused and
    // the phone preview could not have worked. Found 2026-08-25 while removing kill-port.
    allowedHosts: ['.ts.net'],
  },
  preview: {
    port: 4173,
    strictPort: true,
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
            {
              name: 'ui-vendor',
              test: /[\\/]node_modules[\\/](react-hot-toast|react-colorful)[\\/]/,
            },

            // Internationalization - Language support
            { name: 'i18n-vendor', test: /[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/ },

            // HTTP and utilities - Core utilities
            { name: 'utils-vendor', test: /[\\/]node_modules[\\/](axios|jwt-decode|clsx)[\\/]/ },

            // Icons - Large icon library
            { name: 'icons-vendor', test: /[\\/]node_modules[\\/]lucide-react[\\/]/ },

            // React ecosystem - Core React libraries (most stable; matched last)
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            },

            // Note: motion is not in a dedicated chunk - it's code-split naturally
            // and only loaded when navigating to board workspace (not on landing page)
            // Note: @stomp/stompjs is lazy-loaded via dynamic import in websocketService.ts
          ],
        },
      },
    },
  },
});
