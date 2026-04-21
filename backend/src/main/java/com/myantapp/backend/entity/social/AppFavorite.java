package com.myantapp.backend.entity.social;

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
@TableName("app_favorite")
public class AppFavorite extends CreateTimeEntity {

    @TableField("user_id")
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @TableField("media_id")
    @NotNull(message = "内容ID不能为空")
    private Long mediaId;
}