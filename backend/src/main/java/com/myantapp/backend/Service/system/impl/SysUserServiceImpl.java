package com.myantapp.backend.Service.system.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.system.SysUserService;
import com.myantapp.backend.entity.system.SysUser;
import com.myantapp.backend.mapper.system.SysUserMapper;
import org.springframework.stereotype.Service;

@Service
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {
}