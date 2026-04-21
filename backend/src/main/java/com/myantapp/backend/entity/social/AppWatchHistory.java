package com.myantapp.backend.entity.social;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myantapp.backend.entity.base.BaseEntity;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@TableName("app_watch_history")
public class AppWatchHistory extends BaseEntity {

    @TableField("user_id")
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @TableField("media_id")
    @NotNull(message = "内容ID不能为空")
    private Long mediaId;

    @TableField("episode_id")
    private Long episodeId;

    @TableField("progress_seconds")
    private Integer progressSeconds;

    @TableField("total_seconds")
    private Integer totalSeconds;

    @TableField("is_finished")
    private Integer isFinished;

    @TableField("last_watch_time")
    private LocalDateTime lastWatchTime;
}