
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  type MessageValidationSchema,
  sanitizeObject,
  validateBoardMessage,
  validateMessage,
} from 'utils';
import logger from 'utils/logger';

import { AUTH_HEADER_CONFIG, WEBSOCKET_CONFIG } from '../constants';
import { WEBSOCKET_URL } from '../constants/ApiConstants';



export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

class WebSocketService {
  private stompClient: Client | null = null;
  private readonly messageSchemas = new Map<string, MessageValidationSchema>();
  private connectionState: ConnectionStatus = 'connecting';
  private pendingSubscriptions: {
        topic: string;
        callback: (message: unknown) => void;
        schemaKey?: string;
    }[] = [];
    
  // Event-based connection listeners
  private connectionListeners = new Set<(status: ConnectionStatus) => void>();
    
  // Reconnection logic properties
  private reconnectionAttempts = 0;
  private reconnectionTimer: ReturnType<typeof setTimeout> | null = null;
  private currentToken: string | null = null;
  private onConnectedCallback: (() => void) | null = null;
  // Support multiple rollback callbacks for different board workspaces
  private rollbackCallbacks = new Set<() => void>();
  // Flag to track intentional disconnections
  private isIntentionalDisconnect = false;
  // Timer for delayed rollback to allow pending confirmations
  private rollbackTimer: ReturnType<typeof setTimeout> | null = null;
  // Rapid reconnection protection
  private lastConnectionAttempt = 0;
  private connectionCooldownPeriod = 2000; // 2 seconds minimum between connection attempts
  private isProcessingCallbacks = false; // Prevent concurrent callback processing
  // Connection state optimization
  // private connectionStateTimestamp = 0; // Track when connection state last changed (unused)
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
  private handleDisconnection(): void {
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
      // this.connectionStateTimestamp = Date.now(); // unused
      
      // Notify listeners immediately
      this.notifyConnectionChange();
      
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
      this.attemptReconnection();
    }
  }

  /**
     * Attempts to reconnect with exponential backoff strategy.
     * Delay increases exponentially: baseDelay * 2^attempts
     */
  private attemptReconnection(): void {
    // Prevent reconnection if already connected or connecting
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      logger.debug(`Skipping reconnection attempt - already ${this.connectionState}`);
      return;
    }
    
    // Prevent multiple concurrent reconnection attempts
    if (this.reconnectionTimer) {
      logger.debug('Reconnection already scheduled, skipping duplicate attempt');
      return;
    }
    
    if (this.reconnectionAttempts >= WEBSOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS) {
      logger.error(`Maximum reconnection attempts (${WEBSOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS}) reached. Stopping reconnection attempts.`);
      this.connectionState = 'disconnected';
      this.notifyConnectionChange();
      return;
    }

    const delay = WEBSOCKET_CONFIG.BASE_RECONNECTION_DELAY * Math.pow(2, this.reconnectionAttempts);
    this.reconnectionAttempts++;
        
    logger.info(`Attempting to reconnect... (attempt ${this.reconnectionAttempts}/${WEBSOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS}) in ${delay}ms`);

    this.reconnectionTimer = setTimeout(() => {
      this.reconnectionTimer = null; // Clear the timer reference
      
      // Double-check we still need to reconnect
      if (this.connectionState === 'connected') {
        logger.debug('Connection restored while waiting for reconnection, cancelling attempt');
        return;
      }
      
      if (this.currentToken && this.onConnectedCallback) {
        logger.debug('Executing scheduled reconnection attempt');
        this.connectInternal(this.currentToken);
      } else {
        logger.warn('No token or callback available for reconnection');
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

    this.connectInternal(token);
  }

  private connectInternal(token: string): void {
    this.connectionState = 'connecting';
    this.notifyConnectionChange();

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      connectHeaders: {
        [AUTH_HEADER_CONFIG.HEADER_NAME]: `${AUTH_HEADER_CONFIG.TOKEN_PREFIX}${token}`,
      },
      onConnect: async () => {
        logger.debug('Connected to WebSocket server!');
        
        // CRITICAL FIX: Prevent connection state changes during processing
        if (this.connectionStateChangeLock) {
          logger.debug('Connection state change locked, deferring connection processing');
          // Brief delay before processing connection
          setTimeout(() => {
            if (this.stompClient?.active) {
              this.processConnection();
            }
          }, 600);
          return;
        }
        
        this.processConnection();
      },
      onDisconnect: () => {
        logger.debug('STOMP disconnected from WebSocket.');
        this.handleDisconnection();
      },
      onStompError: (frame) => {
        logger.error('Broker reported error: ' + frame.headers['message']);
        
        // Don't disconnect immediately on broker errors - many are recoverable
        // Only disconnect on critical authentication or connection errors
        const errorMessage = frame.headers['message'] || '';
        const isCriticalError = errorMessage.includes('Authentication') || 
                               errorMessage.includes('Authorization') ||
                               errorMessage.includes('Connection refused') ||
                               errorMessage.includes('Access denied');
        
        if (isCriticalError) {
          logger.error('Critical broker error detected, disconnecting:', errorMessage);
          this.handleDisconnection();
        } else {
          logger.warn('Non-critical broker error, maintaining connection:', errorMessage);
          // Just log the error but keep connection alive
        }
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
          this.handleDisconnection();
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
    // CRITICAL FIX: Prevent concurrent callback processing - check at the very beginning
    if (this.isProcessingCallbacks) {
      logger.debug('Connection processing already in progress, skipping duplicate processing');
      return;
    }
    
    this.isProcessingCallbacks = true;
    
    try {
      this.connectionState = 'connected';
      // this.connectionStateTimestamp = Date.now(); // unused
      this.notifyConnectionChange();
      this.resetReconnectionState(); // Reset reconnection attempts on successful connection
          
      // CRITICAL FIX: Clear rollback timer on successful reconnection
      if (this.rollbackTimer) {
        clearTimeout(this.rollbackTimer);
        this.rollbackTimer = null;
        logger.debug('Cleared rollback timer on successful reconnection');
      }
      
      // Wait a brief moment to ensure STOMP connection is fully established
      setTimeout(() => {
        if (this.stompClient?.connected && this.connectionState === 'connected') {
          logger.debug('STOMP connection confirmed, processing pending subscriptions');
          this.processPendingSubscriptions();
          
          // Call connected callback after subscriptions are processed
          this.onConnectedCallback?.();
        } else {
          logger.warn('STOMP connection not fully established, skipping subscription processing');
        }
      }, 100); // Brief delay to ensure STOMP is ready
      
    } finally {
      // Reset processing flag after a reasonable delay
      setTimeout(() => {
        this.isProcessingCallbacks = false;
        logger.debug('Connection processing completed, flag reset');
      }, 1000); // Longer delay to prevent rapid re-processing
    }
  }


  public disconnect() {
    // Clear reconnection state
    this.currentToken = null;
    this.onConnectedCallback = null;
    this.rollbackCallbacks.clear();
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
    this.notifyConnectionChange();
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
    // Enhanced connection checks - ensure STOMP client is fully connected
    if (this.connectionState !== 'connected' || !this.stompClient?.active || !this.stompClient?.connected) {
      logger.debug(`WebSocket not ready, queuing subscription for ${topic}. State: ${this.connectionState}, Active: ${this.stompClient?.active}, Connected: ${this.stompClient?.connected}`);
      this.pendingSubscriptions.push({
        topic,
        callback: onMessageReceived as (message: unknown) => void,
        schemaKey,
      });
      return null;
    }

    try {
      // Additional safety check before subscribing
      if (!this.stompClient.connected) {
        throw new Error('STOMP client not in connected state');
      }
      
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

      logger.debug(`Successfully subscribed to ${topic}`);
      return subscription;
    } catch (error) {
      logger.error(`Failed to subscribe to ${topic}:`, error);
      
      // If subscription fails due to connection issues, queue it for retry
      if (error instanceof Error && error.message.includes('STOMP')) {
        logger.debug(`Queuing failed subscription for retry: ${topic}`);
        this.pendingSubscriptions.push({
          topic,
          callback: onMessageReceived as (message: unknown) => void,
          schemaKey,
        });
      }
      
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

  public getConnectionState(): ConnectionStatus {
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
   * Subscribe to connection status changes for instant UI updates
   * @param callback Function to call when connection status changes
   * @returns Function to unsubscribe from connection changes
   */
  public subscribeToConnectionChanges(callback: (status: ConnectionStatus) => void): () => void {
    this.connectionListeners.add(callback);
    
    // Immediately call with current status
    callback(this.connectionState);
    
    logger.debug(`Registered connection listener. Total listeners: ${this.connectionListeners.size}`);
    
    // Return unsubscribe function
    return () => {
      this.connectionListeners.delete(callback);
      logger.debug(`Unregistered connection listener. Total listeners: ${this.connectionListeners.size}`);
    };
  }

  /**
   * Notify all connection listeners of status change
   */
  private notifyConnectionChange(): void {
    logger.debug(`Notifying ${this.connectionListeners.size} listeners of connection state: ${this.connectionState}`);
    
    this.connectionListeners.forEach((listener) => {
      try {
        listener(this.connectionState);
      } catch (error) {
        logger.error('Error in connection listener callback:', error);
      }
    });
  }




}

const websocketService = new WebSocketService();
export default websocketService;
