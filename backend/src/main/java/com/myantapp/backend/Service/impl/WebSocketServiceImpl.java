package com.myantapp.backend.Service.impl;

import com.myantapp.backend.Service.WebSocketService;
import jakarta.websocket.Session;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
@Service
public class WebSocketServiceImpl implements WebSocketService {
    private static final Map<String,Session> sessionMap = new ConcurrentHashMap<>();
    @Override
    public void onOpen(String userid, Session session) {
        sessionMap.put(userid, session);
        System.out.println("用户连接:"+userid);
    }

    @Override
    public void onMessage(String message, String userid) {
        System.out.println("收到用户["+userid+"]的消息:"+message);
    }

    @Override
    public void onClose(String userId) {
        sessionMap.remove(userId);
        System.out.println("用户["+userId+"]断开连接");
    }

    @Override
    public void onError(Throwable throwable) {
        System.out.println("发生错误:"+throwable.getMessage());
    }

    @Override
    public void sendToUser(String toUserId, String message) {
        Session session = sessionMap.get(toUserId);
        if(session!=null && session.isOpen()){
            try{
                session.getBasicRemote().sendText(message);
            }catch(IOException e){
                e.printStackTrace();
            }
        }
    }
}
