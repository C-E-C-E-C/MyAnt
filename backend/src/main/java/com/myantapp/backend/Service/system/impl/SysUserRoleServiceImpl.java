package com.myantapp.backend.Service.system.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.system.SysUserRoleService;
import com.myantapp.backend.entity.system.SysUserRole;
import com.myantapp.backend.mapper.system.SysUserRoleMapper;
import org.springframework.stereotype.Service;

@Service
public class SysUserRoleServiceImpl extends ServiceImpl<SysUserRoleMapper, SysUserRole> implements SysUserRoleService {
}