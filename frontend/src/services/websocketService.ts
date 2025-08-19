
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  type MessageValidationSchema,
  sanitizeObject,
  validateBoardMessage,
  validateMessage,
} from 'utils';
import logger from 'utils/Logger';

import { AUTH_HEADER_CONFIG, WEBSOCKET_CONFIG } from '../constants';
import { WEBSOCKET_URL } from '../constants/ApiConstants';



class WebSocketService {
  private stompClient: Client | null = null;
  private readonly messageSchemas = new Map<string, MessageValidationSchema>();
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private pendingSubscriptions: {
        topic: string;
        callback: (message: unknown) => void;
        schemaKey?: string;
    }[] = [];
    
  // Reconnection logic properties
  private reconnectionAttempts = 0;
  private reconnectionTimer: ReturnType<typeof setTimeout> | null = null;
  private currentToken: string | null = null;
  private onConnectedCallback: (() => void) | null = null;
  // Support multiple rollback callbacks for different board workspaces
  private rollbackCallbacks = new Set<() => void>();
  // Queue processor callback for offline queue
  private queueProcessorCallback: (() => Promise<void>) | null = null;
  // Transaction success callback for queue→transaction bridge
  private transactionSuccessCallback: ((transactionId: string) => void) | null = null;
  // Board state refresh callback for synchronizing after reconnection
  private boardStateRefreshCallback: (() => Promise<void>) | null = null;
  private lastBoardRefreshTime = 0;
  private boardRefreshThrottlePeriod = 10000; // 10 seconds minimum between refreshes
  // Flag to track intentional disconnections
  private isIntentionalDisconnect = false;
  // Timer for delayed rollback to allow pending confirmations
  private rollbackTimer: ReturnType<typeof setTimeout> | null = null;
  // Rapid reconnection protection
  private lastConnectionAttempt = 0;
  private connectionCooldownPeriod = 2000; // 2 seconds minimum between connection attempts
  private isProcessingCallbacks = false; // Prevent concurrent callback processing
  // Connection state optimization
  private connectionStateTimestamp = 0; // Track when connection state last changed
  private connectionStateChangeLock = false; // Prevent rapid state changes

  constructor() {
    this.initializeMessageSchemas();
  }

  private initializeMessageSchemas(): void {
    this.messageSchemas.set('board', {
    });

    this.messageSchemas.set('user', {
      requiredFields: ['updateType'],
      allowedTypes: ['BOARD_LIST_CHANGED', 'BOARD_DETAILS_CHANGED'],
    });

    this.messageSchemas.set('chat', {
      requiredFields: ['type', 'content', 'timestamp', 'senderEmail'],
      maxLength: 5000,
    });
  }



  private validateMessageWithSchema(data: unknown, schemaKey?: string): boolean {
    const dataObj = data as Record<string, unknown>;
        
    if (schemaKey && this.messageSchemas.has(schemaKey)) {
      const schema = this.messageSchemas.get(schemaKey);
      if (!schema) {
        return true;
      }

      if (schemaKey === 'board') {
        return validateBoardMessage(dataObj);
      }

      return validateMessage(data, schema);
    }

    return validateMessage(data);
  }



  private parseAndValidateMessage<T>(messageBody: string, schemaKey?: string): T | null {
    try {
      if (messageBody.length > WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE) {
        logger.error(`Message exceeds maximum allowed size: ${messageBody.length} > ${WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE}`);
        return null;
      }

      const parsedData = JSON.parse(messageBody);

      if (!this.validateMessageWithSchema(parsedData, schemaKey)) {
        return null;
      }

      const sanitizedData = sanitizeObject(parsedData);

      return sanitizedData as T;
    } catch (error) {
      logger.error('Failed to parse WebSocket message:', error);
      return null;
    }
  }

  /**
   * Handles disconnection from any source and initiates reconnection if appropriate.
   * This is called by various event handlers to ensure consistent disconnect handling.
   */
  private handleDisconnection(event?: any): void {
    console.log(`[RECONNECTION ANALYSIS] handleDisconnection called - current state: ${this.connectionState}, event code: ${event?.code || 'N/A'}`);
    logger.debug('Handling disconnection - updating state and attempting reconnection');
    
    // CRITICAL FIX: Prevent rapid state changes with lock mechanism
    if (this.connectionStateChangeLock) {
      logger.debug('Connection state change locked, ignoring disconnection event');
      return;
    }
    
    // Only update state if we're not already disconnected (prevent duplicate handling)
    if (this.connectionState !== 'disconnected') {
      this.connectionStateChangeLock = true;
      this.connectionState = 'disconnected';
      this.connectionStateTimestamp = Date.now();
      
      // Release lock after brief delay to prevent immediate re-triggering
      setTimeout(() => {
        this.connectionStateChangeLock = false;
      }, 500);
      
      logger.debug('Connection state updated to disconnected with timestamp lock');
    }
    
    // Reset processing flag on disconnection
    this.isProcessingCallbacks = false;
    
    // Grace period logic is now handled in onWebSocketClose for better control
    // This handler is for other disconnect scenarios (onDisconnect, onStompError)
    
    // Attempt reconnection if we have stored connection parameters
    if (this.currentToken && this.onConnectedCallback) {
      console.log(`[RECONNECTION ANALYSIS] Attempting reconnection - token exists: ${!!this.currentToken}, callback exists: ${!!this.onConnectedCallback}`);
      this.attemptReconnection();
    } else {
      console.log(`[RECONNECTION ANALYSIS] Not attempting reconnection - token exists: ${!!this.currentToken}, callback exists: ${!!this.onConnectedCallback}`);
    }
  }

  /**
     * Attempts to reconnect with exponential backoff strategy.
     * Delay increases exponentially: baseDelay * 2^attempts
     */
  private attemptReconnection(): void {
    if (this.reconnectionAttempts >= WEBSOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS) {
      logger.error(`Maximum reconnection attempts (${WEBSOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS}) reached. Stopping reconnection attempts.`);
      this.connectionState = 'disconnected';
      return;
    }

    const delay = WEBSOCKET_CONFIG.BASE_RECONNECTION_DELAY * Math.pow(2, this.reconnectionAttempts);
    this.reconnectionAttempts++;
        
    logger.info(`Attempting to reconnect... (attempt ${this.reconnectionAttempts}/${WEBSOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS}) in ${delay}ms`);

    this.reconnectionTimer = setTimeout(() => {
      if (this.currentToken && this.onConnectedCallback) {
        this.connectInternal(this.currentToken, this.onConnectedCallback);
      }
    }, delay);
  }

  /**
     * Resets reconnection state when connection is successful
     */
  private resetReconnectionState(): void {
    this.reconnectionAttempts = 0;
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }
  }

  public connect(token: string, onConnectedCallback: () => void) {
    // CRITICAL FIX: Rapid reconnection protection
    const now = Date.now();
    const timeSinceLastAttempt = now - this.lastConnectionAttempt;
    
    if (timeSinceLastAttempt < this.connectionCooldownPeriod) {
      const remainingCooldown = this.connectionCooldownPeriod - timeSinceLastAttempt;
      logger.debug(`Connection cooldown active. Waiting ${remainingCooldown}ms before allowing connection.`);
      
      // Defer connection attempt until cooldown expires
      setTimeout(() => {
        this.connect(token, onConnectedCallback);
      }, remainingCooldown);
      return;
    }
    
    this.lastConnectionAttempt = now;
    
    // Store connection parameters for potential reconnection
    this.currentToken = token;
    this.onConnectedCallback = onConnectedCallback;
        
    if (this.stompClient?.active && this.connectionState === 'connected') {
      logger.debug('WebSocket already connected.');
      onConnectedCallback();
      return;
    }

    if (this.connectionState === 'connecting') {
      logger.debug('WebSocket connection already in progress.');
      return;
    }

    this.connectInternal(token, onConnectedCallback);
  }

  private connectInternal(token: string, onConnectedCallback: () => void): void {
    this.connectionState = 'connecting';

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      connectHeaders: {
        [AUTH_HEADER_CONFIG.HEADER_NAME]: `${AUTH_HEADER_CONFIG.TOKEN_PREFIX}${token}`,
      },
      onConnect: async () => {
        console.log(`[RECONNECTION ANALYSIS] onConnect triggered - connectionState: ${this.connectionState}, locked: ${this.connectionStateChangeLock}`);
        logger.debug('Connected to WebSocket server!');
        
        // CRITICAL FIX: Prevent connection state changes during processing
        if (this.connectionStateChangeLock) {
          logger.debug('Connection state change locked, deferring connection processing');
          console.log(`[RECONNECTION ANALYSIS] Connection processing deferred due to lock`);
          // Brief delay before processing connection
          setTimeout(() => {
            if (this.stompClient?.active) {
              console.log(`[RECONNECTION ANALYSIS] Processing deferred connection`);
              this.processConnection();
            }
          }, 600);
          return;
        }
        
        console.log(`[RECONNECTION ANALYSIS] Processing connection immediately`);
        this.processConnection();
      },
      onDisconnect: () => {
        logger.debug('STOMP disconnected from WebSocket.');
        this.handleDisconnection();
      },
      onStompError: (frame) => {
        logger.error('Broker reported error: ' + frame.headers['message']);
        this.handleDisconnection();
      },
      /**
       * Critical handler for detecting server-initiated closures (like code 1009 for message too big).
       * This is the most reliable way to catch WebSocket closures with specific close codes
       * that may not trigger STOMP-level callbacks immediately.
       */
      onWebSocketClose: (event) => {
        // Check if this was an intentional disconnection
        if (this.isIntentionalDisconnect) {
          logger.debug('WebSocket connection closed intentionally.');
          this.isIntentionalDisconnect = false; // Reset the flag
          return; // Don't treat as unexpected disconnection
        }
        
        logger.error(`WebSocket closed unexpectedly. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        
        // CRITICAL FIX: Apply grace period for rollback to prevent false errors for delivered messages
        // Don't rollback immediately for normal closure codes
        if (event?.code === 1000 || event?.code === 1001) {
          logger.debug('Normal WebSocket closure, skipping rollback');
          this.handleDisconnection(event);
          return;
        }
        
        // Clear any existing rollback timer
        if (this.rollbackTimer) {
          clearTimeout(this.rollbackTimer);
          this.rollbackTimer = null;
        }
        
        // Add grace period for pending confirmations to arrive
        if (this.rollbackCallbacks.size > 0) {
          logger.debug(`Setting grace period for ${this.rollbackCallbacks.size} rollback callbacks`);
          this.rollbackTimer = setTimeout(() => {
            if (this.connectionState === 'disconnected' && this.rollbackCallbacks.size > 0) {
              logger.debug(`Grace period expired, triggering rollback for ${this.rollbackCallbacks.size} callbacks`);
              this.rollbackCallbacks.forEach((callback) => {
                try {
                  callback();
                } catch (error) {
                  logger.error('Error during delayed rollback callback execution:', error);
                }
              });
            } else {
              logger.debug('Grace period expired but connection restored or no callbacks remaining');
            }
          }, 5000); // 5 second grace period for pending confirmations
        }
        
        // Immediately handle disconnection regardless of close code
        // This ensures we catch silent failures like 1009 (message too big)
        this.handleDisconnection();
      },
    });
    logger.debug('Activating STOMP client...');
    this.stompClient.activate();
  }
  
  /**
   * Process successful connection with optimized state management
   */
  private processConnection(): void {
    console.log(`[RECONNECTION ANALYSIS] processConnection called - current state: ${this.connectionState}, queue processor exists: ${!!this.queueProcessorCallback}, board refresh exists: ${!!this.boardStateRefreshCallback}`);
    this.connectionState = 'connected';
    this.connectionStateTimestamp = Date.now();
    this.resetReconnectionState(); // Reset reconnection attempts on successful connection
        
    // CRITICAL FIX: Clear rollback timer on successful reconnection
    if (this.rollbackTimer) {
      clearTimeout(this.rollbackTimer);
      this.rollbackTimer = null;
      logger.debug('Cleared rollback timer on successful reconnection');
    }
    
    this.processPendingSubscriptions();
    
    // CRITICAL FIX: Prevent concurrent callback processing
    if (this.isProcessingCallbacks) {
      logger.debug('Callback processing already in progress, skipping duplicate processing');
      this.onConnectedCallback?.();
      return;
    }
    
    this.isProcessingCallbacks = true;
    
    try {
      // CRITICAL FIX: Process queue FIRST, then refresh board state
      // This prevents board refresh from overwriting queued items
      this.processQueueThenRefreshBoard();
      
    } finally {
      // Reset processing flag after all callbacks complete
      setTimeout(() => {
        this.isProcessingCallbacks = false;
        logger.debug('Callback processing completed, flag reset');
      }, 500); // Allow all async operations to complete
    }
    
    this.onConnectedCallback?.();
  }

  /**
   * Process queue first, then refresh board state to prevent data loss
   */
  private async processQueueThenRefreshBoard(): Promise<void> {
    let queueProcessingCompleted = false;
    
    if (this.queueProcessorCallback) {
      console.log(`[QUEUE TIMING FIX] Queue processor callback exists - processing queue FIRST`);
      try {
        // Add small delay to ensure WebSocket state is fully settled
        setTimeout(async () => {
          if (this.queueProcessorCallback && this.connectionState === 'connected') {
            console.log(`[QUEUE TIMING FIX] Processing queue before board refresh`);
            logger.debug('Forcing queue processing before board refresh');
            
            // Try queue processing with retry logic
            for (let attempt = 1; attempt <= 3; attempt++) {
              try {
                await this.queueProcessorCallback();
                logger.debug(`Queue processing succeeded on attempt ${attempt}`);
                queueProcessingCompleted = true;
                break;
              } catch (error) {
                logger.error(`Queue processing attempt ${attempt} failed:`, error);
                if (attempt < 3) {
                  // Wait before retrying (exponential backoff)
                  await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
                } else {
                  logger.error('All queue processing attempts failed after reconnection');
                  queueProcessingCompleted = true; // Continue even if failed
                }
              }
            }
            
            // CRITICAL FIX: Only refresh board state AFTER queue processing completes
            if (this.boardStateRefreshCallback && queueProcessingCompleted) {
              console.log(`[QUEUE TIMING FIX] Queue processing completed - now refreshing board state`);
              try {
                const now = Date.now();
                const timeSinceLastRefresh = now - this.lastBoardRefreshTime;
                
                if (timeSinceLastRefresh >= this.boardRefreshThrottlePeriod) {
                  console.log(`[QUEUE TIMING FIX] Triggering board state refresh AFTER queue processing`);
                  logger.debug('Refreshing board state after queue processing completed');
                  this.lastBoardRefreshTime = now;
                  
                  try {
                    await this.boardStateRefreshCallback();
                    logger.debug('Board state refresh successful after queue processing');
                  } catch (error) {
                    logger.error('Board state refresh failed after queue processing:', error);
                  }
                } else {
                  const remainingTime = this.boardRefreshThrottlePeriod - timeSinceLastRefresh;
                  logger.debug(`Board state refresh throttled. Remaining cooldown: ${remainingTime}ms`);
                }
              } catch (error) {
                logger.error('Error refreshing board state after queue processing:', error);
              }
            }
          }
        }, 150); // Delay for connection to fully stabilize
      } catch (error) {
        logger.error('Error setting up queue and board refresh sequence:', error);
      }
    } else {
      // No queue processor - safe to refresh board state immediately
      console.log(`[QUEUE TIMING FIX] No queue processor - refreshing board state directly`);
      if (this.boardStateRefreshCallback) {
        try {
          setTimeout(async () => {
            if (this.boardStateRefreshCallback && this.connectionState === 'connected') {
              const now = Date.now();
              const timeSinceLastRefresh = now - this.lastBoardRefreshTime;
              
              if (timeSinceLastRefresh >= this.boardRefreshThrottlePeriod) {
                console.log(`[QUEUE TIMING FIX] Triggering board state refresh (no queue)`);
                logger.debug('Refreshing board state after successful reconnection (no queue)');
                this.lastBoardRefreshTime = now;
                
                try {
                  await this.boardStateRefreshCallback();
                  logger.debug('Board state refresh successful after reconnection (no queue)');
                } catch (error) {
                  logger.error('Board state refresh failed after reconnection (no queue):', error);
                }
              } else {
                const remainingTime = this.boardRefreshThrottlePeriod - timeSinceLastRefresh;
                logger.debug(`Board state refresh throttled. Remaining cooldown: ${remainingTime}ms`);
              }
            }
          }, 300);
        } catch (error) {
          logger.error('Error setting up board state refresh after reconnection (no queue):', error);
        }
      }
    }
  }

  public disconnect() {
    // Clear reconnection state
    this.currentToken = null;
    this.onConnectedCallback = null;
    this.rollbackCallbacks.clear();
    this.queueProcessorCallback = null;
    this.transactionSuccessCallback = null;
    this.boardStateRefreshCallback = null;
    this.resetReconnectionState();
    
    // Clear rollback timer on intentional disconnect
    if (this.rollbackTimer) {
      clearTimeout(this.rollbackTimer);
      this.rollbackTimer = null;
    }
    
    // Mark this as an intentional disconnection
    this.isIntentionalDisconnect = true;
        
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      logger.debug('Disconnected from WebSocket.');
      this.stompClient = null;
    }
    this.connectionState = 'disconnected';
    this.pendingSubscriptions = [];
  }

  private processPendingSubscriptions() {
    if (this.connectionState !== 'connected' || !this.stompClient?.active) {
      return;
    }

    const subscriptionsToProcess = [...this.pendingSubscriptions];
    this.pendingSubscriptions = [];

    subscriptionsToProcess.forEach(({ topic, callback, schemaKey }) => {
      try {
        this.subscribe(topic, callback, schemaKey);
      } catch (error) {
        logger.error(`Failed to process pending subscription for topic ${topic}:`, error);
      }
    });
  }

  public subscribe<T>(
    topic: string,
    onMessageReceived: (message: T) => void,
    schemaKey?: string,
  ): StompSubscription | null {
    if (this.connectionState !== 'connected' || !this.stompClient?.active) {
      logger.debug(`WebSocket not ready, queuing subscription for ${topic}`);
      this.pendingSubscriptions.push({
        topic,
        callback: onMessageReceived as (message: unknown) => void,
        schemaKey,
      });
      return null;
    }

    try {
      const subscription = this.stompClient.subscribe(topic, (message: IMessage) => {
        // DIAGNOSTIC LOG: Raw message received before any parsing
        logger.debug(`[DIAGNOSTIC] Raw message received on topic ${topic}. Body: ${message.body}`);
        
        const validatedMessage = this.parseAndValidateMessage<T>(message.body, schemaKey);
        
        // DIAGNOSTIC LOG: Parsed message object after validation
        if (validatedMessage !== null) {
          logger.debug('[DIAGNOSTIC] Parsed message payload:', JSON.stringify(validatedMessage, null, 2));
          onMessageReceived(validatedMessage);
        } else {
          logger.warn(`Invalid message received on topic ${topic}`);
        }
      });

      logger.debug(`Subscribed to ${topic}`);
      return subscription;
    } catch (error) {
      logger.error(`Failed to subscribe to ${topic}:`, error);
      return null;
    }
  }

  public sendMessage(destination: string, body: object) {
    if (this.connectionState !== 'connected' || !this.stompClient?.active) {
      const error = new Error('Cannot send message, STOMP client is not connected.');
      logger.error(error.message);
      throw error;
    }

    const sanitizedBody = sanitizeObject(body);
    const messageBody = JSON.stringify(sanitizedBody);
    
    // Pre-send validation to prevent messages that would exceed server limits
    if (messageBody.length > WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE) {
      const error = new Error(`Cannot send message: size ${messageBody.length} exceeds limit ${WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE}`);
      logger.error(error.message);
      throw error;
    }

    try {
      this.stompClient.publish({
        destination: destination,
        body: messageBody,
      });
    } catch (error) {
      logger.error('Failed to publish message via STOMP client:', error);
      throw error;
    }
  }

  public getConnectionState(): 'disconnected' | 'connecting' | 'connected' {
    return this.connectionState;
  }

  public isConnected(): boolean {
    return this.connectionState === 'connected' && this.stompClient?.active === true;
  }

  /**
   * Register a rollback callback that will be called on unexpected disconnections
   * @param callback Function to call when rollback is needed
   * @returns Function to unregister the callback
   */
  public registerRollbackCallback(callback: () => void): () => void {
    this.rollbackCallbacks.add(callback);
    logger.debug(`Registered rollback callback. Total callbacks: ${this.rollbackCallbacks.size}`);
    
    // Return unregister function
    return () => {
      this.rollbackCallbacks.delete(callback);
      logger.debug(`Unregistered rollback callback. Total callbacks: ${this.rollbackCallbacks.size}`);
    };
  }

  /**
   * Register queue processor callback that will be called after successful reconnection
   * @param callback Function to process offline queue
   * @returns Function to unregister the callback
   */
  public registerQueueProcessor(callback: () => Promise<void>): () => void {
    console.log(`[QUEUE REGISTRATION FIX] registerQueueProcessor called - callback exists: ${!!callback}`);
    this.queueProcessorCallback = callback;
    console.log(`[QUEUE REGISTRATION FIX] Queue processor callback stored - now exists: ${!!this.queueProcessorCallback}`);
    logger.debug('Registered offline queue processor callback');
    
    // Return unregister function
    return () => {
      console.log(`[QUEUE REGISTRATION FIX] Queue processor being unregistered - was: ${!!this.queueProcessorCallback}`);
      this.queueProcessorCallback = null;
      console.log(`[QUEUE REGISTRATION FIX] Queue processor unregistered - now: ${!!this.queueProcessorCallback}`);
      logger.debug('Unregistered offline queue processor callback');
    };
  }

  /**
   * Register transaction success callback that will be called when queue successfully processes a message
   * This bridges the gap between offline queue and transaction state management
   * @param callback Function to update transaction status
   * @returns Function to unregister the callback
   */
  public registerTransactionSuccessCallback(callback: (transactionId: string) => void): () => void {
    this.transactionSuccessCallback = callback;
    logger.debug('Registered transaction success callback for queue→transaction bridge');
    
    // Return unregister function
    return () => {
      this.transactionSuccessCallback = null;
      logger.debug('Unregistered transaction success callback');
    };
  }

  /**
   * Register board state refresh callback that will be called after successful reconnection
   * This ensures local board state is synchronized with server state
   * @param callback Function to refresh board state from server
   * @returns Function to unregister the callback
   */
  public registerBoardStateRefreshCallback(callback: () => Promise<void>): () => void {
    this.boardStateRefreshCallback = callback;
    logger.debug('Registered board state refresh callback');
    
    // Return unregister function
    return () => {
      this.boardStateRefreshCallback = null;
      logger.debug('Unregistered board state refresh callback');
    };
  }

  /**
   * Notify transaction system that a queued action was successfully sent
   * This is called by the queue processor when an action succeeds
   * @param transactionId The transaction ID to mark as confirmed
   */
  public notifyTransactionSuccess(transactionId: string): void {
    console.log(`[QUEUE PROCESSING ANALYSIS] notifyTransactionSuccess called - transactionId: ${transactionId}, callback exists: ${!!this.transactionSuccessCallback}`);
    if (this.transactionSuccessCallback) {
      logger.debug(`Notifying transaction system of successful send: ${transactionId}`);
      this.transactionSuccessCallback(transactionId);
    } else {
      console.log(`[QUEUE PROCESSING ANALYSIS] No transaction success callback registered!`);
      logger.warn(`No transaction success callback registered for transaction: ${transactionId}`);
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService;
