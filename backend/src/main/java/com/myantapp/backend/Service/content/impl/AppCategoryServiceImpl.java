package com.myantapp.backend.Service.content.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.content.AppCategoryService;
import com.myantapp.backend.entity.content.AppCategory;
import com.myantapp.backend.mapper.content.AppCategoryMapper;
import org.springframework.stereotype.Service;

@Service
public class AppCategoryServiceImpl extends ServiceImpl<AppCategoryMapper, AppCategory> implements AppCategoryService {
}