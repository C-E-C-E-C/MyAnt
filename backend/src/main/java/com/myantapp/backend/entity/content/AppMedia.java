package com.myantapp.backend.entity.content;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myantapp.backend.entity.base.BaseEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@TableName("app_media")
public class AppMedia extends BaseEntity {

    @TableField("category_id")
    private Long categoryId;

    @TableField("media_code")
    @jakarta.validation.constraints.NotBlank(message = "内容编码不能为空")
    private String mediaCode;

    @TableField("title")
    @jakarta.validation.constraints.NotBlank(message = "内容标题不能为空")
    private String title;

    @TableField("subtitle")
    private String subtitle;

    @TableField("cover_url")
    private String coverUrl;

    @TableField("poster_url")
    private String posterUrl;

    @TableField("content_type")
    private Integer contentType;

    @TableField("region")
    private String region;

    @TableField("director")
    private String director;

    @TableField("brief_intro")
    private String briefIntro;

    @TableField("detail_intro")
    @jakarta.validation.constraints.NotBlank(message = "详细介绍不能为空")
    private String detailIntro;

    @TableField("tags")
    private String tags;

    @TableField("release_date")
    private LocalDate releaseDate;

    @TableField("total_episodes")
    private Integer totalEpisodes;

    @TableField("latest_episode_no")
    private Integer latestEpisodeNo;

    @TableField("duration_seconds")
    private Integer durationSeconds;

    @TableField("score")
    private BigDecimal score;

    @TableField("score_count")
    private Integer scoreCount;

    @TableField("view_count")
    private Long viewCount;

    @TableField("favorite_count")
    private Long favoriteCount;

    @TableField("comment_count")
    private Long commentCount;

    @TableField("is_hot")
    private Integer isHot;

    @TableField("is_recommend")
    private Integer isRecommend;

    @TableField("status")
    private Integer status;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("created_by")
    private Long createdBy;

    @TableField("updated_by")
    private Long updatedBy;
}