package com.myantapp.backend.Service.content.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.content.AppPersonService;
import com.myantapp.backend.entity.content.AppPerson;
import com.myantapp.backend.mapper.content.AppPersonMapper;
import org.springframework.stereotype.Service;

@Service
public class AppPersonServiceImpl extends ServiceImpl<AppPersonMapper, AppPerson> implements AppPersonService {
}