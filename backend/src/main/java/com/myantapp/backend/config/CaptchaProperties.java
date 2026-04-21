package com.myantapp.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "myant.captcha")
public class CaptchaProperties {

    private boolean enabled = true;
    private int length = 6;
    private int width = 250;
    private int height = 60;
    private int expireSeconds = 300;
    private int lineCount = 8;
    private int dotCount = 30;
    private int fontSize = 32;
    private String fontName = "SansSerif";
}