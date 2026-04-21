package com.myantapp.backend.entity.content;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myantapp.backend.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@TableName("app_category")
public class AppCategory extends BaseEntity {

    @TableField("parent_id")
    private Long parentId;

    @TableField("category_name")
    @jakarta.validation.constraints.NotBlank(message = "分类名称不能为空")
    private String categoryName;

    @TableField("category_code")
    @jakarta.validation.constraints.NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    @TableField("icon_url")
    private String iconUrl;

    @TableField("cover_url")
    private String coverUrl;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("status")
    private Integer status;

    @TableField("is_recommend")
    private Integer isRecommend;

    @TableField("remark")
    private String remark;
}