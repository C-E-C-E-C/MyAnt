package com.myantapp.backend.Service.content.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.content.AppMediaEpisodeService;
import com.myantapp.backend.entity.content.AppMediaEpisode;
import com.myantapp.backend.mapper.content.AppMediaEpisodeMapper;
import org.springframework.stereotype.Service;

@Service
public class AppMediaEpisodeServiceImpl extends ServiceImpl<AppMediaEpisodeMapper, AppMediaEpisode> implements AppMediaEpisodeService {
}