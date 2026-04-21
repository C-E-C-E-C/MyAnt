package com.myantapp.backend.controller.system;

import com.myantapp.backend.Service.system.SysUserService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.system.SysUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system/users")
@RequiredArgsConstructor
public class SysUserController extends CrudController<SysUser, SysUserService> {

    private final SysUserService sysUserService;

    @Override
    protected SysUserService getService() {
        return sysUserService;
    }
}