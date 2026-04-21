package com.myantapp.backend.controller.social;

import com.myantapp.backend.Service.social.AppMessageService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.social.AppMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/social/messages")
@RequiredArgsConstructor
public class AppMessageController extends CrudController<AppMessage, AppMessageService> {

    private final AppMessageService appMessageService;

    @Override
    protected AppMessageService getService() {
        return appMessageService;
    }
}