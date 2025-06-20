# 图书销售系统

基于 Spring Boot + React + TypeScript 技术栈开发的完整图书销售系统。

## 项目结构

```
bookstore-system/
├── bookstore-backend/          # Spring Boot 后端
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/bookstore/
│   │   │   │       ├── controller/     # 控制器层
│   │   │   │       ├── service/        # 服务层
│   │   │   │       ├── repository/     # 数据访问层
│   │   │   │       ├── entity/         # 实体类
│   │   │   │       ├── config/         # 配置类
│   │   │   │       ├── dto/            # 数据传输对象
│   │   │   │       └── BookStoreApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml     # 配置文件
│   │   │       └── data.sql           # 初始化数据
│   │   └── test/
│   ├── pom.xml                        # Maven 依赖配置
│   └── README.md
├── bookstore-frontend/                # React 前端
│   ├── src/
│   │   ├── assets/                    # 静态资源
│   │   ├── components/                # 公共组件
│   │   ├── pages/                     # 页面组件
│   │   ├── services/                  # API 服务
│   │   ├── store/                     # 状态管理
│   │   ├── router/                    # 路由配置
│   │   ├── types/                     # TypeScript 类型定义
│   │   ├── utils/                     # 工具函数
│   │   ├── App.tsx                    # 主应用组件
│   │   └── main.tsx                   # 入口文件
│   ├── package.json                   # 依赖配置
│   ├── vite.config.ts                 # Vite 配置
│   └── README.md
├── docs/                              # 项目文档
├── README.md                          # 项目说明
└── bookstore_system_plan.md          # 开发方案
```

## 技术栈

### 后端
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA
- MySQL 8.0
- Lombok
- Swagger/OpenAPI 3

### 前端
- React 18
- TypeScript
- Vite
- React Router
- Zustand (状态管理)
- Ant Design (UI组件库)
- Axios (HTTP客户端)

## 功能特性

### 用户端
- 用户注册/登录
- 图书浏览（分页、搜索）
- 图书详情查看
- 购物车管理
- 订单创建和查看

### 管理端
- 管理员登录
- 图书管理（增删改查、封面上传）
- 用户管理（查看、封禁/激活）
- 订单管理（查看、统计）

## 快速开始

### 环境要求
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.6+

### 后端启动
```bash
cd bookstore-backend
mvn spring-boot:run
```

### 前端启动
```bash
cd bookstore-frontend
npm install
npm run dev
```

## 开发进度

- [x] 项目结构搭建
- [ ] 后端开发
- [ ] 前端开发
- [ ] 集成测试
- [ ] 部署上线

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
