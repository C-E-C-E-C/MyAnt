package com.myantapp.backend.mapper.social;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.myantapp.backend.entity.social.AppComment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AppCommentMapper extends BaseMapper<AppComment> {
}