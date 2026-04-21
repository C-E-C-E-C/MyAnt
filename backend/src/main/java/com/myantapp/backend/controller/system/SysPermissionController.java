package com.myantapp.backend.controller.system;

import com.myantapp.backend.Service.system.SysPermissionService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.system.SysPermission;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system/permissions")
@RequiredArgsConstructor
public class SysPermissionController extends CrudController<SysPermission, SysPermissionService> {

    private final SysPermissionService sysPermissionService;

    @Override
    protected SysPermissionService getService() {
        return sysPermissionService;
    }
}