package com.myantapp.backend.controller.system;

import com.myantapp.backend.Service.system.SysRolePermissionService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.system.SysRolePermission;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system/role-permissions")
@RequiredArgsConstructor
public class SysRolePermissionController extends CrudController<SysRolePermission, SysRolePermissionService> {

    private final SysRolePermissionService sysRolePermissionService;

    @Override
    protected SysRolePermissionService getService() {
        return sysRolePermissionService;
    }
}