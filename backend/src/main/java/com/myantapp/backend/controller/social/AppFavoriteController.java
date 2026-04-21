package com.myantapp.backend.controller.social;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.myantapp.backend.common.ApiResponse;
import com.myantapp.backend.Service.content.AppMediaService;
import com.myantapp.backend.exception.BusinessException;
import com.myantapp.backend.Service.social.AppFavoriteService;
import com.myantapp.backend.Service.system.SysUserService;
import com.myantapp.backend.controller.base.CrudController;
import com.myantapp.backend.entity.content.AppMedia;
import com.myantapp.backend.entity.social.AppFavorite;
import com.myantapp.backend.entity.system.SysUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/social/favorites")
@RequiredArgsConstructor
@Slf4j
public class AppFavoriteController extends CrudController<AppFavorite, AppFavoriteService> {

    private final AppFavoriteService appFavoriteService;
    private final AppMediaService appMediaService;
    private final SysUserService sysUserService;

    @Override
    protected AppFavoriteService getService() {
        return appFavoriteService;
    }

    @GetMapping("/me")
    public ApiResponse<List<AppFavorite>> myFavorites() {
        long userId = getCurrentUserId();
        log.info("[favorite][list] userId={}", userId);
        List<AppFavorite> favorites = appFavoriteService.list(
                Wrappers.<AppFavorite>lambdaQuery()
                        .eq(AppFavorite::getUserId, userId)
                        .orderByDesc(AppFavorite::getCreateTime));
        log.info("[favorite][list] userId={} count={}", userId, favorites.size());
        return ApiResponse.success(favorites);
    }

    @GetMapping("/status/{mediaId}")
    public ApiResponse<Boolean> favoriteStatus(@PathVariable Long mediaId) {
        long userId = getCurrentUserId();
        log.info("[favorite][status] userId={} mediaId={}", userId, mediaId);
        boolean exists = appFavoriteService.count(
                Wrappers.<AppFavorite>lambdaQuery()
                        .eq(AppFavorite::getUserId, userId)
                        .eq(AppFavorite::getMediaId, mediaId)) > 0;
        log.info("[favorite][status] userId={} mediaId={} exists={}", userId, mediaId, exists);
        return ApiResponse.success(exists);
    }

    @PostMapping("/toggle")
    public ApiResponse<Boolean> toggleFavorite(@Valid @RequestBody FavoriteToggleRequest request) {
        long userId = getCurrentUserId();
        log.info("[favorite][toggle] start userId={} mediaId={}", userId, request.mediaId());
        ensureMediaExists(request.mediaId());
        AppFavorite existing = appFavoriteService.getOne(
                Wrappers.<AppFavorite>lambdaQuery()
                        .eq(AppFavorite::getUserId, userId)
                        .eq(AppFavorite::getMediaId, request.mediaId()),
                false);
        log.info("[favorite][toggle] existing userId={} mediaId={} found={}", userId, request.mediaId(), existing != null);

        if (existing != null) {
            boolean removed = appFavoriteService.remove(
                    Wrappers.<AppFavorite>lambdaQuery()
                            .eq(AppFavorite::getUserId, userId)
                            .eq(AppFavorite::getMediaId, request.mediaId()));
            log.info("[favorite][toggle] removed userId={} mediaId={} result={}", userId, request.mediaId(), removed);
            return ApiResponse.success(false);
        }

        AppFavorite favorite = new AppFavorite()
                .setUserId(userId)
                .setMediaId(request.mediaId());

        try {
            log.info("[favorite][toggle] saving userId={} mediaId={}", userId, request.mediaId());
            appFavoriteService.save(favorite);
            log.info("[favorite][toggle] saved userId={} mediaId={} favoriteId={}", userId, request.mediaId(), favorite.getId());
        } catch (DuplicateKeyException exception) {
            log.info("[favorite][toggle] duplicate key userId={} mediaId={} message={}", userId, request.mediaId(), exception.getMessage());
            boolean exists = appFavoriteService.count(
                    Wrappers.<AppFavorite>lambdaQuery()
                            .eq(AppFavorite::getUserId, userId)
                            .eq(AppFavorite::getMediaId, request.mediaId())) > 0;
            log.info("[favorite][toggle] duplicate fallback userId={} mediaId={} exists={}", userId, request.mediaId(), exists);
            return ApiResponse.success(exists);
        }

        log.info("[favorite][toggle] success userId={} mediaId={} result=true", userId, request.mediaId());
        return ApiResponse.success(true);
    }

    @DeleteMapping("/me/{mediaId}")
    public ApiResponse<Void> removeMyFavorite(@PathVariable Long mediaId) {
        long userId = getCurrentUserId();
        log.info("[favorite][remove] start userId={} mediaId={}", userId, mediaId);
        boolean removed = appFavoriteService.remove(
                Wrappers.<AppFavorite>lambdaQuery()
                        .eq(AppFavorite::getUserId, userId)
                        .eq(AppFavorite::getMediaId, mediaId));
        log.info("[favorite][remove] done userId={} mediaId={} result={}", userId, mediaId, removed);
        return ApiResponse.success(null);
    }

    private long getCurrentUserId() {
        if (!StpUtil.isLogin()) {
            log.info("[favorite][auth] not login");
            throw new BusinessException("请先登录");
        }

        Object loginId = StpUtil.getLoginId();
        if (loginId == null) {
            log.info("[favorite][auth] loginId is null");
            throw new BusinessException("登录状态已失效，请重新登录");
        }

        try {
            long userId = Long.parseLong(String.valueOf(loginId));
            log.info("[favorite][auth] loginId={} parsedUserId={}", loginId, userId);
            ensureUserExists(userId);
            return userId;
        } catch (NumberFormatException exception) {
            log.info("[favorite][auth] loginId parse failed loginId={} message={}", loginId, exception.getMessage());
            throw new BusinessException("登录状态已失效，请重新登录");
        }
    }

    private void ensureUserExists(long userId) {
        SysUser user = sysUserService.getById(userId);
        if (user == null) {
            log.info("[favorite][auth] user not found userId={}", userId);
            throw new BusinessException("登录用户不存在，请重新登录");
        }
        log.info("[favorite][auth] user exists userId={} username={}", userId, user.getUsername());
    }

    private void ensureMediaExists(Long mediaId) {
        if (mediaId == null) {
            log.info("[favorite][media] mediaId is null");
            throw new BusinessException("内容ID不能为空");
        }

        AppMedia media = appMediaService.getById(mediaId);
        if (media == null) {
            log.info("[favorite][media] media not found mediaId={}", mediaId);
            throw new BusinessException("内容不存在或已下架");
        }
        log.info("[favorite][media] media exists mediaId={} title={}", mediaId, media.getTitle());
    }

    public record FavoriteToggleRequest(
            @NotNull(message = "内容ID不能为空")
            Long mediaId) {
    }
}