package com.myantapp.backend.Service.social.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.social.AppFavoriteService;
import com.myantapp.backend.entity.social.AppFavorite;
import com.myantapp.backend.mapper.social.AppFavoriteMapper;
import org.springframework.stereotype.Service;

@Service
public class AppFavoriteServiceImpl extends ServiceImpl<AppFavoriteMapper, AppFavorite> implements AppFavoriteService {
}