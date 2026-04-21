package com.myantapp.backend.controller.system;

import com.myantapp.backend.Service.system.SysRoleService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.system.SysRole;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system/roles")
@RequiredArgsConstructor
public class SysRoleController extends CrudController<SysRole, SysRoleService> {

    private final SysRoleService sysRoleService;

    @Override
    protected SysRoleService getService() {
        return sysRoleService;
    }
}