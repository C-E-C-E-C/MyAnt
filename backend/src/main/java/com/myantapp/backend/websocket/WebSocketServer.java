package com.myantapp.backend.websocket; // 包名根据你的实际情况改


import com.myantapp.backend.Service.WebSocketService;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@ServerEndpoint("/ws/{userId}") // 前端连接的地址
public class WebSocketServer {

    // 注入你写的 Service 层
    private static WebSocketService webSocketService;

    // 关键：Spring 会自动把下面的 impl 注入进来
    @Autowired
    public void setWebSocketService(WebSocketService webSocketService) {
        WebSocketServer.webSocketService = webSocketService;
    }

    // 1. 有人连接时
    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userId) {
        // 直接调用 Service 里的逻辑
        webSocketService.onOpen(userId, session);
    }

    // 2. 收到消息时
    @OnMessage
    public void onMessage(String message, @PathParam("userId") String userId) {
        webSocketService.onMessage(message, userId);
    }

    // 3. 有人断开时
    @OnClose
    public void onClose(@PathParam("userId") String userId) {
        webSocketService.onClose(userId);
    }

    // 4. 报错时
    @OnError
    public void onError(Throwable error) {
        webSocketService.onError(error);
    }
}