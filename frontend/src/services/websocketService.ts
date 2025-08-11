import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import logger from 'utils/Logger';

import { AUTH_HEADER_CONFIG, WEBSOCKET_URL } from 'constants/ApiConstants';

interface MessageValidationSchema {
    requiredFields?: string[];
    allowedTypes?: string[];
    maxLength?: number;
}

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
            allowedTypes: ['BOARD_LIST_CHANGED'],
        });

        this.messageSchemas.set('chat', {
            requiredFields: ['type', 'content', 'timestamp', 'senderEmail'],
            maxLength: 5000,
        });
    }

    private sanitizeString(input: unknown): string {
        if (typeof input !== 'string') {
            return String(input);
        }
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }

    private sanitizeObject(obj: unknown): unknown {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj === 'string') {
            return this.sanitizeString(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => this.sanitizeObject(item));
        }

        if (typeof obj === 'object') {
            const objRecord = obj as Record<string, unknown>;
            const sanitized: Record<string, unknown> = {};
            for (const key in objRecord) {
                if (Object.prototype.hasOwnProperty.call(objRecord, key)) {
                    const sanitizedKey = this.sanitizeString(key);
                    sanitized[sanitizedKey] = this.sanitizeObject(objRecord[key]);
                }
            }
            return sanitized;
        }

        return obj;
    }

    private validateMessage(data: unknown, schemaKey?: string): boolean {
        if (!data || typeof data !== 'object' || data === null) {
            logger.warn('Invalid message: not an object');
            return false;
        }

        const dataObj = data as Record<string, unknown>;

        if (this.isPrototypePollutionAttempt(dataObj)) {
            logger.error('Potential prototype pollution attempt detected');
            return false;
        }

        if (schemaKey && this.messageSchemas.has(schemaKey)) {
            const schema = this.messageSchemas.get(schemaKey);
            if (!schema) {
                return true;
            }

            if (schemaKey === 'board') {
                return this.validateBoardMessage(dataObj);
            }

            if (schema.requiredFields) {
                for (const field of schema.requiredFields) {
                    if (!(field in dataObj)) {
                        logger.warn(`Missing required field: ${field}`);
                        return false;
                    }
                }
            }

            if (schema.allowedTypes && 'updateType' in dataObj) {
                const updateType = dataObj['updateType'] as unknown;
                if (typeof updateType === 'string' && !schema.allowedTypes.includes(updateType)) {
                    logger.warn(`Invalid updateType: ${updateType}`);
                    return false;
                }
            }

            if (schema.maxLength && 'content' in dataObj) {
                const content = dataObj['content'] as unknown;
                if (typeof content === 'string' && content.length > schema.maxLength) {
                    logger.warn(`Content exceeds maximum length of ${schema.maxLength}`);
                    return false;
                }
            }
        }

        return true;
    }

    private validateBoardMessage(dataObj: Record<string, unknown>): boolean {

        if ('type' in dataObj && 'sender' in dataObj) {
            const requiredFields = ['type', 'sender'];
            for (const field of requiredFields) {
                if (!(field in dataObj)) {
                    logger.warn(`BoardActionDTO missing required field: ${field}`);
                    return false;
                }
            }
            
            const actionType = dataObj['type'] as unknown;
            if (typeof actionType === 'string') {
                const validActionTypes = ['OBJECT_ADD', 'OBJECT_UPDATE', 'OBJECT_DELETE'];
                if (!validActionTypes.includes(actionType)) {
                    logger.warn(`Invalid board action type: ${actionType}`);
                    return false;
                }
            }
            
            return true;
        }

        if ('updateType' in dataObj && 'sourceUserEmail' in dataObj) {
            const requiredFields = ['updateType', 'sourceUserEmail'];
            for (const field of requiredFields) {
                if (!(field in dataObj)) {
                    logger.warn(`BoardUpdateDTO missing required field: ${field}`);
                    return false;
                }
            }
            
            const updateType = dataObj['updateType'] as unknown;
            if (typeof updateType === 'string') {
                const validUpdateTypes = ['DETAILS_UPDATED', 'MEMBERS_UPDATED'];
                if (!validUpdateTypes.includes(updateType)) {
                    logger.warn(`Invalid board update type: ${updateType}`);
                    return false;
                }
            }
            
            return true;
        }

        if ('type' in dataObj && 'content' in dataObj && 'timestamp' in dataObj && 'senderEmail' in dataObj) {
            const requiredFields = ['type', 'content', 'timestamp', 'senderEmail'];
            for (const field of requiredFields) {
                if (!(field in dataObj)) {
                    logger.warn(`ChatMessageDTO missing required field: ${field}`);
                    return false;
                }
            }
            
            const messageType = dataObj['type'] as unknown;
            if (typeof messageType === 'string') {
                const validMessageTypes = ['CHAT', 'JOIN', 'LEAVE'];
                if (!validMessageTypes.includes(messageType)) {
                    logger.warn(`Invalid chat message type: ${messageType}`);
                    return false;
                }
            }
            
            return true;
        }

        logger.warn('Board message does not match any known format');
        return false;
    }

    private isPrototypePollutionAttempt(obj: Record<string, unknown>): boolean {
        
        if ('__proto__' in obj) {
            const proto = obj['__proto__'];
            if (proto && typeof proto === 'object' && proto !== Object.prototype) {
                const suspiciousProps = ['constructor', 'valueOf', 'toString', 'hasOwnProperty'];
                for (const prop of suspiciousProps) {
                    if (proto.hasOwnProperty(prop)) {
                        return true;
                    }
                }
            }
        }

        if ('constructor' in obj) {
            const constructor = obj['constructor'];
            if (constructor && typeof constructor === 'object') {
                if ('prototype' in constructor) {
                    return true;
                }
            }
        }

        if ('prototype' in obj) {
            const prototype = obj['prototype'];
            if (prototype && typeof prototype === 'object') {
                return true;
            }
        }

        return false;
    }

    private parseAndValidateMessage<T>(messageBody: string, schemaKey?: string): T | null {
        try {
            if (messageBody.length > this.MAX_MESSAGE_SIZE) {
                logger.error('Message exceeds maximum allowed size');
                return null;
            }

            const parsedData = JSON.parse(messageBody);

            if (!this.validateMessage(parsedData, schemaKey)) {
                return null;
            }

            const sanitizedData = this.sanitizeObject(parsedData);

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

        const sanitizedBody = this.sanitizeObject(body);

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
