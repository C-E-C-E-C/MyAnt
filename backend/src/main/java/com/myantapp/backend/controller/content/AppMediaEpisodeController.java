package com.myantapp.backend.controller.content;

import com.myantapp.backend.Service.content.AppMediaEpisodeService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.content.AppMediaEpisode;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/content/episodes")
@RequiredArgsConstructor
public class AppMediaEpisodeController extends CrudController<AppMediaEpisode, AppMediaEpisodeService> {

    private final AppMediaEpisodeService appMediaEpisodeService;

    @Override
    protected AppMediaEpisodeService getService() {
        return appMediaEpisodeService;
    }
}