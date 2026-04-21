package com.myantapp.backend.entity.base;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class CreateTimeEntity {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("create_time")
    private LocalDateTime createTime;
}