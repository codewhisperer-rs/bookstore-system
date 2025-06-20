# 图书销售系统开发方案（Spring Boot + React + TypeScript）

## 📌 项目背景与目标

以真实的图书销售系统数据为例，构建一个典型的大数据开发流程中的系统，用于展示推荐功能与订单流程。目标是实现一个功能完整、美观易用的图书销售平台。

---

## 🧰 技术栈选择

### 前端（用户与管理员界面）
- React + TypeScript
- React Router
- Zustand 或 Redux
- Axios
- Ant Design（组件库）
- Vite（构建工具）

### 后端
- Spring Boot
- Spring Security + JWT（登录认证）
- Spring Data JPA
- MySQL（数据库）
- Lombok（简化代码）
- Swagger（接口文档）

---

## 👥 用户角色与功能

| 角色         | 功能说明 |
|--------------|----------|
| 普通用户     | 查看图书、购买图书、查看订单 |
| 超级管理员   | 管理图书、上传封面图、查看图书、角色管理、订单管理、用户管理 |

---

## 🗃 数据库设计

### 用户表（`user`）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| username | varchar | 用户名 |
| password | varchar | 加密密码 |
| role | varchar | `USER` 或 `ADMIN` |
| email | varchar | 邮箱 |
| is_active | boolean | 是否激活 |
| created_at | datetime | 创建时间 |

### 图书表（`book`）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| title | varchar | 书名 |
| author | varchar | 作者 |
| price | decimal | 价格 |
| stock | int | 库存 |
| description | text | 描述 |
| cover_url | varchar | 封面图地址 |
| created_at | datetime | 上架时间 |

### 订单表（`order`）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| user_id | bigint | 用户 ID |
| total_price | decimal | 总金额 |
| status | varchar | 订单状态 |
| created_at | datetime | 下单时间 |

### 订单项表（`order_item`）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键 |
| order_id | bigint | 所属订单 |
| book_id | bigint | 图书 ID |
| quantity | int | 数量 |
| price | decimal | 单价 |

---

## 📦 项目结构设计

### 前端目录结构（React + TS）

```
src/
├── assets/
├── components/
├── pages/
├── services/
├── store/
├── router/
└── App.tsx
```

### 后端目录结构（Spring Boot）

```
src/
├── controller/
├── service/
├── repository/
├── entity/
├── config/
├── dto/
└── BookStoreApplication.java
```

---

## 🔄 功能模块拆解

### 普通用户

- ✅ 注册与登录（JWT）
- ✅ 图书展示（分页 + 搜索）
- ✅ 图书详情页
- ✅ 添加购物车、下单
- ✅ 查看订单记录

### 超级管理员

- ✅ 登录后台管理界面
- ✅ 图书管理：增删改查、上传封面图
- ✅ 用户管理：封禁/激活
- ✅ 订单管理：查看所有订单、导出报表
- ✅ 分配角色权限

---

## 🌐 API 设计建议（部分）

### 登录

```
POST /api/auth/login
Request: { username, password }
Response: { token, userInfo }
```

### 获取图书列表

```
GET /api/books?page=1&size=10
```

### 创建订单

```
POST /api/orders
Request: { bookId, quantity }
```

---

## 💅 界面美化建议

- 使用 Ant Design 风格统一，简洁现代
- 用户端：首页推荐图书网格 + 图书详情卡片式展示
- 管理端：侧边栏 + 顶部菜单式后台布局

---

## 🚀 开发排期建议

| 天数 | 内容 |
|------|------|
| 第1天 | 搭建后端工程、连接数据库、实体建模 |
| 第2天 | 实现注册/登录/JWT认证 |
| 第3天 | 图书接口、购物车、订单接口 |
| 第4天 | 前端项目初始化、登录页面、首页图书展示 |
| 第5天 | 购物车、下单、我的订单页面 |
| 第6天 | 管理端：图书管理 |
| 第7天 | 管理端：用户与订单管理 |
| 第8天 | 联调、部署、优化 UI 和安全性 |

---

## 📦 部署建议

- 前端构建后使用 Nginx 部署
- 后端使用 Docker + Spring Boot Jar 包部署
- 数据库使用 Docker + MySQL 镜像
- 推荐使用 HTTPS + 域名访问

---

## ✅ 可扩展建议

- 增加图书推荐（协同过滤、基于评分）
- 订单状态：未支付 / 支付成功 / 发货 / 完成
- 支持上传多封面图、视频介绍等

---