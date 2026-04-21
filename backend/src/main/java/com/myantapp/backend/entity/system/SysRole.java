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
@TableName("sys_role")
public class SysRole extends BaseEntity {

    @TableField("role_code")
    @jakarta.validation.constraints.NotBlank(message = "角色编码不能为空")
    private String roleCode;

    @TableField("role_name")
    @jakarta.validation.constraints.NotBlank(message = "角色名称不能为空")
    private String roleName;

    @TableField("status")
    private Integer status;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("remark")
    private String remark;
}