package com.myantapp.backend.Service.social.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.social.AppFollowService;
import com.myantapp.backend.entity.social.AppFollow;
import com.myantapp.backend.mapper.social.AppFollowMapper;
import org.springframework.stereotype.Service;

@Service
public class AppFollowServiceImpl extends ServiceImpl<AppFollowMapper, AppFollow> implements AppFollowService {
}