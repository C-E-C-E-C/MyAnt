package com.myantapp.backend.entity.social;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myantapp.backend.entity.base.BaseEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@TableName("app_comment")
public class AppComment extends BaseEntity {

    @TableField("media_id")
    @NotNull(message = "内容ID不能为空")
    private Long mediaId;

    @TableField("user_id")
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @TableField("parent_id")
    private Long parentId;

    @TableField("content")
    @NotBlank(message = "评论内容不能为空")
    private String content;

    @TableField("like_count")
    private Integer likeCount;

    @TableField("reply_count")
    private Integer replyCount;

    @TableField("status")
    private Integer status;
}