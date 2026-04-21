package com.myantapp.backend.mapper.content;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.myantapp.backend.entity.content.AppPerson;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AppPersonMapper extends BaseMapper<AppPerson> {
}