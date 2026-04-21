package com.myantapp.backend.controller.system;

import com.myantapp.backend.Service.system.SysUserRoleService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.system.SysUserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system/user-roles")
@RequiredArgsConstructor
public class SysUserRoleController extends CrudController<SysUserRole, SysUserRoleService> {

    private final SysUserRoleService sysUserRoleService;

    @Override
    protected SysUserRoleService getService() {
        return sysUserRoleService;
    }
}