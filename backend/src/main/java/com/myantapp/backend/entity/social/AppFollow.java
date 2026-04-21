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
@TableName("app_follow")
public class AppFollow extends CreateTimeEntity {

    @TableField("follower_user_id")
    @NotNull(message = "关注者用户ID不能为空")
    private Long followerUserId;

    @TableField("followee_user_id")
    @NotNull(message = "被关注者用户ID不能为空")
    private Long followeeUserId;
}