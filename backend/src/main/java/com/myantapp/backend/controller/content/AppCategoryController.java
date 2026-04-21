package com.myantapp.backend.controller.content;

import com.myantapp.backend.Service.content.AppCategoryService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.content.AppCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/content/categories")
@RequiredArgsConstructor
public class AppCategoryController extends CrudController<AppCategory, AppCategoryService> {

    private final AppCategoryService appCategoryService;

    @Override
    protected AppCategoryService getService() {
        return appCategoryService;
    }
}