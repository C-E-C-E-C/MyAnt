package com.myantapp.backend.exception;

import com.myantapp.backend.common.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException exception) {
        log.info("BusinessException: code={} message={}", exception.getCode(), exception.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.of(exception.getCode(), exception.getMessage(), null));
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiResponse<Void>> handleValidationException(Exception exception) {
        String message = "参数校验失败";
        if (exception instanceof MethodArgumentNotValidException methodArgumentNotValidException) {
            message = Objects.requireNonNull(methodArgumentNotValidException.getBindingResult().getFieldError())
                    .getDefaultMessage();
        } else if (exception instanceof BindException bindException) {
            message = Objects.requireNonNull(bindException.getBindingResult().getFieldError()).getDefaultMessage();
        } else if (exception instanceof ConstraintViolationException constraintViolationException
                && !constraintViolationException.getConstraintViolations().isEmpty()) {
            message = constraintViolationException.getConstraintViolations().iterator().next().getMessage();
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.of(400, message, null));
    }

    @ExceptionHandler({MissingServletRequestPartException.class, MissingServletRequestParameterException.class})
    public ResponseEntity<ApiResponse<Void>> handleMissingRequestPartException(Exception exception) {
        String message = "请选择要上传的文件";
        if (exception instanceof MissingServletRequestParameterException parameterException) {
            message = parameterException.getParameterName() + "不能为空";
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.of(400, message, null));
    }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolationException(
            DataIntegrityViolationException exception) {
        Throwable rootCause = exception.getMostSpecificCause();
        String message = rootCause != null && rootCause.getMessage() != null
            ? rootCause.getMessage()
            : "数据库写入失败";
        log.info("DataIntegrityViolationException: {}", message);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.of(500, rootCause != null && rootCause.getClass() != null
                ? rootCause.getClass().getSimpleName() + ": " + message
                : message, null));
        }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception exception) {
        log.error("Unhandled exception", exception);
        String detailMessage = exception.getMessage();
        if (detailMessage == null || detailMessage.isBlank()) {
            detailMessage = exception.getClass().getSimpleName();
        } else {
            detailMessage = exception.getClass().getSimpleName() + ": " + detailMessage;
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.of(500, detailMessage, null));
    }
}