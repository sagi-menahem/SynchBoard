// File: frontend/src/services/websocketService.ts

import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    private stompClient: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();

    public connect(token: string, onConnectedCallback: () => void) {
        if (this.stompClient?.active) {
            console.log('Already connected to WebSocket.');
            onConnectedCallback();
            return;
        }

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            onConnect: () => {
                console.log('Connected to WebSocket server!');
                onConnectedCallback();
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        this.stompClient.activate();
    }

    public disconnect() {
        this.stompClient?.deactivate();
        console.log('Disconnected from WebSocket.');
    }

    /**
     * Subscribes to a specific topic to receive messages of a generic type T.
     * @param topic The destination topic (e.g., '/topic/board/123').
     * @param onMessageReceived The callback function to handle incoming messages.
     * @template T The expected type of the message payload.
     */
    public subscribe<T>(topic: string, onMessageReceived: (message: T) => void) { // This line is fixed
        if (!this.stompClient?.active) {
            console.error('Cannot subscribe, STOMP client is not connected.');
            return;
        }
        
        if (this.subscriptions.has(topic)) {
            this.subscriptions.get(topic)?.unsubscribe();
        }

        const subscription = this.stompClient.subscribe(topic, (message: IMessage) => {
            // The callback now receives a strongly-typed message
            onMessageReceived(JSON.parse(message.body) as T);
        });
        
        this.subscriptions.set(topic, subscription);
    }

    public sendMessage(destination: string, body: object) {
        if (!this.stompClient?.active) {
            console.error('Cannot send message, STOMP client is not connected.');
            return;
        }
        
        this.stompClient.publish({
            destination: destination,
            body: JSON.stringify(body),
        });
    }
}

const websocketService = new WebSocketService();
export default websocketService;