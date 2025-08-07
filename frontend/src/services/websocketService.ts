import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { AUTH_HEADER_CONFIG, WEBSOCKET_URL } from 'constants/api.constants';

interface MessageValidationSchema {
    requiredFields?: string[];
    allowedTypes?: string[];
    maxLength?: number;
}

class WebSocketService {
    private stompClient: Client | null = null;
    private readonly MAX_MESSAGE_SIZE = 1024 * 100; // 100KB limit
    private readonly messageSchemas = new Map<string, MessageValidationSchema>();

    constructor() {
        this.initializeMessageSchemas();
    }

    private initializeMessageSchemas(): void {
        this.messageSchemas.set('board', {
            requiredFields: ['updateType', 'sourceUserEmail'],
            allowedTypes: ['DETAILS_UPDATED', 'MEMBERS_UPDATED'],
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
            console.warn('Invalid message: not an object');
            return false;
        }

        const dataObj = data as Record<string, unknown>;

        if ('__proto__' in dataObj || 'constructor' in dataObj || 'prototype' in dataObj) {
            console.error('Potential prototype pollution attempt detected');
            return false;
        }

        if (schemaKey && this.messageSchemas.has(schemaKey)) {
            const schema = this.messageSchemas.get(schemaKey);
            if (!schema) {
                return true;
            }

            if (schema.requiredFields) {
                for (const field of schema.requiredFields) {
                    if (!(field in dataObj)) {
                        console.warn(`Missing required field: ${field}`);
                        return false;
                    }
                }
            }

            if (schema.allowedTypes && 'updateType' in dataObj) {
                const updateType = dataObj['updateType'] as unknown;
                if (typeof updateType === 'string' && !schema.allowedTypes.includes(updateType)) {
                    console.warn(`Invalid updateType: ${updateType}`);
                    return false;
                }
            }

            if (schema.maxLength && 'content' in dataObj) {
                const content = dataObj['content'] as unknown;
                if (typeof content === 'string' && content.length > schema.maxLength) {
                    console.warn(`Content exceeds maximum length of ${schema.maxLength}`);
                    return false;
                }
            }
        }

        return true;
    }

    private parseAndValidateMessage<T>(messageBody: string, schemaKey?: string): T | null {
        try {
            if (messageBody.length > this.MAX_MESSAGE_SIZE) {
                console.error('Message exceeds maximum allowed size');
                return null;
            }

            const parsedData = JSON.parse(messageBody);

            if (!this.validateMessage(parsedData, schemaKey)) {
                return null;
            }

            const sanitizedData = this.sanitizeObject(parsedData);

            return sanitizedData as T;
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
            return null;
        }
    }

    public connect(token: string, onConnectedCallback: () => void) {
        if (this.stompClient?.active) {
            console.log('WebSocket already connected.');
            onConnectedCallback();
            return;
        }

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            connectHeaders: {
                [AUTH_HEADER_CONFIG.HEADER_NAME]: `${AUTH_HEADER_CONFIG.TOKEN_PREFIX}${token}`,
            },
            onConnect: () => {
                console.log('Connected to WebSocket server!');
                onConnectedCallback();
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket.');
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
            },
        });
        console.log('Activating STOMP client...');
        this.stompClient.activate();
    }

    public disconnect() {
        if (this.stompClient?.active) {
            this.stompClient.deactivate();
            console.log('Disconnected from WebSocket.');
            this.stompClient = null;
        }
    }

    public subscribe<T>(
        topic: string,
        onMessageReceived: (message: T) => void,
        schemaKey?: string
    ): StompSubscription | null {
        if (!this.stompClient?.active) {
            console.error('Cannot subscribe, STOMP client is not connected.');
            return null;
        }

        const subscription = this.stompClient.subscribe(topic, (message: IMessage) => {
            const validatedMessage = this.parseAndValidateMessage<T>(message.body, schemaKey);
            if (validatedMessage !== null) {
                onMessageReceived(validatedMessage);
            } else {
                console.warn(`Invalid message received on topic ${topic}`);
            }
        });

        console.log(`Subscribed to ${topic}`);
        return subscription;
    }

    public sendMessage(destination: string, body: object) {
        if (!this.stompClient?.active) {
            console.error('Cannot send message, STOMP client is not connected.');
            return;
        }

        const sanitizedBody = this.sanitizeObject(body);

        this.stompClient.publish({
            destination: destination,
            body: JSON.stringify(sanitizedBody),
        });
    }
}

const websocketService = new WebSocketService();
export default websocketService;
