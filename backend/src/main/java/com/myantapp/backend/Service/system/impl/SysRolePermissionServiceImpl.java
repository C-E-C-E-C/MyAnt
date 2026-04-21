package com.myantapp.backend.Service.system.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.system.SysRolePermissionService;
import com.myantapp.backend.entity.system.SysRolePermission;
import com.myantapp.backend.mapper.system.SysRolePermissionMapper;
import org.springframework.stereotype.Service;

@Service
public class SysRolePermissionServiceImpl extends ServiceImpl<SysRolePermissionMapper, SysRolePermission> implements SysRolePermissionService {
}