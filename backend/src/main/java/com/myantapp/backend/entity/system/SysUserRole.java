package com.myantapp.backend.entity.system;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myantapp.backend.entity.base.CreateTimeEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user_role")
public class SysUserRole extends CreateTimeEntity {

    @TableField("user_id")
    @jakarta.validation.constraints.NotNull(message = "用户ID不能为空")
    private Long userId;

    @TableField("role_id")
    @jakarta.validation.constraints.NotNull(message = "角色ID不能为空")
    private Long roleId;
}