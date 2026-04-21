package com.myantapp.backend.Service.social.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.social.AppCommentService;
import com.myantapp.backend.entity.social.AppComment;
import com.myantapp.backend.mapper.social.AppCommentMapper;
import org.springframework.stereotype.Service;

@Service
public class AppCommentServiceImpl extends ServiceImpl<AppCommentMapper, AppComment> implements AppCommentService {
}