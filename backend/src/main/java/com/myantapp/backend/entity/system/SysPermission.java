package com.myantapp.backend.entity.system;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myantapp.backend.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@TableName("sys_permission")
public class SysPermission extends BaseEntity {

    @TableField("parent_id")
    private Long parentId;

    @TableField("permission_code")
    @jakarta.validation.constraints.NotBlank(message = "权限编码不能为空")
    private String permissionCode;

    @TableField("permission_name")
    @jakarta.validation.constraints.NotBlank(message = "权限名称不能为空")
    private String permissionName;

    @TableField("perm_type")
    @jakarta.validation.constraints.NotNull(message = "权限类型不能为空")
    private Integer permType;

    @TableField("resource_path")
    private String resourcePath;

    @TableField("status")
    private Integer status;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("remark")
    private String remark;
}