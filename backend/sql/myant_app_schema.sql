SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `myant_app`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `myant_app`;

DROP TABLE IF EXISTS `app_banner`;
DROP TABLE IF EXISTS `app_message`;
DROP TABLE IF EXISTS `app_follow`;
DROP TABLE IF EXISTS `app_comment`;
DROP TABLE IF EXISTS `app_watch_history`;
DROP TABLE IF EXISTS `app_favorite`;
DROP TABLE IF EXISTS `app_media_episode`;
DROP TABLE IF EXISTS `app_media_person_rel`;
DROP TABLE IF EXISTS `app_person`;
DROP TABLE IF EXISTS `app_media`;
DROP TABLE IF EXISTS `app_category`;
DROP TABLE IF EXISTS `sys_role_permission`;
DROP TABLE IF EXISTS `sys_user_role`;
DROP TABLE IF EXISTS `sys_permission`;
DROP TABLE IF EXISTS `sys_role`;
DROP TABLE IF EXISTS `sys_user`;

CREATE TABLE `sys_user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '登录用户名',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱地址',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `password_hash` varchar(255) NOT NULL COMMENT '密码哈希值',
  `nickname` varchar(50) NOT NULL COMMENT '昵称',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '头像地址',
  `signature` varchar(255) DEFAULT NULL COMMENT '个人签名',
  `gender` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '性别：0未知，1男，2女',
  `user_type` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '用户类型：1普通用户，2管理员',
  `status` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '账号状态：1启用，0禁用',
  `vip_level` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '会员等级',
  `vip_expire_time` datetime DEFAULT NULL COMMENT '会员到期时间',
  `coin_balance` int NOT NULL DEFAULT '0' COMMENT '硬币余额',
  `bcoin_balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'B币余额',
  `level` int NOT NULL DEFAULT '1' COMMENT '用户等级',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(64) DEFAULT NULL COMMENT '最后登录IP',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '逻辑删除标识：0未删除，1已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sys_user_username` (`username`),
  UNIQUE KEY `uk_sys_user_email` (`email`),
  UNIQUE KEY `uk_sys_user_phone` (`phone`),
  KEY `idx_sys_user_status` (`status`),
  KEY `idx_sys_user_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户表';

CREATE TABLE `sys_role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_code` varchar(50) NOT NULL COMMENT '角色编码',
  `role_name` varchar(50) NOT NULL COMMENT '角色名称',
  `status` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '角色状态：1启用，0禁用',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值，数值越小越靠前',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '逻辑删除标识：0未删除，1已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sys_role_code` (`role_code`),
  KEY `idx_sys_role_status` (`status`),
  KEY `idx_sys_role_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统角色表';

CREATE TABLE `sys_permission` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  `parent_id` bigint unsigned DEFAULT NULL COMMENT '父权限ID，NULL表示顶级权限',
  `permission_code` varchar(100) NOT NULL COMMENT '权限编码，建议使用模块:动作格式',
  `permission_name` varchar(100) NOT NULL COMMENT '权限名称',
  `perm_type` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '权限类型：1菜单，2按钮，3接口',
  `resource_path` varchar(255) DEFAULT NULL COMMENT '资源路径或接口路径',
  `status` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '权限状态：1启用，0禁用',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值，数值越小越靠前',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '逻辑删除标识：0未删除，1已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sys_permission_code` (`permission_code`),
  KEY `idx_sys_permission_parent_id` (`parent_id`),
  KEY `idx_sys_permission_status` (`status`),
  KEY `idx_sys_permission_deleted` (`deleted`),
  CONSTRAINT `fk_sys_permission_parent` FOREIGN KEY (`parent_id`) REFERENCES `sys_permission` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统权限表';

CREATE TABLE `sys_user_role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '用户角色关联ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `role_id` bigint unsigned NOT NULL COMMENT '角色ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sys_user_role_user_role` (`user_id`, `role_id`),
  KEY `idx_sys_user_role_user_id` (`user_id`),
  KEY `idx_sys_user_role_role_id` (`role_id`),
  CONSTRAINT `fk_sys_user_role_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sys_user_role_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

CREATE TABLE `sys_role_permission` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '角色权限关联ID',
  `role_id` bigint unsigned NOT NULL COMMENT '角色ID',
  `permission_id` bigint unsigned NOT NULL COMMENT '权限ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sys_role_permission_role_perm` (`role_id`, `permission_id`),
  KEY `idx_sys_role_permission_role_id` (`role_id`),
  KEY `idx_sys_role_permission_permission_id` (`permission_id`),
  CONSTRAINT `fk_sys_role_permission_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sys_role_permission_permission` FOREIGN KEY (`permission_id`) REFERENCES `sys_permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

CREATE TABLE `app_category` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `parent_id` bigint unsigned DEFAULT NULL COMMENT '父分类ID，NULL表示一级分类',
  `category_name` varchar(50) NOT NULL COMMENT '分类名称',
  `category_code` varchar(50) NOT NULL COMMENT '分类编码',
  `icon_url` varchar(255) DEFAULT NULL COMMENT '分类图标地址',
  `cover_url` varchar(255) DEFAULT NULL COMMENT '分类封面地址',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值，数值越小越靠前',
  `status` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '分类状态：1启用，0禁用',
  `is_recommend` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否推荐：1是，0否',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '逻辑删除标识：0未删除，1已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_category_code` (`category_code`),
  KEY `idx_app_category_parent_id` (`parent_id`),
  KEY `idx_app_category_status` (`status`),
  KEY `idx_app_category_deleted` (`deleted`),
  CONSTRAINT `fk_app_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `app_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容分类表';

CREATE TABLE `app_media` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '内容ID',
  `category_id` bigint unsigned DEFAULT NULL COMMENT '主分类ID',
  `media_code` varchar(50) NOT NULL COMMENT '内容编码',
  `title` varchar(100) NOT NULL COMMENT '内容标题',
  `subtitle` varchar(200) DEFAULT NULL COMMENT '内容副标题',
  `cover_url` varchar(255) DEFAULT NULL COMMENT '封面图地址',
  `poster_url` varchar(255) DEFAULT NULL COMMENT '海报图地址',
  `content_type` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '内容类型：1电影，2电视剧，3动漫，4综艺，5短剧',
  `region` varchar(50) DEFAULT NULL COMMENT '地区',
  `director` varchar(100) DEFAULT NULL COMMENT '导演名称',
  `brief_intro` varchar(1000) DEFAULT NULL COMMENT '短简介',
  `detail_intro` text COMMENT '详细介绍',
  `tags` varchar(500) DEFAULT NULL COMMENT '标签，多个标签用逗号分隔',
  `release_date` date DEFAULT NULL COMMENT '上映或上线日期',
  `total_episodes` int NOT NULL DEFAULT '1' COMMENT '总集数',
  `latest_episode_no` int NOT NULL DEFAULT '0' COMMENT '当前最新集数',
  `duration_seconds` int NOT NULL DEFAULT '0' COMMENT '单集或总时长，单位秒',
  `score` decimal(3,1) NOT NULL DEFAULT '0.0' COMMENT '评分',
  `score_count` int NOT NULL DEFAULT '0' COMMENT '评分人数',
  `view_count` bigint NOT NULL DEFAULT '0' COMMENT '播放量',
  `favorite_count` bigint NOT NULL DEFAULT '0' COMMENT '收藏量',
  `comment_count` bigint NOT NULL DEFAULT '0' COMMENT '评论量',
  `is_hot` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否热门：1是，0否',
  `is_recommend` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否推荐：1是，0否',
  `status` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '内容状态：1上架，0下架',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值，数值越小越靠前',
  `created_by` bigint unsigned DEFAULT NULL COMMENT '创建人用户ID',
  `updated_by` bigint unsigned DEFAULT NULL COMMENT '更新人用户ID',
  `deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '逻辑删除标识：0未删除，1已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_media_code` (`media_code`),
  KEY `idx_app_media_category_id` (`category_id`),
  KEY `idx_app_media_content_type` (`content_type`),
  KEY `idx_app_media_status` (`status`),
  KEY `idx_app_media_is_hot` (`is_hot`),
  KEY `idx_app_media_is_recommend` (`is_recommend`),
  KEY `idx_app_media_deleted` (`deleted`),
  CONSTRAINT `fk_app_media_category` FOREIGN KEY (`category_id`) REFERENCES `app_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_app_media_created_by` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_app_media_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容主表';

CREATE TABLE `app_person` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '人员ID',
  `person_name` varchar(100) NOT NULL COMMENT '人员名称',
  `person_type` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '人员类型：1演员，2导演，3编剧，4配音，5其他',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '头像地址',
  `gender` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '性别：0未知，1男，2女',
  `birthday` date DEFAULT NULL COMMENT '出生日期',
  `origin_place` varchar(100) DEFAULT NULL COMMENT '籍贯或地区',
  `bio` text COMMENT '人物简介',
  `status` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '状态：1启用，0禁用',
  `deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '逻辑删除标识：0未删除，1已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_app_person_person_type` (`person_type`),
  KEY `idx_app_person_status` (`status`),
  KEY `idx_app_person_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人物信息表';

CREATE TABLE `app_media_person_rel` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '内容人物关联ID',
  `media_id` bigint unsigned NOT NULL COMMENT '内容ID',
  `person_id` bigint unsigned NOT NULL COMMENT '人物ID',
  `job_type` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '关联身份：1演员，2导演，3编剧，4配音，5其他',
  `character_name` varchar(100) DEFAULT NULL COMMENT '剧中角色名',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值，数值越小越靠前',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_media_person_rel` (`media_id`, `person_id`, `job_type`),
  KEY `idx_app_media_person_rel_media_id` (`media_id`),
  KEY `idx_app_media_person_rel_person_id` (`person_id`),
  CONSTRAINT `fk_app_media_person_rel_media` FOREIGN KEY (`media_id`) REFERENCES `app_media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_app_media_person_rel_person` FOREIGN KEY (`person_id`) REFERENCES `app_person` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容人物关联表';

CREATE TABLE `app_media_episode` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '分集ID',
  `media_id` bigint unsigned NOT NULL COMMENT '内容ID',
  `episode_no` int NOT NULL COMMENT '集数编号',
  `episode_title` varchar(200) NOT NULL COMMENT '分集标题',
  `play_url` varchar(500) NOT NULL COMMENT '播放地址',
  `duration_seconds` int NOT NULL DEFAULT '0' COMMENT '时长，单位秒',
  `is_free` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '是否免费：1是，0否',
  `status` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '状态：1启用，0禁用',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值，数值越小越靠前',
  `deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '逻辑删除标识：0未删除，1已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_media_episode_media_no` (`media_id`, `episode_no`),
  KEY `idx_app_media_episode_media_id` (`media_id`),
  KEY `idx_app_media_episode_status` (`status`),
  KEY `idx_app_media_episode_deleted` (`deleted`),
  CONSTRAINT `fk_app_media_episode_media` FOREIGN KEY (`media_id`) REFERENCES `app_media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容分集表';

CREATE TABLE `app_favorite` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `media_id` bigint unsigned NOT NULL COMMENT '内容ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_favorite_user_media` (`user_id`, `media_id`),
  KEY `idx_app_favorite_user_id` (`user_id`),
  KEY `idx_app_favorite_media_id` (`media_id`),
  CONSTRAINT `fk_app_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_app_favorite_media` FOREIGN KEY (`media_id`) REFERENCES `app_media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

CREATE TABLE `app_watch_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '观看历史ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `media_id` bigint unsigned NOT NULL COMMENT '内容ID',
  `episode_id` bigint unsigned DEFAULT NULL COMMENT '分集ID',
  `progress_seconds` int NOT NULL DEFAULT '0' COMMENT '当前播放进度，单位秒',
  `total_seconds` int NOT NULL DEFAULT '0' COMMENT '总时长，单位秒',
  `is_finished` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否看完：1是，0否',
  `last_watch_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后观看时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_watch_history_user_media` (`user_id`, `media_id`),
  KEY `idx_app_watch_history_user_id` (`user_id`),
  KEY `idx_app_watch_history_media_id` (`media_id`),
  KEY `idx_app_watch_history_episode_id` (`episode_id`),
  CONSTRAINT `fk_app_watch_history_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_app_watch_history_media` FOREIGN KEY (`media_id`) REFERENCES `app_media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_app_watch_history_episode` FOREIGN KEY (`episode_id`) REFERENCES `app_media_episode` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户观看历史表';

CREATE TABLE `app_comment` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `media_id` bigint unsigned NOT NULL COMMENT '内容ID',
  `user_id` bigint unsigned NOT NULL COMMENT '评论用户ID',
  `parent_id` bigint unsigned DEFAULT NULL COMMENT '父评论ID，NULL表示一级评论',
  `content` text NOT NULL COMMENT '评论内容',
  `like_count` int NOT NULL DEFAULT '0' COMMENT '点赞数',
  `reply_count` int NOT NULL DEFAULT '0' COMMENT '回复数',
  `status` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '状态：1正常，0隐藏',
  `deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '逻辑删除标识：0未删除，1已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_app_comment_media_id` (`media_id`),
  KEY `idx_app_comment_user_id` (`user_id`),
  KEY `idx_app_comment_parent_id` (`parent_id`),
  KEY `idx_app_comment_status` (`status`),
  KEY `idx_app_comment_deleted` (`deleted`),
  CONSTRAINT `fk_app_comment_media` FOREIGN KEY (`media_id`) REFERENCES `app_media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_app_comment_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_app_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `app_comment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容评论表';

CREATE TABLE `app_follow` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '关注关系ID',
  `follower_user_id` bigint unsigned NOT NULL COMMENT '关注者用户ID',
  `followee_user_id` bigint unsigned NOT NULL COMMENT '被关注者用户ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_follow_user_pair` (`follower_user_id`, `followee_user_id`),
  KEY `idx_app_follow_follower_user_id` (`follower_user_id`),
  KEY `idx_app_follow_followee_user_id` (`followee_user_id`),
  CONSTRAINT `fk_app_follow_follower` FOREIGN KEY (`follower_user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_app_follow_followee` FOREIGN KEY (`followee_user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户关注表';

CREATE TABLE `app_message` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `sender_user_id` bigint unsigned DEFAULT NULL COMMENT '发送者用户ID，系统消息可为空',
  `receiver_user_id` bigint unsigned NOT NULL COMMENT '接收者用户ID',
  `message_type` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '消息类型：1文本，2图片，3系统通知，4业务提醒',
  `title` varchar(100) NOT NULL COMMENT '消息标题',
  `content` text NOT NULL COMMENT '消息内容',
  `related_type` varchar(50) DEFAULT NULL COMMENT '关联业务类型',
  `related_id` bigint unsigned DEFAULT NULL COMMENT '关联业务ID',
  `is_read` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否已读：1是，0否',
  `read_time` datetime DEFAULT NULL COMMENT '已读时间',
  `send_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  `deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '逻辑删除标识：0未删除，1已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_app_message_sender_user_id` (`sender_user_id`),
  KEY `idx_app_message_receiver_user_id` (`receiver_user_id`),
  KEY `idx_app_message_is_read` (`is_read`),
  KEY `idx_app_message_send_time` (`send_time`),
  KEY `idx_app_message_deleted` (`deleted`),
  CONSTRAINT `fk_app_message_sender` FOREIGN KEY (`sender_user_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_app_message_receiver` FOREIGN KEY (`receiver_user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息通知表';

CREATE TABLE `app_banner` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '轮播图ID',
  `banner_title` varchar(100) NOT NULL COMMENT '轮播图标题',
  `image_url` varchar(255) NOT NULL COMMENT '轮播图图片地址',
  `jump_type` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '跳转类型：1无跳转，2内容详情，3分类页，4外部链接',
  `jump_target` varchar(255) DEFAULT NULL COMMENT '跳转目标地址或ID',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值，数值越小越靠前',
  `status` tinyint unsigned NOT NULL DEFAULT '1' COMMENT '状态：1启用，0禁用',
  `start_time` datetime DEFAULT NULL COMMENT '开始展示时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束展示时间',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '逻辑删除标识：0未删除，1已删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_app_banner_status` (`status`),
  KEY `idx_app_banner_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='首页轮播图表';

SET FOREIGN_KEY_CHECKS = 1;
