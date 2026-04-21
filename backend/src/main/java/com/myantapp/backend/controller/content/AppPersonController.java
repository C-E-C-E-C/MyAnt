package com.myantapp.backend.controller.content;

import com.myantapp.backend.Service.content.AppPersonService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.content.AppPerson;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/content/persons")
@RequiredArgsConstructor
public class AppPersonController extends CrudController<AppPerson, AppPersonService> {

    private final AppPersonService appPersonService;

    @Override
    protected AppPersonService getService() {
        return appPersonService;
    }
}