package com.myantapp.backend.Service.auth.impl;

import cn.dev33.satoken.SaManager;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.myantapp.backend.Service.auth.AuthService;
import com.myantapp.backend.Service.captcha.CaptchaService;
import com.myantapp.backend.Service.system.SysUserService;
import com.myantapp.backend.dto.auth.CaptchaResponse;
import com.myantapp.backend.dto.auth.ForgotPasswordRequest;
import com.myantapp.backend.dto.auth.LoginRequest;
import com.myantapp.backend.dto.auth.LoginResponse;
import com.myantapp.backend.dto.auth.RegisterRequest;
import com.myantapp.backend.dto.auth.UserProfile;
import com.myantapp.backend.entity.system.SysUser;
import com.myantapp.backend.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final CaptchaService captchaService;
    private final SysUserService sysUserService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public CaptchaResponse createCaptcha() {
        return captchaService.createCaptcha();
    }

    @Override
    public LoginResponse login(LoginRequest request, HttpServletRequest httpServletRequest) {
        captchaService.verifyCaptcha(request.getCaptchaId(), request.getCaptchaCode());
        SysUser user = findUserByAccount(request.getAccount());
        if (user == null) {
            throw new BusinessException("账号或密码错误");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("账号或密码错误");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }
        updateLoginInfo(user, httpServletRequest);
        StpUtil.login(user.getId());
        return buildLoginResponse(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginResponse register(RegisterRequest request, HttpServletRequest httpServletRequest) {
        captchaService.verifyCaptcha(request.getCaptchaId(), request.getCaptchaCode());
        ensureUserNotExists(request.getUsername(), "用户名已存在");
        ensureUserNotExists(request.getEmail(), "邮箱已存在");
        if (StringUtils.isNotBlank(request.getPhone())) {
            ensureUserNotExists(request.getPhone(), "手机号已存在");
        }

        SysUser user = new SysUser()
                .setUsername(request.getUsername())
                .setEmail(request.getEmail())
                .setPhone(StringUtils.isBlank(request.getPhone()) ? null : request.getPhone())
                .setPasswordHash(passwordEncoder.encode(request.getPassword()))
                .setNickname(StringUtils.isBlank(request.getNickname()) ? request.getUsername() : request.getNickname())
                .setAvatarUrl(null)
                .setSignature(null)
                .setGender(0)
                .setUserType(1)
                .setStatus(1)
                .setVipLevel(0)
                .setVipExpireTime(null)
                .setCoinBalance(0)
                .setBcoinBalance(BigDecimal.ZERO)
                .setLevel(1)
                .setLastLoginTime(LocalDateTime.now())
                .setLastLoginIp(getClientIp(httpServletRequest));
        sysUserService.save(user);
        StpUtil.login(user.getId());
        return buildLoginResponse(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void forgotPassword(ForgotPasswordRequest request, HttpServletRequest httpServletRequest) {
        captchaService.verifyCaptcha(request.getCaptchaId(), request.getCaptchaCode());
        SysUser user = findUserByAccount(request.getAccount());
        if (user == null) {
            throw new BusinessException("账号不存在");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setLastLoginTime(LocalDateTime.now());
        user.setLastLoginIp(getClientIp(httpServletRequest));
        sysUserService.updateById(user);
    }

    @Override
    public UserProfile currentUser() {
        if (!StpUtil.isLogin()) {
            throw new BusinessException(401, "未登录");
        }
        long userId = Long.parseLong(String.valueOf(StpUtil.getLoginId()));
        SysUser user = sysUserService.getById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return new UserProfile(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getNickname(),
                user.getAvatarUrl(),
                user.getUserType(),
                user.getVipLevel(),
                user.getLevel(),
                user.getStatus(),
                user.getLastLoginTime(),
                user.getLastLoginIp());
    }

    @Override
    public void logout() {
        StpUtil.logout();
    }

    private SysUser findUserByAccount(String account) {
        if (StringUtils.isBlank(account)) {
            throw new BusinessException("账号不能为空");
        }
        return sysUserService.lambdaQuery()
                .eq(SysUser::getUsername, account)
                .or()
                .eq(SysUser::getEmail, account)
                .or()
                .eq(SysUser::getPhone, account)
                .one();
    }

    private void ensureUserNotExists(String value, String message) {
        if (StringUtils.isBlank(value)) {
            return;
        }
        boolean exists = sysUserService.lambdaQuery()
                .eq(SysUser::getUsername, value)
                .or()
                .eq(SysUser::getEmail, value)
                .or()
                .eq(SysUser::getPhone, value)
                .exists();
        if (exists) {
            throw new BusinessException(message);
        }
    }

    private void updateLoginInfo(SysUser user, HttpServletRequest httpServletRequest) {
        user.setLastLoginTime(LocalDateTime.now());
        user.setLastLoginIp(getClientIp(httpServletRequest));
        sysUserService.updateById(user);
    }

    private LoginResponse buildLoginResponse(SysUser user) {
        UserProfile profile = new UserProfile(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getNickname(),
                user.getAvatarUrl(),
                user.getUserType(),
                user.getVipLevel(),
                user.getLevel(),
                user.getStatus(),
                user.getLastLoginTime(),
                user.getLastLoginIp());
        return new LoginResponse(SaManager.getConfig().getTokenName(), StpUtil.getTokenValue(), profile);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.isNotBlank(forwardedFor)) {
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.isNotBlank(realIp)) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}