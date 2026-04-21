package com.myantapp.backend.Service.system.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.system.SysRoleService;
import com.myantapp.backend.entity.system.SysRole;
import com.myantapp.backend.mapper.system.SysRoleMapper;
import org.springframework.stereotype.Service;

@Service
public class SysRoleServiceImpl extends ServiceImpl<SysRoleMapper, SysRole> implements SysRoleService {
}