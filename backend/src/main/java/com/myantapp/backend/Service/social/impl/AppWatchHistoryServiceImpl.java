package com.myantapp.backend.Service.social.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.social.AppWatchHistoryService;
import com.myantapp.backend.entity.social.AppWatchHistory;
import com.myantapp.backend.mapper.social.AppWatchHistoryMapper;
import org.springframework.stereotype.Service;

@Service
public class AppWatchHistoryServiceImpl extends ServiceImpl<AppWatchHistoryMapper, AppWatchHistory> implements AppWatchHistoryService {
}