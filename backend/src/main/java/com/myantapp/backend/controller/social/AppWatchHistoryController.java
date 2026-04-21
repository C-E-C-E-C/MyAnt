package com.myantapp.backend.controller.social;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.myantapp.backend.common.ApiResponse;
import com.myantapp.backend.exception.BusinessException;
import com.myantapp.backend.Service.social.AppWatchHistoryService;
import com.myantapp.backend.Service.system.SysUserService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.social.AppWatchHistory;
import com.myantapp.backend.entity.system.SysUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/social/watch-histories")
@RequiredArgsConstructor
public class AppWatchHistoryController extends CrudController<AppWatchHistory, AppWatchHistoryService> {

    private final AppWatchHistoryService appWatchHistoryService;
    private final SysUserService sysUserService;

    @Override
    protected AppWatchHistoryService getService() {
        return appWatchHistoryService;
    }

        @GetMapping("/me")
        public ApiResponse<List<AppWatchHistory>> myWatchHistory() {
        return ApiResponse.success(appWatchHistoryService.list(
            Wrappers.<AppWatchHistory>lambdaQuery()
                .eq(AppWatchHistory::getUserId, getCurrentUserId())
                .orderByDesc(AppWatchHistory::getLastWatchTime)));
        }

        @GetMapping("/status/{mediaId}")
        public ApiResponse<AppWatchHistory> watchHistoryStatus(@PathVariable Long mediaId) {
        AppWatchHistory watchHistory = appWatchHistoryService.getOne(
            Wrappers.<AppWatchHistory>lambdaQuery()
                .eq(AppWatchHistory::getUserId, getCurrentUserId())
                .eq(AppWatchHistory::getMediaId, mediaId),
            false);
        return ApiResponse.success(watchHistory);
        }

        @PostMapping("/track")
        public ApiResponse<AppWatchHistory> track(@Valid @RequestBody WatchHistoryTrackRequest request) {
        long userId = getCurrentUserId();
        LocalDateTime now = LocalDateTime.now();
        AppWatchHistory watchHistory = appWatchHistoryService.getOne(
            Wrappers.<AppWatchHistory>lambdaQuery()
                .eq(AppWatchHistory::getUserId, userId)
                .eq(AppWatchHistory::getMediaId, request.mediaId()),
            false);

        if (watchHistory == null) {
            watchHistory = new AppWatchHistory()
                .setUserId(userId)
                .setMediaId(request.mediaId());
        }

        watchHistory
            .setEpisodeId(request.episodeId())
            .setProgressSeconds(Math.max(0, request.progressSeconds()))
            .setTotalSeconds(Math.max(0, request.totalSeconds()))
            .setIsFinished(request.isFinished() != null ? (request.isFinished() ? 1 : 0) : null)
            .setLastWatchTime(now);

        appWatchHistoryService.saveOrUpdate(watchHistory);
        return ApiResponse.success(watchHistory);
        }

        @DeleteMapping("/me/{mediaId}")
        public ApiResponse<Void> removeMyHistory(@PathVariable Long mediaId) {
        appWatchHistoryService.remove(
            Wrappers.<AppWatchHistory>lambdaQuery()
                .eq(AppWatchHistory::getUserId, getCurrentUserId())
                .eq(AppWatchHistory::getMediaId, mediaId));
        return ApiResponse.success(null);
        }

        private long getCurrentUserId() {
        if (!StpUtil.isLogin()) {
            throw new BusinessException("请先登录");
        }

            Object loginId = StpUtil.getLoginId();
            if (loginId == null) {
                throw new BusinessException("登录状态已失效，请重新登录");
            }

            try {
                long userId = Long.parseLong(String.valueOf(loginId));
                ensureUserExists(userId);
                return userId;
            } catch (NumberFormatException exception) {
                throw new BusinessException("登录状态已失效，请重新登录");
            }
        }

        private void ensureUserExists(long userId) {
            SysUser user = sysUserService.getById(userId);
            if (user == null) {
                throw new BusinessException("登录用户不存在，请重新登录");
            }
        }

        public record WatchHistoryTrackRequest(
            @NotNull(message = "内容ID不能为空") Long mediaId,
            Long episodeId,
            @Min(value = 0, message = "播放进度不能小于0") Integer progressSeconds,
            @Min(value = 0, message = "总时长不能小于0") Integer totalSeconds,
            Boolean isFinished) {
        }
}