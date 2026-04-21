package com.myantapp.backend.Service.content.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.content.AppMediaService;
import com.myantapp.backend.entity.content.AppMedia;
import com.myantapp.backend.mapper.content.AppMediaMapper;
import org.springframework.stereotype.Service;

@Service
public class AppMediaServiceImpl extends ServiceImpl<AppMediaMapper, AppMedia> implements AppMediaService {
}