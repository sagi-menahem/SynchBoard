/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WEBSOCKET_URL: string;
  readonly VITE_WEBSOCKET_MAX_MESSAGE_SIZE?: string;
  readonly VITE_WEBSOCKET_MAX_RECONNECTION_ATTEMPTS?: string;
  readonly VITE_WEBSOCKET_BASE_RECONNECTION_DELAY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
