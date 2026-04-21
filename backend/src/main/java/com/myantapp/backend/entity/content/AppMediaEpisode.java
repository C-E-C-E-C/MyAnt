package com.myantapp.backend.entity.content;

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
@TableName("app_media_episode")
public class AppMediaEpisode extends BaseEntity {

    @TableField("media_id")
    @NotNull(message = "内容ID不能为空")
    private Long mediaId;

    @TableField("episode_no")
    @NotNull(message = "集数编号不能为空")
    private Integer episodeNo;

    @TableField("episode_title")
    @NotBlank(message = "分集标题不能为空")
    private String episodeTitle;

    @TableField("play_url")
    @NotBlank(message = "播放地址不能为空")
    private String playUrl;

    @TableField("duration_seconds")
    private Integer durationSeconds;

    @TableField("is_free")
    private Integer isFree;

    @TableField("status")
    private Integer status;

    @TableField("sort_order")
    private Integer sortOrder;
}