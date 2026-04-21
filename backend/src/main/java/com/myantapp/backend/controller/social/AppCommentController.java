package com.myantapp.backend.controller.social;

import com.myantapp.backend.Service.social.AppCommentService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.social.AppComment;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/social/comments")
@RequiredArgsConstructor
public class AppCommentController extends CrudController<AppComment, AppCommentService> {

    private final AppCommentService appCommentService;

    @Override
    protected AppCommentService getService() {
        return appCommentService;
    }
}