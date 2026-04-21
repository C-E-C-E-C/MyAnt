package com.myantapp.backend.entity.content;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myantapp.backend.entity.base.CreateTimeEntity;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@TableName("app_media_person_rel")
public class AppMediaPersonRel extends CreateTimeEntity {

    @TableField("media_id")
    @NotNull(message = "内容ID不能为空")
    private Long mediaId;

    @TableField("person_id")
    @NotNull(message = "人物ID不能为空")
    private Long personId;

    @TableField("job_type")
    @NotNull(message = "关联身份不能为空")
    private Integer jobType;

    @TableField("character_name")
    private String characterName;

    @TableField("sort_order")
    private Integer sortOrder;
}