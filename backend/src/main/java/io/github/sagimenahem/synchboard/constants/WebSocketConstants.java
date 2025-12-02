package io.github.sagimenahem.synchboard.constants;

/**
 * WebSocket configuration constants defining endpoints, message routing patterns, and communication
 * parameters for real-time collaboration in SynchBoard. These constants configure STOMP-based
 * WebSocket communication for board updates, chat messaging, and user notifications across the
 * collaborative whiteboard system.
 *
 * @author Sagi Menahem
 */
public final class WebSocketConstants {

    private WebSocketConstants() {}

    // WebSocket Endpoint Configuration

    /**
     * Primary WebSocket endpoint for client connections. All WebSocket handshakes and STOMP
     * communications occur through this endpoint.
     */
    public static final String WEBSOCKET_ENDPOINT = "/ws";

    /**
     * WebSocket endpoint pattern including all sub-paths. Used in Spring Security configuration to
     * allow WebSocket connections.
     */
    public static final String WEBSOCKET_ENDPOINT_WITH_SUBPATHS = "/ws/**";

    // STOMP Message Routing Prefixes

    /**
     * Application destination prefix for client-to-server messages. Clients send messages to
     * destinations prefixed with this value.
     */
    public static final String WEBSOCKET_APP_PREFIX = "/app";

    /**
     * Topic destination prefix for server-to-client broadcasts. Server broadcasts messages to topic
     * destinations with this prefix.
     */
    public static final String WEBSOCKET_TOPIC_PREFIX = "/topic";

    /**
     * Board-specific topic prefix for board-related communications. Used for board updates, canvas
     * changes, and board-scoped notifications. Full pattern: /topic/board/{boardId}
     */
    public static final String WEBSOCKET_BOARD_TOPIC_PREFIX = "/topic/board/";

    /**
     * User-specific topic prefix for personal notifications. Used for user-specific messages like
     * invitations and system notifications. Full pattern: /topic/user/{userId}
     */
    public static final String WEBSOCKET_USER_TOPIC_PREFIX = "/topic/user/";

    // Message Handler Mappings

    /**
     * Message mapping for chat message sending. Clients send chat messages to this destination via
     * the app prefix. Full destination: /app/chat.sendMessage
     */
    public static final String MAPPING_CHAT_SEND_MESSAGE = "/chat.sendMessage";

    /**
     * Message mapping for board drawing actions. Clients send canvas updates and drawing operations
     * to this destination. Full destination: /app/board.drawAction
     */
    public static final String MAPPING_BOARD_DRAW_ACTION = "/board.drawAction";

    // Performance and Size Limits

    /**
     * Maximum WebSocket message size in bytes (1 MB). Prevents oversized messages that could impact
     * server performance. Covers large canvas updates and batch operations.
     */
    public static final int WEBSOCKET_MESSAGE_SIZE_LIMIT = 1024 * 1024;

    /**
     * Maximum WebSocket send buffer size in bytes (1 MB). Controls memory usage for outbound
     * message queuing per connection.
     */
    public static final int WEBSOCKET_SEND_BUFFER_SIZE_LIMIT = 1024 * 1024;

    // Connection Management

    /**
     * WebSocket heartbeat interval in milliseconds (10 seconds). Ensures connection health and
     * detects disconnected clients. Used for both client-to-server and server-to-client heartbeat
     * pings.
     */
    public static final long WEBSOCKET_HEARTBEAT_INTERVAL_MS = 10000;
}
