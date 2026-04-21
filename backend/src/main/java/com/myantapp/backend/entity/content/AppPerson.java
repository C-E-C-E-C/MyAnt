package com.myantapp.backend.entity.content;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myantapp.backend.entity.base.BaseEntity;
import java.time.LocalDate;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@TableName("app_person")
public class AppPerson extends BaseEntity {

    @TableField("person_name")
    @jakarta.validation.constraints.NotBlank(message = "人员名称不能为空")
    private String personName;

    @TableField("person_type")
    private Integer personType;

    @TableField("avatar_url")
    private String avatarUrl;

    @TableField("gender")
    private Integer gender;

    @TableField("birthday")
    private LocalDate birthday;

    @TableField("origin_place")
    private String originPlace;

    @TableField("bio")
    private String bio;

    @TableField("status")
    private Integer status;
}