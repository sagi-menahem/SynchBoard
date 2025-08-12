import { AUTH_HEADER_CONFIG, WEBSOCKET_URL } from 'constants';

import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    type MessageValidationSchema,
    sanitizeObject,
    validateBoardMessage,
    validateMessage,
} from 'utils';
import logger from 'utils/Logger';



class WebSocketService {
    private stompClient: Client | null = null;
    private readonly MAX_MESSAGE_SIZE = 1024 * 100; // 100KB limit
    private readonly messageSchemas = new Map<string, MessageValidationSchema>();
    private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
    private pendingSubscriptions: {
        topic: string;
        callback: (message: unknown) => void;
        schemaKey?: string;
    }[] = [];

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
            if (messageBody.length > this.MAX_MESSAGE_SIZE) {
                logger.error('Message exceeds maximum allowed size');
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

    public connect(token: string, onConnectedCallback: () => void) {
        if (this.stompClient?.active && this.connectionState === 'connected') {
            logger.debug('WebSocket already connected.');
            onConnectedCallback();
            return;
        }

        if (this.connectionState === 'connecting') {
            logger.debug('WebSocket connection already in progress.');
            return;
        }

        this.connectionState = 'connecting';

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            connectHeaders: {
                [AUTH_HEADER_CONFIG.HEADER_NAME]: `${AUTH_HEADER_CONFIG.TOKEN_PREFIX}${token}`,
            },
            onConnect: () => {
                logger.debug('Connected to WebSocket server!');
                this.connectionState = 'connected';
                this.processPendingSubscriptions();
                onConnectedCallback();
            },
            onDisconnect: () => {
                logger.debug('Disconnected from WebSocket.');
                this.connectionState = 'disconnected';
            },
            onStompError: (frame) => {
                logger.error('Broker reported error: ' + frame.headers['message']);
                this.connectionState = 'disconnected';
            },
        });
        logger.debug('Activating STOMP client...');
        this.stompClient.activate();
    }

    public disconnect() {
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
        schemaKey?: string
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
                const validatedMessage = this.parseAndValidateMessage<T>(message.body, schemaKey);
                if (validatedMessage !== null) {
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
            logger.error('Cannot send message, STOMP client is not connected.');
            return;
        }

        const sanitizedBody = sanitizeObject(body);

        this.stompClient.publish({
            destination: destination,
            body: JSON.stringify(sanitizedBody),
        });
    }

    public getConnectionState(): 'disconnected' | 'connecting' | 'connected' {
        return this.connectionState;
    }

    public isConnected(): boolean {
        return this.connectionState === 'connected' && this.stompClient?.active === true;
    }
}

const websocketService = new WebSocketService();
export default websocketService;
