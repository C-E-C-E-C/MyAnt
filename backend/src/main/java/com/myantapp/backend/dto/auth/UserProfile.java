package com.myantapp.backend.dto.auth;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    private Long id;
    private String username;
    private String email;
    private String phone;
    private String nickname;
    private String avatarUrl;
    private Integer userType;
    private Integer vipLevel;
    private Integer level;
    private Integer status;
    private LocalDateTime lastLoginTime;
    private String lastLoginIp;
}