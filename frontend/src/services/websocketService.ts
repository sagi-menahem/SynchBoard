// File: frontend/src/services/websocketService.ts

import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AUTH_HEADER_CONFIG, WEBSOCKET_URL } from '../constants/api.constants';

class WebSocketService {
    private stompClient: Client | null = null;

    public connect(token: string, onConnectedCallback: () => void) {
        if (this.stompClient?.active) {
            onConnectedCallback();
            return;
        }
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(WEBSOCKET_URL),
            connectHeaders: { 
                [AUTH_HEADER_CONFIG.HEADER_NAME]: `${AUTH_HEADER_CONFIG.TOKEN_PREFIX}${token}` 
            },
            onConnect: () => {
                console.log('Connected to WebSocket server!');
                onConnectedCallback();
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
    
    public subscribe<T>(topic: string, onMessageReceived: (message: T) => void): StompSubscription | null {
        if (!this.stompClient?.active) {
            console.error('Cannot subscribe, STOMP client is not connected.');
            return null;
        }
        
        const subscription = this.stompClient.subscribe(topic, (message: IMessage) => {
            onMessageReceived(JSON.parse(message.body) as T);
        });
        
        console.log(`Subscribed to ${topic}`);
        return subscription;
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