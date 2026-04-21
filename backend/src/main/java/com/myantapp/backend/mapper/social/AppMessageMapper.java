package com.myantapp.backend.mapper.social;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.myantapp.backend.entity.social.AppMessage;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AppMessageMapper extends BaseMapper<AppMessage> {
}