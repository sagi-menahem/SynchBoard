import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              target: '19', // Specify React 19 as the target
            },
          ],
        ],
      },
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
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem - Core React libraries (most stable)
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],

          // UI Component libraries - Radix and Headless UI (stable APIs)
          'ui-components': [
            '@radix-ui/react-slider',
            '@radix-ui/react-radio-group',
            '@headlessui/react',
          ],

          // UI and Animation libraries - Visual enhancements
          'ui-vendor': ['framer-motion', 'react-hot-toast', 'react-colorful'],

          // WebSocket and communication - Real-time features
          'websocket-vendor': ['@stomp/stompjs', 'sockjs-client'],

          // Internationalization - Language support
          'i18n-vendor': ['i18next', 'react-i18next'],

          // HTTP and utilities - Core utilities
          'utils-vendor': ['axios', 'jwt-decode', 'clsx'],

          // Icons - Large icon library
          'icons-vendor': ['lucide-react'],
        },
      },
    },
  },
});
