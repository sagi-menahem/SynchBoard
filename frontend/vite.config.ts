import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    define: {
        global: 'globalThis',
    },
    build: {
        // Optimize chunk splitting for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunk for stable dependencies
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    // WebSocket chunk for real-time functionality
                    websocket: ['@stomp/stompjs', 'sockjs-client'],
                    // UI chunk for component libraries
                    ui: ['react-hot-toast', 'react-i18next', 'react-window'],
                },
            },
        },
        // Optimize asset handling
        assetsInlineLimit: 8192, // Inline assets smaller than 8kb
        cssCodeSplit: true, // Split CSS into separate files
        minify: 'esbuild', // Use esbuild for faster minification
        sourcemap: false, // Disable sourcemaps for production
    },
    // Optimize asset compression
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
});
