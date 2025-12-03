import type { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import {
  type MessageValidationSchema,
  sanitizeObject,
  validateBoardMessage,
  validateMessage,
} from 'features/auth/utils/SecurityUtils';
import { AUTH_HEADER_CONFIG, getWebSocketUrl } from 'shared/constants/ApiConstants';
import { WEBSOCKET_CONFIG } from 'shared/constants/AppConstants';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';
import logger from 'shared/utils/logger';

// Lazy-load STOMP client to reduce initial bundle size on auth page
let StompClientClass: typeof Client | null = null;
const getStompClient = async (): Promise<typeof Client> => {
  if (!StompClientClass) {
    const { Client } = await import('@stomp/stompjs');
    StompClientClass = Client;
  }
  return StompClientClass;
};

/**
 * Comprehensive WebSocket service managing STOMP-based real-time communication with the backend.
 * Handles connection lifecycle, automatic reconnection, message validation, and subscription management.
 * Implements security features including message sanitization, schema validation, and size limits.
 *
 * Key features:
 * - JWT-authenticated STOMP connections over native WebSocket
 * - Exponential backoff reconnection strategy with configurable limits
 * - Message validation and sanitization for security
 * - Pending subscription queue for connection interruptions
 * - Rollback callbacks for optimistic update conflict resolution
 * - Offline message queue processing upon reconnection
 * - Connection timeout handling and heartbeat monitoring
 */
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

  /**
   * Initializes message validation schemas for different WebSocket message types.
   * Defines security constraints and required fields for board, user, and chat messages.
   */
  private initializeMessageSchemas(): void {
    this.messageSchemas.set('board', {});

    this.messageSchemas.set('user', {
      requiredFields: ['updateType'],
      allowedTypes: ['BOARD_LIST_CHANGED', 'BOARD_DETAILS_CHANGED', 'CANVAS_SETTINGS_CHANGED'],
    });

    this.messageSchemas.set('chat', {
      requiredFields: ['type', 'content', 'timestamp', 'senderEmail'],
      maxLength: 5000, // Prevents memory abuse from malicious large chat payloads
    });
  }

  /**
   * Validates incoming WebSocket message against specified schema or general security rules.
   * Applies schema-specific validation for different message types and falls back to basic validation.
   *
   * @param data - Message data to validate
   * @param schemaKey - Optional schema identifier for specific validation rules
   * @returns True if message passes validation, false otherwise
   */
  private validateMessageWithSchema(data: unknown, schemaKey?: string): boolean {
    const dataObj = data as Record<string, unknown>;

    if (schemaKey && this.messageSchemas.has(schemaKey)) {
      const schema = this.messageSchemas.get(schemaKey);
      if (!schema) {
        return true;
      }

      // Board messages use specialized validation for performance
      if (schemaKey === 'board') {
        return validateBoardMessage(dataObj);
      }

      return validateMessage(data, schema);
    }

    // Default to basic validation if no schema specified
    return validateMessage(data);
  }

  /**
   * Parses JSON message body and applies validation and sanitization before processing.
   * Enforces message size limits, validates structure, and sanitizes content for security.
   *
   * @param messageBody - Raw JSON string from WebSocket message
   * @param schemaKey - Optional schema key for validation
   * @returns Parsed and sanitized message object or null if invalid
   */
  private parseAndValidateMessage<T>(messageBody: string, schemaKey?: string): T | null {
    try {
      if (messageBody.length > WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE) {
        logger.error(
          `Message exceeds maximum allowed size: ${messageBody.length} > ${WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE}`,
        );
        return null;
      }

      const parsedData = JSON.parse(messageBody) as unknown;

      // Apply validation based on schema or general security rules
      if (!this.validateMessageWithSchema(parsedData, schemaKey)) {
        return null;
      }

      // Sanitize all string content to prevent XSS attacks
      const sanitizedData = sanitizeObject(parsedData);

      return sanitizedData as T;
    } catch (error) {
      logger.error('Failed to parse WebSocket message:', error);
      return null;
    }
  }

  /**
   * Handles WebSocket disconnection events and initiates reconnection if appropriate.
   * Determines whether disconnection was intentional and manages reconnection attempts.
   */
  private handleDisconnection(): void {
    if (this.connectionState === 'disconnected') {
      return;
    }

    this.connectionState = 'disconnected';

    // Only attempt reconnection if we have credentials and callback
    if (this.currentToken && this.onConnectedCallback) {
      this.attemptReconnection();
    } else {
      this.resetReconnectionState();
    }
  }

  /**
   * Implements exponential backoff reconnection strategy with maximum attempt limits.
   * Calculates increasing delays between attempts to avoid overwhelming the server.
   */
  private attemptReconnection(): void {
    if (this.reconnectionAttempts >= WEBSOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS) {
      logger.warn(
        `Max reconnection attempts (${WEBSOCKET_CONFIG.MAX_RECONNECTION_ATTEMPTS}) reached. Stopping reconnection.`,
      );
      this.resetReconnectionState();
      this.connectionState = 'disconnected';
      return;
    }

    // Exponential backoff with cap to prevent excessive delays
    const baseDelay = WEBSOCKET_CONFIG.BASE_RECONNECTION_DELAY;
    const delay = Math.min(baseDelay * Math.pow(2, this.reconnectionAttempts), 30000); // Cap at 30 seconds to balance retry frequency with server load
    this.reconnectionAttempts++;

    this.reconnectionTimer = setTimeout(() => {
      // Verify conditions are still valid before attempting reconnection
      if (
        this.currentToken &&
        this.onConnectedCallback &&
        this.connectionState === 'disconnected'
      ) {
        this.connectInternal(this.currentToken, this.onConnectedCallback);
      } else {
        this.resetReconnectionState();
      }
    }, delay);
  }

  /**
   * Clears all reconnection-related timers and resets attempt counters.
   * Called when giving up on reconnection or when connection is successful.
   */
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

  /**
   * Establishes WebSocket connection with JWT authentication and manages connection lifecycle.
   * Prevents duplicate connections and handles existing connection cleanup before establishing new ones.
   *
   * @param token - JWT token for authentication
   * @param onConnectedCallback - Callback executed when connection is successfully established
   */
  public connect(token: string, onConnectedCallback: () => void) {
    // Prevent duplicate connection attempts
    if (
      this.connectionState === 'connecting' ||
      (this.stompClient?.active && this.connectionState === 'connected')
    ) {
      if (this.connectionState === 'connected') {
        onConnectedCallback();
      }
      return;
    }

    this.currentToken = token;
    this.onConnectedCallback = onConnectedCallback;
    this.connectInternal(token, onConnectedCallback);
  }

  /**
   * Internal method that performs the actual WebSocket connection setup.
   * Configures STOMP client with authentication headers, event handlers, and connection parameters.
   * Uses lazy-loaded STOMP library to reduce initial bundle size.
   *
   * @param token - JWT token for authentication headers
   * @param onConnectedCallback - Callback to execute upon successful connection
   */
  private async connectInternal(token: string, onConnectedCallback: () => void): Promise<void> {
    this.connectionState = 'connecting';

    if (this.stompClient) {
      void this.stompClient.deactivate();
      this.stompClient = null;
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    this.connectionTimeout = setTimeout(() => {
      logger.warn('WebSocket connection timeout - forcing disconnect');
      this.handleDisconnection();
    }, TIMING_CONSTANTS.WEBSOCKET_CONNECTION_TIMEOUT);

    // Lazy-load STOMP client library
    const ClientClass = await getStompClient();

    this.stompClient = new ClientClass({
      brokerURL: getWebSocketUrl(),
      connectHeaders: {
        [AUTH_HEADER_CONFIG.HEADER_NAME]: `${AUTH_HEADER_CONFIG.TOKEN_PREFIX}${token}`,
      },
      reconnectDelay: 0, // Disable STOMP's built-in reconnection to use custom exponential backoff
      heartbeatIncoming: 10000, // Server heartbeat interval for connection health monitoring
      heartbeatOutgoing: 10000, // Client heartbeat interval to keep connection alive through firewalls
      onConnect: async () => {
        this.connectionState = 'connected';
        this.resetReconnectionState();

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
        const errorMessage = frame.headers['message'] ?? 'Unknown broker error';
        logger.warn(`Server error: ${errorMessage}`);

        this.handleDisconnection();
      },
      onWebSocketClose: (_event) => {
        if (this.isIntentionalDisconnect) {
          this.isIntentionalDisconnect = false;
          return;
        }

        if (this.rollbackCallbacks.size > 0) {
          // Only process rollbacks if pending optimistic updates exist
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

  /**
   * Cleanly disconnects WebSocket connection and clears all associated state.
   * Marks disconnection as intentional to prevent automatic reconnection attempts.
   */
  public disconnect() {
    this.currentToken = null;
    this.onConnectedCallback = null;
    this.rollbackCallbacks.clear();
    this.queueProcessorCallback = null;
    this.resetReconnectionState();

    this.isIntentionalDisconnect = true;

    if (this.stompClient?.active) {
      try {
        void this.stompClient.deactivate();
      } catch (error) {
        logger.warn('Error during WebSocket disconnect:', error);
      }
      this.stompClient = null;
    }
    this.connectionState = 'disconnected';
    this.pendingSubscriptions = [];

    // Brief delay allows disconnect handler to complete before clearing intentional disconnect flag
    setTimeout(() => {
      this.isIntentionalDisconnect = false;
    }, 100);
  }

  /**
   * Processes subscriptions that were queued while WebSocket was disconnected.
   * Called automatically when connection is established to restore topic subscriptions.
   */
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

  /**
   * Subscribes to STOMP topic with message validation and automatic queuing for disconnected state.
   * Queues subscriptions when disconnected and processes them upon reconnection.
   *
   * @param topic - STOMP topic path to subscribe to
   * @param onMessageReceived - Callback function to handle incoming messages
   * @param schemaKey - Optional validation schema key for message security
   * @returns STOMP subscription object for management, or null if queued for later
   */
  public subscribe<T>(
    topic: string,
    onMessageReceived: (message: T) => void,
    schemaKey?: string,
  ): StompSubscription | null {
    // Queue subscription if not connected, process when connection is restored
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
        // Validate and sanitize all incoming messages
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

  /**
   * Sends message to specified STOMP destination with validation and sanitization.
   * Enforces message size limits and connection state validation before sending.
   *
   * @param destination - STOMP destination path (e.g., '/app/chat.send')
   * @param body - Message body object to be JSON serialized and sent
   * @throws {Error} When connection is not established or message exceeds size limits
   */
  public sendMessage(destination: string, body: object) {
    if (this.connectionState !== 'connected' || !this.stompClient?.active) {
      const error = new Error('Cannot send message, STOMP client is not connected.');
      logger.error(error.message);
      throw error;
    }

    // Sanitize outgoing message content for security
    const sanitizedBody = sanitizeObject(body);
    const messageBody = JSON.stringify(sanitizedBody);

    // Enforce message size limits to prevent abuse
    if (messageBody.length > WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE) {
      const error = new Error(
        `Cannot send message: size ${messageBody.length} exceeds limit ${WEBSOCKET_CONFIG.MAX_MESSAGE_SIZE}`,
      );
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

  /**
   * Returns current WebSocket connection state for UI state management.
   *
   * @returns Current connection state: 'disconnected', 'connecting', or 'connected'
   */
  public getConnectionState(): 'disconnected' | 'connecting' | 'connected' {
    return this.connectionState;
  }

  /**
   * Checks if WebSocket is fully connected and ready for message operations.
   *
   * @returns True if connection is established and STOMP client is active
   */
  public isConnected(): boolean {
    return this.connectionState === 'connected' && this.stompClient?.active === true;
  }

  /**
   * Registers callback for optimistic update rollback when WebSocket disconnects.
   * Used to revert UI changes that haven't been confirmed by the server.
   *
   * @param callback - Function to execute when connection is lost for rollback operations
   * @returns Cleanup function to remove the callback registration
   */
  public registerRollbackCallback(callback: () => void): () => void {
    this.rollbackCallbacks.add(callback);

    return () => {
      this.rollbackCallbacks.delete(callback);
    };
  }

  /**
   * Registers callback to process offline message queue when connection is restored.
   * Used to send messages that were queued while WebSocket was disconnected.
   *
   * @param callback - Async function to process queued messages upon reconnection
   * @returns Cleanup function to remove the callback registration
   */
  public registerQueueProcessor(callback: () => Promise<void>): () => void {
    this.queueProcessorCallback = callback;

    return () => {
      this.queueProcessorCallback = null;
    };
  }
}

const websocketService = new WebSocketService();
export default websocketService;
