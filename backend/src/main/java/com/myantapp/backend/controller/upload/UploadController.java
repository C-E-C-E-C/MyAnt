package com.myantapp.backend.controller.upload;

import com.myantapp.backend.Service.upload.CloudStorageService;
import com.myantapp.backend.common.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final CloudStorageService cloudStorageService;

    public UploadController(CloudStorageService cloudStorageService) {
        this.cloudStorageService = cloudStorageService;
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> uploadImage(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(cloudStorageService.uploadImage(file));
    }

    @PostMapping(value = "/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> uploadVideo(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(cloudStorageService.uploadVideo(file));
    }

    @PostMapping("/video/presign")
    public ApiResponse<CloudStorageService.VideoUploadSession> createVideoUploadSession(
            @Valid @RequestBody VideoUploadSessionRequest request) {
        return ApiResponse.success(cloudStorageService.createVideoUploadSession(request.fileName()));
    }

    public record VideoUploadSessionRequest(
            @NotBlank(message = "fileName不能为空")
            String fileName,
            String contentType) {
    }
}