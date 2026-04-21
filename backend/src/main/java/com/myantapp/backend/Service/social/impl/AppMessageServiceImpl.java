package com.myantapp.backend.Service.social.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.social.AppMessageService;
import com.myantapp.backend.entity.social.AppMessage;
import com.myantapp.backend.mapper.social.AppMessageMapper;
import org.springframework.stereotype.Service;

@Service
public class AppMessageServiceImpl extends ServiceImpl<AppMessageMapper, AppMessage> implements AppMessageService {
}