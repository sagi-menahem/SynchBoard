// File: backend/src/main/java/com/synchboard/backend/config/constants/WebSocketConstants.java
package com.synchboard.backend.config.constants;

public final class WebSocketConstants {

    private WebSocketConstants() {}

    public static final String WEBSOCKET_ENDPOINT = "/ws";
    public static final String WEBSOCKET_ENDPOINT_WITH_SUBPATHS = "/ws/**";
    public static final String WEBSOCKET_APP_PREFIX = "/app";
    public static final String WEBSOCKET_TOPIC_PREFIX = "/topic";
    public static final String WEBSOCKET_BOARD_TOPIC_PREFIX = "/topic/board/";
    public static final String WEBSOCKET_USER_TOPIC_PREFIX = "/topic/user/";

    public static final String MAPPING_CHAT_SEND_MESSAGE = "/chat.sendMessage";
    public static final String MAPPING_BOARD_DRAW_ACTION = "/board.drawAction";

    public static final int WEBSOCKET_MESSAGE_SIZE_LIMIT = 512 * 1024;
    public static final int WEBSOCKET_SEND_BUFFER_SIZE_LIMIT = 512 * 1024;
}
