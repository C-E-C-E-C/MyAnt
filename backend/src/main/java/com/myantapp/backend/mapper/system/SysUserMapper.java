package com.myantapp.backend.mapper.system;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.myantapp.backend.entity.system.SysUser;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
}