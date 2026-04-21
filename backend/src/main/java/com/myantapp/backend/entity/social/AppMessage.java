package com.myantapp.backend.entity.social;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myantapp.backend.entity.base.BaseEntity;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@TableName("app_message")
public class AppMessage extends BaseEntity {

    @TableField("sender_user_id")
    private Long senderUserId;

    @TableField("receiver_user_id")
    @jakarta.validation.constraints.NotNull(message = "接收者用户ID不能为空")
    private Long receiverUserId;

    @TableField("message_type")
    private Integer messageType;

    @TableField("title")
    @jakarta.validation.constraints.NotBlank(message = "消息标题不能为空")
    private String title;

    @TableField("content")
    @jakarta.validation.constraints.NotBlank(message = "消息内容不能为空")
    private String content;

    @TableField("related_type")
    private String relatedType;

    @TableField("related_id")
    private Long relatedId;

    @TableField("is_read")
    private Integer isRead;

    @TableField("read_time")
    private LocalDateTime readTime;

    @TableField("send_time")
    private LocalDateTime sendTime;
}