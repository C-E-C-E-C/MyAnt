# MyAnt 管理后台

这是一个基于 Vite + React + Ant Design 的独立 web 管理端，直接对接当前 Spring Boot 后端的 CRUD 接口。

## 运行

1. 安装依赖：

   `npm install`

2. 启动开发环境：

   `npm run dev`

3. 如果后端不运行在 `8080`，请在 `.env` 中设置 `VITE_API_BASE_URL`。

## 对接说明

- 登录接口：`/api/auth/login`
- 当前用户：`/api/auth/me`
- 轮播图：`/api/home/banners`
- 分类：`/api/content/categories`
- 内容：`/api/content/media`
- 分集：`/api/content/episodes`
- 人物：`/api/content/persons`
- 系统用户：`/api/system/users`
- 角色：`/api/system/roles`
- 权限：`/api/system/permissions`
- 评论、收藏、关注、历史、消息等接口：当前后端已有对应 CRUD 路由
