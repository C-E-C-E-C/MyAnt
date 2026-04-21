package com.myantapp.backend.controller.auth;

import com.myantapp.backend.Service.auth.AuthService;
import com.myantapp.backend.common.ApiResponse;
import com.myantapp.backend.dto.auth.CaptchaResponse;
import com.myantapp.backend.dto.auth.ForgotPasswordRequest;
import com.myantapp.backend.dto.auth.LoginRequest;
import com.myantapp.backend.dto.auth.LoginResponse;
import com.myantapp.backend.dto.auth.RegisterRequest;
import com.myantapp.backend.dto.auth.UserProfile;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/captcha")
    public ApiResponse<CaptchaResponse> captcha() {
        return ApiResponse.success(authService.createCaptcha());
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpServletRequest) {
        return ApiResponse.success(authService.login(request, httpServletRequest));
    }

    @PostMapping("/register")
    public ApiResponse<LoginResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpServletRequest) {
        return ApiResponse.success(authService.register(request, httpServletRequest));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest httpServletRequest) {
        authService.forgotPassword(request, httpServletRequest);
        return ApiResponse.success(null);
    }

    @GetMapping("/me")
    public ApiResponse<UserProfile> currentUser() {
        return ApiResponse.success(authService.currentUser());
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        authService.logout();
        return ApiResponse.success(null);
    }
}