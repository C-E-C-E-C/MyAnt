package com.myantapp.backend.Service.upload;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.myantapp.backend.config.AliossProperties;
import com.myantapp.backend.config.TencentCosProperties;
import com.myantapp.backend.exception.BusinessException;
import com.qcloud.cos.COSClient;
import com.qcloud.cos.ClientConfig;
import com.qcloud.cos.auth.BasicCOSCredentials;
import com.qcloud.cos.auth.COSCredentials;
import com.qcloud.cos.http.HttpMethodName;
import com.qcloud.cos.model.GeneratePresignedUrlRequest;
import com.qcloud.cos.model.ObjectMetadata;
import com.qcloud.cos.model.PutObjectRequest;
import com.qcloud.cos.region.Region;
import java.net.URL;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CloudStorageService {

    private static final Set<String> IMAGE_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "bmp", "heic");
    private static final Set<String> VIDEO_EXTENSIONS = Set.of(
            "mp4", "mov", "mkv", "avi", "webm", "m4v", "ts");

    private final AliossProperties aliossProperties;
    private final TencentCosProperties tencentCosProperties;

    public String uploadImage(MultipartFile file) {
        validateFile(file, IMAGE_EXTENSIONS, "图片");
        return uploadToAliyun(file, "images");
    }

    public String uploadVideo(MultipartFile file) {
        validateFile(file, VIDEO_EXTENSIONS, "视频");
        return uploadToTencentCos(file, "videos");
    }

    public VideoUploadSession createVideoUploadSession(String originalFilename) {
        validateFileName(originalFilename, VIDEO_EXTENSIONS, "视频");
        validateTencentConfig();

        String objectKey = buildObjectKey("videos", originalFilename);
        COSCredentials credentials = new BasicCOSCredentials(
                tencentCosProperties.getSecretId(),
                tencentCosProperties.getSecretKey());
        ClientConfig clientConfig = new ClientConfig(new Region(tencentCosProperties.getRegion()));
        COSClient cosClient = new COSClient(credentials, clientConfig);

        try {
            GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(
                    tencentCosProperties.getBucketName(),
                    objectKey,
                    HttpMethodName.PUT);
            request.setExpiration(new Date(System.currentTimeMillis() + 10 * 60 * 1000L));
            URL uploadUrl = cosClient.generatePresignedUrl(request);
            String fileUrl = joinUrl(tencentCosProperties.getDomain(), objectKey);
            return new VideoUploadSession(uploadUrl.toString(), fileUrl, objectKey, 600);
        } finally {
            cosClient.shutdown();
        }
    }

    private void validateFile(MultipartFile file, Set<String> allowedExtensions, String fileTypeName) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(fileTypeName + "文件不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        if (!StringUtils.hasText(originalFilename)) {
            throw new BusinessException(fileTypeName + "文件名不能为空");
        }

        String extension = getFileExtension(originalFilename);
        if (!allowedExtensions.contains(extension)) {
            throw new BusinessException(fileTypeName + "格式不支持，请上传 " + String.join("、", allowedExtensions) + " 文件");
        }
    }

    private void validateFileName(String originalFilename, Set<String> allowedExtensions, String fileTypeName) {
        if (!StringUtils.hasText(originalFilename)) {
            throw new BusinessException(fileTypeName + "文件名不能为空");
        }

        String extension = getFileExtension(originalFilename);
        if (!allowedExtensions.contains(extension)) {
            throw new BusinessException(fileTypeName + "格式不支持，请上传 " + String.join("、", allowedExtensions) + " 文件");
        }
    }

    private String uploadToAliyun(MultipartFile file, String directory) {
        validateAliyunConfig();
        String objectKey = buildObjectKey(directory, file.getOriginalFilename());
        String endpoint = normalizeEndpoint(aliossProperties.getEndpoint());
        String publicBaseUrl = "https://" + aliossProperties.getBucketName() + "." + endpoint;

        OSS ossClient = new OSSClientBuilder().build(
                endpoint,
                aliossProperties.getAccessKeyId(),
                aliossProperties.getAccessKeySecret());
        try (InputStream inputStream = file.getInputStream()) {
            ossClient.putObject(aliossProperties.getBucketName(), objectKey, inputStream);
            return joinUrl(publicBaseUrl, objectKey);
        } catch (IOException exception) {
            throw new BusinessException("图片上传失败：" + exception.getMessage());
        } finally {
            ossClient.shutdown();
        }
    }

    private String uploadToTencentCos(MultipartFile file, String directory) {
        validateTencentConfig();
        String objectKey = buildObjectKey(directory, file.getOriginalFilename());

        COSCredentials credentials = new BasicCOSCredentials(
                tencentCosProperties.getSecretId(),
                tencentCosProperties.getSecretKey());
        ClientConfig clientConfig = new ClientConfig(new Region(tencentCosProperties.getRegion()));
        COSClient cosClient = new COSClient(credentials, clientConfig);

        try (InputStream inputStream = file.getInputStream()) {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            if (StringUtils.hasText(file.getContentType())) {
                metadata.setContentType(file.getContentType());
            }

            PutObjectRequest request = new PutObjectRequest(
                    tencentCosProperties.getBucketName(),
                    objectKey,
                    inputStream,
                    metadata);
            cosClient.putObject(request);
            return joinUrl(tencentCosProperties.getDomain(), objectKey);
        } catch (IOException exception) {
            throw new BusinessException("视频上传失败：" + exception.getMessage());
        } finally {
            cosClient.shutdown();
        }
    }

    private void validateAliyunConfig() {
        if (!StringUtils.hasText(aliossProperties.getEndpoint())
                || !StringUtils.hasText(aliossProperties.getAccessKeyId())
                || !StringUtils.hasText(aliossProperties.getAccessKeySecret())
                || !StringUtils.hasText(aliossProperties.getBucketName())) {
            throw new BusinessException("阿里云图片上传配置不完整");
        }
    }

    private void validateTencentConfig() {
        if (!StringUtils.hasText(tencentCosProperties.getSecretId())
                || !StringUtils.hasText(tencentCosProperties.getSecretKey())
                || !StringUtils.hasText(tencentCosProperties.getRegion())
                || !StringUtils.hasText(tencentCosProperties.getBucketName())
                || !StringUtils.hasText(tencentCosProperties.getDomain())) {
            throw new BusinessException("腾讯云视频上传配置不完整");
        }
    }

    private String buildObjectKey(String directory, String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        return directory + "/" + datePath + "/" + UUID.randomUUID().toString().replace("-", "") + "." + extension;
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex < 0 || lastDotIndex == filename.length() - 1) {
            throw new BusinessException("无法识别文件后缀");
        }
        return filename.substring(lastDotIndex + 1).toLowerCase(Locale.ROOT);
    }

    private String normalizeEndpoint(String endpoint) {
        String value = endpoint.trim();
        if (value.startsWith("https://")) {
            return value.substring("https://".length());
        }
        if (value.startsWith("http://")) {
            return value.substring("http://".length());
        }
        return value;
    }

    private String joinUrl(String baseUrl, String path) {
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String normalizedPath = path.startsWith("/") ? path.substring(1) : path;
        return normalizedBaseUrl + "/" + normalizedPath;
    }

    public record VideoUploadSession(
            String uploadUrl,
            String fileUrl,
            String objectKey,
            long expiresInSeconds) {
    }
}