package com.myantapp.backend.controller;

import com.myantapp.backend.Service.WebSocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/websocket")
public class WebSocketController {
    @Autowired
    private WebSocketService webSocketService;

    //发送测试信息给用户
    @GetMapping("/push/{userId}")
    public String pushMessage(@PathVariable String userId){
        webSocketService.sendToUser(userId,"你有一条新的信息");
        return "推送成功";

    }
}
