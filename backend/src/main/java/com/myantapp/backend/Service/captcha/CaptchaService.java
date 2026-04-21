package com.myantapp.backend.Service.captcha;

import com.myantapp.backend.dto.auth.CaptchaResponse;

public interface CaptchaService {

    CaptchaResponse createCaptcha();

    void verifyCaptcha(String captchaId, String captchaCode);
}