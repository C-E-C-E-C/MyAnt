package com.myantapp.backend.Service.captcha.impl;

import com.myantapp.backend.Service.captcha.CaptchaService;
import com.myantapp.backend.config.CaptchaProperties;
import com.myantapp.backend.dto.auth.CaptchaResponse;
import com.myantapp.backend.exception.BusinessException;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;


@Slf4j
@Service
@RequiredArgsConstructor
public class InMemoryCaptchaService implements CaptchaService {

    private final CaptchaProperties captchaProperties;
    private final Map<String, CaptchaRecord> captchaStore = new ConcurrentHashMap<>();
    private final Random random = new Random();

    @Override
    public CaptchaResponse createCaptcha() {
        cleanupExpired();
        String captchaCode = generateCode();
        String captchaId = UUID.randomUUID().toString().replace("-", "");
        long expireAt = Instant.now().getEpochSecond() + captchaProperties.getExpireSeconds();
        captchaStore.put(captchaId, new CaptchaRecord(captchaCode, expireAt));
        return new CaptchaResponse(captchaId, renderCaptchaImage(captchaCode), captchaProperties.getExpireSeconds());
    }

    @Override
    public void verifyCaptcha(String captchaId, String captchaCode) {
        log.info("verifyCaptcha: captchaId: {}, captchaCode: {}", captchaId, captchaCode);

        if (!captchaProperties.isEnabled()) {
            log.info("captcha is not enabled");
            return;
        }
        if (!StringUtils.hasText(captchaId) || !StringUtils.hasText(captchaCode)) {
            log.error("captchaId or captchaCode is empty");
            throw new BusinessException("验证码不能为空");
        }
        cleanupExpired();
        CaptchaRecord record = captchaStore.get(captchaId);
        if (record == null) {
            log.error("captchaId: {} not found", captchaId);
            throw new BusinessException("验证码已过期或不存在");
        }
        if (!record.captchaCode.equalsIgnoreCase(captchaCode.trim())) {
            log.error("captchaId: {} captchaCode: {} not match", captchaId, captchaCode);
            throw new BusinessException("验证码错误");
        }
        captchaStore.remove(captchaId, record);
    }

    private void cleanupExpired() {
        long now = Instant.now().getEpochSecond();
        captchaStore.entrySet().removeIf(entry -> entry.getValue().expireAt <= now);
    }

    private String generateCode() {
        int length = Math.max(4, captchaProperties.getLength());
        StringBuilder code = new StringBuilder(length);
        code.append(random.nextInt(9) + 1);
        for (int index = 1; index < length; index++) {
            code.append(random.nextInt(10));
        }
        log.info("初始化 generateCode: {}", code.toString());
        return code.toString();
    }

    private String renderCaptchaImage(String captchaCode) {
        int width = captchaProperties.getWidth();
        int height = captchaProperties.getHeight();
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        graphics.setColor(Color.WHITE);
        graphics.fillRect(0, 0, width, height);

        graphics.setStroke(new BasicStroke(1.5f));
        for (int i = 0; i < captchaProperties.getLineCount(); i++) {
            graphics.setColor(randomDarkColor());
            int x1 = random.nextInt(width);
            int y1 = random.nextInt(height);
            int x2 = random.nextInt(width);
            int y2 = random.nextInt(height);
            graphics.drawLine(x1, y1, x2, y2);
        }

        // ========== 修复 6 位显示不全 ==========
        int codeLength = captchaCode.length();
        int charWidth = (width - 40) / codeLength;
        int startX = 20;

        for (int i = 0; i < captchaCode.length(); i++) {
            graphics.setFont(new Font(captchaProperties.getFontName(), Font.BOLD, captchaProperties.getFontSize()));
            graphics.setColor(randomDarkColor());
            int x = startX + i * charWidth + random.nextInt(8);
            int y = height / 2 + captchaProperties.getFontSize() / 2 - 6 + random.nextInt(8) - 4;
            graphics.drawString(String.valueOf(captchaCode.charAt(i)), x, y);
        }
        // ======================================

        for (int i = 0; i < captchaProperties.getDotCount(); i++) {
            graphics.setColor(randomLightColor());
            int x = random.nextInt(width);
            int y = random.nextInt(height);
            graphics.fillRect(x, y, 1, 1);
        }

        graphics.dispose();
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", outputStream);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (IOException exception) {
            throw new BusinessException("验证码生成失败");
        }
    }

    private Color randomDarkColor() {
        return new Color(20 + random.nextInt(120), 20 + random.nextInt(120), 20 + random.nextInt(120));
    }

    private Color randomLightColor() {
        return new Color(160 + random.nextInt(80), 160 + random.nextInt(80), 160 + random.nextInt(80));
    }

    private record CaptchaRecord(String captchaCode, long expireAt) {
    }
}