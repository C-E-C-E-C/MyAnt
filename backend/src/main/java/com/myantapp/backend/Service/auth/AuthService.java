package com.myantapp.backend.Service.auth;

import com.myantapp.backend.dto.auth.CaptchaResponse;
import com.myantapp.backend.dto.auth.ForgotPasswordRequest;
import com.myantapp.backend.dto.auth.LoginRequest;
import com.myantapp.backend.dto.auth.LoginResponse;
import com.myantapp.backend.dto.auth.RegisterRequest;
import com.myantapp.backend.dto.auth.UserProfile;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {

    CaptchaResponse createCaptcha();

    LoginResponse login(LoginRequest request, HttpServletRequest httpServletRequest);

    LoginResponse register(RegisterRequest request, HttpServletRequest httpServletRequest);

    void forgotPassword(ForgotPasswordRequest request, HttpServletRequest httpServletRequest);

    UserProfile currentUser();

    void logout();
}