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
@TableName("app_banner")
public class AppBanner extends BaseEntity {

    @TableField("banner_title")
    @jakarta.validation.constraints.NotBlank(message = "轮播图标题不能为空")
    private String bannerTitle;

    @TableField("image_url")
    @jakarta.validation.constraints.NotBlank(message = "轮播图图片地址不能为空")
    private String imageUrl;

    @TableField("jump_type")
    private Integer jumpType;

    @TableField("jump_target")
    private String jumpTarget;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("status")
    private Integer status;

    @TableField("start_time")
    private LocalDateTime startTime;

    @TableField("end_time")
    private LocalDateTime endTime;

    @TableField("remark")
    private String remark;
}