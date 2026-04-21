package com.myantapp.backend.Service.content.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myantapp.backend.Service.content.AppMediaPersonRelService;
import com.myantapp.backend.entity.content.AppMediaPersonRel;
import com.myantapp.backend.mapper.content.AppMediaPersonRelMapper;
import org.springframework.stereotype.Service;

@Service
public class AppMediaPersonRelServiceImpl extends ServiceImpl<AppMediaPersonRelMapper, AppMediaPersonRel> implements AppMediaPersonRelService {
}