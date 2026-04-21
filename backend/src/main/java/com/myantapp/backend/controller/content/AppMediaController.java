package com.myantapp.backend.controller.content;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.myantapp.backend.common.ApiResponse;
import com.myantapp.backend.exception.BusinessException;
import com.myantapp.backend.Service.content.AppMediaService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.content.AppMedia;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/content/media")
@RequiredArgsConstructor
public class AppMediaController extends CrudController<AppMedia, AppMediaService> {

    private final AppMediaService appMediaService;

    @Override
    protected AppMediaService getService() {
        return appMediaService;
    }

    @PostMapping("/{id}/view")
    public ApiResponse<Long> incrementViewCount(@PathVariable Long id) {
        boolean updated = appMediaService.update(
                Wrappers.<AppMedia>lambdaUpdate()
                        .eq(AppMedia::getId, id)
                        .setSql("view_count = ifnull(view_count, 0) + 1"));

        if (!updated) {
            throw new BusinessException("内容不存在");
        }

        AppMedia media = appMediaService.getById(id);
        return ApiResponse.success(media == null ? 0L : media.getViewCount());
    }
}