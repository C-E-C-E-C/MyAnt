package com.myantapp.backend.Service;

import jakarta.websocket.Session;

public interface WebSocketService {
    //建立连接
    void onOpen(String userid, Session sessione);
    //发送信息
    void onMessage(String message,String userid);
    //关闭连接
    void onClose(String userId);
    //异常
    void onError(Throwable throwable);
    // 推送消息给用户
    void sendToUser(String toUserId,String message);
}
