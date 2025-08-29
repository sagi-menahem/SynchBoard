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
          ['babel-plugin-react-compiler', {
            target: '19', // Specify React 19 as the target
          }],
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
          // React ecosystem
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // UI and Animation libraries
          'ui-vendor': ['framer-motion', 'react-hot-toast'],
          
          // WebSocket and communication
          'websocket-vendor': ['@stomp/stompjs', 'sockjs-client'],
          
          // Internationalization
          'i18n-vendor': ['i18next', 'react-i18next'],
          
          // HTTP and utilities
          'utils-vendor': ['axios', 'jwt-decode'],
          
          // Icons
          'icons-vendor': ['lucide-react'],
        },
      },
    },
  },
});
