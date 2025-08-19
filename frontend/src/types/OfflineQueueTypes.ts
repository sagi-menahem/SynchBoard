export interface QueuedAction {
  id: string;                    // Transaction ID from useWebSocketTransaction
  type: 'CHAT' | 'DRAWING';     // Action type for routing
  destination: string;           // WebSocket destination path
  payload: object;              // Original payload with instanceId
  timestamp: number;            // When action was queued
  retryCount: number;           // Current retry attempts
  maxRetries: number;           // Maximum allowed retries (default: 3)
  priority: 'normal' | 'high';  // Future extension for action prioritization
}

export interface OfflineQueueState {
  queuedActions: QueuedAction[];
  isProcessingQueue: boolean;
  processingStats: {
    total: number;
    processed: number;
    failed: number;
  };
  lastProcessedAt: number | null;
}

export interface QueueCapacityInfo {
  current: number;
  maximum: number;
  available: number;
  utilizationPercent: number;
}

export interface OfflineQueueContextValue {
  state: OfflineQueueState;
  actions: {
    queueAction: (action: Omit<QueuedAction, 'retryCount'>) => void;
    removeAction: (actionId: string) => void;
    clearQueue: () => void;
    retryFailedActions: () => void;
    getQueuePosition: (actionId: string) => number;
    getQueueCapacity: () => QueueCapacityInfo;
    processQueue: () => Promise<void>;
  };
}