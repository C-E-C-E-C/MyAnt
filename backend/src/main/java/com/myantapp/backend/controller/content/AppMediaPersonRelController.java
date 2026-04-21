package com.myantapp.backend.controller.content;

import com.myantapp.backend.Service.content.AppMediaPersonRelService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.content.AppMediaPersonRel;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/content/media-person-relations")
@RequiredArgsConstructor
public class AppMediaPersonRelController extends CrudController<AppMediaPersonRel, AppMediaPersonRelService> {

    private final AppMediaPersonRelService appMediaPersonRelService;

    @Override
    protected AppMediaPersonRelService getService() {
        return appMediaPersonRelService;
    }
}