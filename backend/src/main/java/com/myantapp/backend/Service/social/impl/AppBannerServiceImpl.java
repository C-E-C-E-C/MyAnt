package com.myantapp.backend.Service.social.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.social.AppBannerService;
import com.myantapp.backend.entity.social.AppBanner;
import com.myantapp.backend.mapper.social.AppBannerMapper;
import org.springframework.stereotype.Service;

@Service
public class AppBannerServiceImpl extends ServiceImpl<AppBannerMapper, AppBanner> implements AppBannerService {
}