
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import logger from 'utils/Logger';
import {
  type MessageValidationSchema,
  sanitizeObject,
  validateBoardMessage,
  validateMessage,
} from 'utils/UnifiedValidation';

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
    
  private reconnectionAttempts = 0;
  private reconnectionTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentToken: string | null = null;
  private onConnectedCallback: (() => void) | null = null;
  private rollbackCallbacks = new Set<() => void>();
  private queueProcessorCallback: (() => Promise<void>) | null = null;
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

  private handleDisconnection(): void {
    if (this.connectionState === 'disconnected') {
      return;
    }
    
    logger.info('Connection lost - attempting to reconnect...');
    this.connectionState = 'disconnected';
    
    if (this.currentToken && this.onConnectedCallback) {
      this.attemptReconnection();
    } else {
      this.resetReconnectionState();
    }
  }

  private attemptReconnection(): void {
    // Prevent excessive reconnection attempts
    if (this.reconnectionAttempts >= WEBSOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS) {
      logger.warn(`Max reconnection attempts (${WEBSOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS}) reached. Stopping reconnection.`);
      this.resetReconnectionState();
      this.connectionState = 'disconnected';
      return;
    }

    const baseDelay = WEBSOCKET_CONFIG.BASE_RECONNECTION_DELAY;
    const delay = Math.min(
      baseDelay * Math.pow(2, this.reconnectionAttempts),
      30000,
    );
    this.reconnectionAttempts++;

    logger.info(`Attempting reconnection ${this.reconnectionAttempts}/${WEBSOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS} in ${delay}ms`);

    this.reconnectionTimer = setTimeout(() => {
      if (this.currentToken && 
          this.onConnectedCallback && 
          this.connectionState === 'disconnected') {
        this.connectInternal(this.currentToken, this.onConnectedCallback);
      } else {
        this.resetReconnectionState();
      }
    }, delay);
  }

  private resetReconnectionState(): void {
    this.reconnectionAttempts = 0;
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  public connect(token: string, onConnectedCallback: () => void) {
    // Prevent duplicate connections
    if (this.connectionState === 'connecting' || 
        (this.stompClient?.active && this.connectionState === 'connected')) {
      if (this.connectionState === 'connected') {
        onConnectedCallback();
      }
      return;
    }

    this.currentToken = token;
    this.onConnectedCallback = onConnectedCallback;
    this.connectInternal(token, onConnectedCallback);
  }

  private connectInternal(token: string, onConnectedCallback: () => void): void {
    this.connectionState = 'connecting';

    // Clean up existing client and timers if any
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    // Set connection timeout
    this.connectionTimeout = setTimeout(() => {
      logger.warn('WebSocket connection timeout - forcing disconnect');
      this.handleDisconnection();
    }, 10000); // 10 second timeout

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      connectHeaders: {
        [AUTH_HEADER_CONFIG.HEADER_NAME]: `${AUTH_HEADER_CONFIG.TOKEN_PREFIX}${token}`,
      },
      reconnectDelay: 0,
      heartbeatIncoming: 30000, // 30 seconds - expect heartbeat from server
      heartbeatOutgoing: 30000, // 30 seconds - send heartbeat to server
      onConnect: async () => {
        logger.info('Connected to server');
        this.connectionState = 'connected';
        this.resetReconnectionState();
        
        // Clear connection timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        
        this.processPendingSubscriptions();
        
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
        if (!this.isIntentionalDisconnect) {
          this.handleDisconnection();
        }
      },
      onStompError: (frame) => {
        const errorMessage = frame.headers['message'] || 'Unknown broker error';
        logger.warn(`Server error: ${errorMessage}`);
        
        this.handleDisconnection();
      },
      onWebSocketClose: (event) => {
        if (this.isIntentionalDisconnect) {
          this.isIntentionalDisconnect = false;
          return;
        }
        
        logger.info(`Connection closed (${event.code}${event.reason ? ': ' + event.reason : ''})`);
        
        if (this.rollbackCallbacks.size > 0) {
          this.rollbackCallbacks.forEach((callback) => {
            try {
              callback();
            } catch (error) {
              logger.error('Error during rollback check:', error);
            }
          });
        }
        
        this.handleDisconnection();
      },
    });
    this.stompClient.activate();
  }

  public disconnect() {
    this.currentToken = null;
    this.onConnectedCallback = null;
    this.rollbackCallbacks.clear();
    this.queueProcessorCallback = null;
    this.resetReconnectionState();
    
    this.isIntentionalDisconnect = true;
        
    if (this.stompClient?.active) {
      try {
        this.stompClient.deactivate();
      } catch (error) {
        logger.warn('Error during WebSocket disconnect:', error);
      }
      this.stompClient = null;
    }
    this.connectionState = 'disconnected';
    this.pendingSubscriptions = [];
    
    // Reset disconnect flag after a brief delay
    setTimeout(() => {
      this.isIntentionalDisconnect = false;
    }, 100);
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

  public registerRollbackCallback(callback: () => void): () => void {
    this.rollbackCallbacks.add(callback);
    
    return () => {
      this.rollbackCallbacks.delete(callback);
    };
  }

  public registerQueueProcessor(callback: () => Promise<void>): () => void {
    this.queueProcessorCallback = callback;
    
    return () => {
      this.queueProcessorCallback = null;
    };
  }
}

const websocketService = new WebSocketService();
export default websocketService;
