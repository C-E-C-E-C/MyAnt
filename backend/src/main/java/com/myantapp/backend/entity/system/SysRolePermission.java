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
@TableName("sys_role_permission")
public class SysRolePermission extends CreateTimeEntity {

    @TableField("role_id")
    @jakarta.validation.constraints.NotNull(message = "角色ID不能为空")
    private Long roleId;

    @TableField("permission_id")
    @jakarta.validation.constraints.NotNull(message = "权限ID不能为空")
    private Long permissionId;
}