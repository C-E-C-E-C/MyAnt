package com.myantapp.backend.controller;

import com.myantapp.backend.entity.system.SysUser;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/login")
public class SaTokenLogin {
    @PostMapping("/login")
    public void login(@RequestParam String email,@RequestParam String password_hash) {
        // 验证用户名和密码
        // 查询数据库拿到用户的信息,根据email查询


    }
}
