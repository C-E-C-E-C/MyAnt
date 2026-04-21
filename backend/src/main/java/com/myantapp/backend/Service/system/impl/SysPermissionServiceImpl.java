package com.myantapp.backend.Service.system.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.system.SysPermissionService;
import com.myantapp.backend.entity.system.SysPermission;
import com.myantapp.backend.mapper.system.SysPermissionMapper;
import org.springframework.stereotype.Service;

@Service
public class SysPermissionServiceImpl extends ServiceImpl<SysPermissionMapper, SysPermission> implements SysPermissionService {
}