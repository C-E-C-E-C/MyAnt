package com.myantapp.backend.controller.social;

import com.myantapp.backend.Service.social.AppFollowService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.social.AppFollow;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/social/follows")
@RequiredArgsConstructor
public class AppFollowController extends CrudController<AppFollow, AppFollowService> {

    private final AppFollowService appFollowService;

    @Override
    protected AppFollowService getService() {
        return appFollowService;
    }
}