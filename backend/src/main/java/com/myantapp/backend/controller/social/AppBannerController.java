package com.myantapp.backend.controller.social;

import com.myantapp.backend.Service.social.AppBannerService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.social.AppBanner;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home/banners")
@RequiredArgsConstructor
public class AppBannerController extends CrudController<AppBanner, AppBannerService> {

    private final AppBannerService appBannerService;

    @Override
    protected AppBannerService getService() {
        return appBannerService;
    }
}