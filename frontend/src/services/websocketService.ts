
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
  // Flag to track intentional disconnections
  private isIntentionalDisconnect = false;

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
    // Prevent multiple simultaneous disconnection handling
    if (this.connectionState === 'disconnected') {
      return; // Already handling disconnection
    }
    
    logger.info('Connection lost - attempting to reconnect...');
    this.connectionState = 'disconnected';
    
    // Always attempt reconnection if we have valid connection params
    if (this.currentToken && this.onConnectedCallback) {
      this.attemptReconnection();
    } else {
      this.resetReconnectionState();
    }
  }

  /**
     * Attempts to reconnect with exponential backoff strategy.
     * Delay increases exponentially: 1s, 2s, 4s, 8s, 16s, capped at 30s
     */
  private attemptReconnection(): void {
    // Calculate delay with exponential backoff, capped at 30 seconds
    const baseDelay = 1000; // Start with 1 second
    const delay = Math.min(
      baseDelay * Math.pow(2, this.reconnectionAttempts),
      30000 // Cap at 30 seconds max delay
    );
    this.reconnectionAttempts++;

    this.reconnectionTimer = setTimeout(() => {
      // Check all conditions before reconnecting
      if (this.currentToken && 
          this.onConnectedCallback && 
          this.connectionState === 'disconnected') {
        this.connectInternal(this.currentToken, this.onConnectedCallback);
      } else {
        this.resetReconnectionState();
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
    // Store connection parameters for potential reconnection
    this.currentToken = token;
    this.onConnectedCallback = onConnectedCallback;
        
    if (this.stompClient?.active && this.connectionState === 'connected') {
      onConnectedCallback();
      return;
    }

    if (this.connectionState === 'connecting') {
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
      // Disable automatic reconnection - we handle this manually
      reconnectDelay: 0,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      onConnect: async () => {
        logger.info('Connected to server');
        this.connectionState = 'connected';
        this.resetReconnectionState(); // Reset reconnection attempts on successful connection
        this.processPendingSubscriptions();
        
        // Process offline queue after successful reconnection
        if (this.queueProcessorCallback) {
          try {
            await this.queueProcessorCallback();
          } catch (error) {
            logger.error('Error processing offline queue after reconnection:', error);
          }
        }
        
        onConnectedCallback();
      },
      onDisconnect: () => {
        // Only handle disconnection if this wasn't intentional
        if (!this.isIntentionalDisconnect) {
          this.handleDisconnection();
        }
      },
      onStompError: (frame) => {
        const errorMessage = frame.headers['message'] || 'Unknown broker error';
        logger.warn(`Server error: ${errorMessage}`);
        
        // Handle disconnection for any STOMP error
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
          this.isIntentionalDisconnect = false; // Reset the flag
          return; // Don't treat as unexpected disconnection
        }
        
        logger.info(`Connection closed (${event.code}${event.reason ? ': ' + event.reason : ''})`);
        
        // Check for unsent transactions and handle rollbacks
        if (this.rollbackCallbacks.size > 0) {
          this.rollbackCallbacks.forEach((callback) => {
            try {
              callback(); // Each callback will check its own pending transactions
            } catch (error) {
              logger.error('Error during rollback check:', error);
            }
          });
        }
        
        // Immediately handle disconnection regardless of close code
        // This ensures we catch silent failures like 1009 (message too big)
        this.handleDisconnection();
      },
    });
    this.stompClient.activate();
  }

  public disconnect() {
    // Clear reconnection state
    this.currentToken = null;
    this.onConnectedCallback = null;
    this.rollbackCallbacks.clear();
    this.queueProcessorCallback = null;
    this.resetReconnectionState();
    
    // Mark this as an intentional disconnection
    this.isIntentionalDisconnect = true;
        
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
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
      this.pendingSubscriptions.push({
        topic,
        callback: onMessageReceived as (message: unknown) => void,
        schemaKey,
      });
      return null;
    }

    try {
      const subscription = this.stompClient.subscribe(topic, (message: IMessage) => {
        const validatedMessage = this.parseAndValidateMessage<T>(message.body, schemaKey);
        
        if (validatedMessage !== null) {
          onMessageReceived(validatedMessage);
        } else {
          logger.warn(`Invalid message received on topic ${topic}`);
        }
      });

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
   * The callback should check for actual pending transactions before performing rollbacks
   * @param callback Function to call when rollback check is needed
   * @returns Function to unregister the callback
   */
  public registerRollbackCallback(callback: () => void): () => void {
    this.rollbackCallbacks.add(callback);
    
    // Return unregister function
    return () => {
      this.rollbackCallbacks.delete(callback);
    };
  }

  /**
   * Register queue processor callback that will be called after successful reconnection
   * @param callback Function to process offline queue
   * @returns Function to unregister the callback
   */
  public registerQueueProcessor(callback: () => Promise<void>): () => void {
    this.queueProcessorCallback = callback;
    
    // Return unregister function
    return () => {
      this.queueProcessorCallback = null;
    };
  }
}

const websocketService = new WebSocketService();
export default websocketService;
