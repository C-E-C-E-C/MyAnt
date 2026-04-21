package com.myantapp.backend.entity.system;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myantapp.backend.entity.base.BaseEntity;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends BaseEntity {

    @TableField("username")
    @jakarta.validation.constraints.NotBlank(message = "用户名不能为空")
    private String username;

    @TableField("email")
    private String email;

    @TableField("phone")
    private String phone;

    @TableField("password_hash")
    @jakarta.validation.constraints.NotBlank(message = "密码不能为空")
    private String passwordHash;

    @TableField("nickname")
    @jakarta.validation.constraints.NotBlank(message = "昵称不能为空")
    private String nickname;

    @TableField("avatar_url")
    private String avatarUrl;

    @TableField("signature")
    private String signature;

    @TableField("gender")
    private Integer gender;

    @TableField("user_type")
    private Integer userType;

    @TableField("status")
    private Integer status;

    @TableField("vip_level")
    private Integer vipLevel;

    @TableField("vip_expire_time")
    private LocalDateTime vipExpireTime;

    @TableField("coin_balance")
    private Integer coinBalance;

    @TableField("bcoin_balance")
    private BigDecimal bcoinBalance;

    @TableField("level")
    private Integer level;

    @TableField("last_login_time")
    private LocalDateTime lastLoginTime;

    @TableField("last_login_ip")
    private String lastLoginIp;

    @TableField("remark")
    private String remark;
}