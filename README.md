# 图书销售系统

## 📌 项目背景与目标

本系统旨在构建一个功能完整、界面美观的在线图书销售平台。项目以真实的图书销售业务场景为基础，涵盖了从用户浏览、购买到管理员进行后台管理的完整流程，同时集成了推荐功能，旨在为用户提供便捷的购书体验，并为开发者提供一个典型的大数据与Web开发相结合的实践案例。

---

## 🧰 技术栈

### **前端**
- **框架与语言**: `React` + `TypeScript`
- **路由管理**: `React Router`
- **状态管理**: `Zustand` 或 `Redux`
- **HTTP客户端**: `Axios`
- **UI组件库**: `Ant Design`
- **构建工具**: `Vite`

### **后端**
- **框架**: `Spring Boot`
- **安全与认证**: `Spring Security` + `JWT`
- **数据访问**: `Spring Data JPA`
- **数据库**: `MySQL`
- **代码简化**: `Lombok`
- **API文档**: `Swagger`

---

## 👥 用户角色与核心功能

- **用户角色**: 普通用户（`USER`）和超级管理员（`ADMIN`）。
- **核心功能**:
  - **用户认证**: 提供安全的注册和登录机制，使用 JWT 进行会话管理。
  - **图书管理**: 管理员可以增、删、改、查图书，支持按标题、作者、价格范围等多种条件搜索。
  - **购物车**: 用户可以将图书加入购物车，并随时调整数量或移除商品。
  - **订单系统**: 支持从购物车一键下单，自动计算总价，并生成详细的订单记录。
  - **支付模拟**: 集成了模拟支付流程，用户可以体验完整的下单到支付过程。
  - **后台管理**: 管理员拥有专属后台，可以管理用户信息、处理订单、监控库存、查看销售统计等。

---

## 🗃 数据库设计

系统包含以下核心数据表：

### 1. 用户表 (`users`)

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `Long` | 主键 |
| `username` | `String` | 用户名 (唯一, 3-50字符) |
| `password` | `String` | 密码 (至少6字符) |
| `role` | `Enum` | 角色 (`USER`, `ADMIN`) |
| `email` | `String` | 邮箱 (唯一, 有效格式) |
| `is_active` | `Boolean` | 是否激活 (默认 `true`) |
| `created_at` | `LocalDateTime` | 创建时间 |

### 2. 图书表 (`books`)

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `Long` | 主键 |
| `title` | `String` | 书名 |
| `author` | `String` | 作者 |
| `price` | `BigDecimal` | 价格 (大于0) |
| `stock` | `Integer` | 库存 (不小于0) |
| `description` | `String` | 描述 |
| `cover_url` | `String` | 封面图地址 |
| `created_at` | `LocalDateTime` | 上架时间 |

### 3. 订单表 (`orders`)

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `Long` | 主键 |
| `user_id` | `Long` | 用户ID |
| `total_price` | `BigDecimal` | 总金额 (大于0) |
| `status` | `Enum` | 订单状态 (`PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |
| `created_at` | `LocalDateTime` | 下单时间 |

### 4. 订单项表 (`order_items`)

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `Long` | 主键 |
| `order_id` | `Long` | 订单ID |
| `book_id` | `Long` | 图书ID |
| `quantity` | `Integer` | 数量 (至少为1) |
| `price` | `BigDecimal` | 单价 (大于0) |

### 5. 购物车表 (`cart`)

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `Long` | 主键 |
| `user_id` | `Long` | 用户ID |

### 6. 购物车项表 (`cart_item`)

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `Long` | 主键 |
| `cart_id` | `Long` | 购物车ID |
| `book_id` | `Long` | 图书ID |
| `quantity` | `int` | 数量 |

---

## 🌐 API 路由文档

#### 认证 (`/auth`)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | 用户注册 | 公开 |
| `POST` | `/login` | 用户登录 | 公开 |

#### 图书 (`/books`)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | 创建新图书 | `ADMIN` |
| `PUT` | `/{id}` | 更新图书信息 | `ADMIN` |
| `DELETE` | `/{id}` | 删除图书 | `ADMIN` |
| `GET` | `/{id}` | 获取单本图书详情 | 公开 |
| `GET` | `/` | 分页获取所有图书 | 公开 |
| `GET` | `/search` | 搜索图书 | 公开 |
| `GET` | `/available` | 获取有库存的图书 | 公开 |
| `GET` | `/price-range` | 按价格区间筛选图书 | 公开 |
| `GET` | `/low-stock` | 获取低库存图书 | `ADMIN` |

#### 购物车 (`/cart`)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | 获取当前用户的购物车 | `USER` / `ADMIN` |
| `POST` | `/add` | 添加商品到购物车 | `USER` / `ADMIN` |
| `DELETE` | `/remove/{bookId}` | 从购物车移除商品 | `USER` / `ADMIN` |
| `PUT` | `/update` | 更新购物车中商品数量 | `USER` / `ADMIN` |
| `DELETE` | `/clear` | 清空购物车 | `USER` / `ADMIN` |

#### 订单 (`/orders`)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | 创建订单 | `USER` / `ADMIN` |
| `GET` | `/{id}` | 获取订单详情 | `USER` / `ADMIN` |
| `GET` | `/my-orders` | 获取当前用户的所有订单 | `USER` / `ADMIN` |
| `PUT` | `/{id}/cancel` | 取消订单 | `USER` / `ADMIN` |
| `POST` | `/{id}/cancel-request` | 申请取消订单 | `USER` / `ADMIN` |
| `GET` | `/admin/all` | (管理员) 获取所有订单 | `ADMIN` |
| `GET` | `/admin/status/{status}` | (管理员) 按状态筛选订单 | `ADMIN` |
| `PUT` | `/admin/{id}/status` | (管理员) 更新订单状态 | `ADMIN` |
| `GET` | `/admin/cancel-requests` | (管理员) 获取待处理的取消申请 | `ADMIN` |
| `PUT` | `/admin/{id}/cancel-request` | (管理员) 处理取消申请 | `ADMIN` |

#### 用户管理 (`/admin/users`)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | (管理员) 分页获取所有用户 | `ADMIN` |
| `GET` | `/search` | (管理员) 搜索用户 | `ADMIN` |
| `PUT` | `/{id}/toggle-status` | (管理员) 切换用户激活状态 | `ADMIN` |
| `PUT` | `/{id}/role` | (管理员) 更新用户角色 | `ADMIN` |
| `DELETE` | `/{id}` | (管理员) 删除用户 | `ADMIN` |

#### 支付 (`/payments`)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | 创建支付 | `USER` / `ADMIN` |
| `GET` | `/{id}` | 获取支付详情 | `USER` / `ADMIN` |
| `GET` | `/order/{orderId}` | 根据订单ID获取支付信息 | `USER` / `ADMIN` |
| `GET` | `/my-payments` | 获取当前用户的所有支付记录 | `USER` / `ADMIN` |
| `POST` | `/{id}/cancel` | 取消支付 | `USER` / `ADMIN` |
| `POST` | `/refund` | 申请退款 | `ADMIN` |
| `GET` | `/admin/all` | (管理员) 获取所有支付记录 | `ADMIN` |
| `GET` | `/admin/status/{status}` | (管理员) 按状态筛选支付记录 | `ADMIN` |
| `GET` | `/statistics` | (管理员) 获取支付统计信息 | `ADMIN` |
| `POST` | `/admin/{id}/refund` | (管理员) 处理退款 | `ADMIN` |
| `POST` | `/admin/cleanup-expired` | (管理员) 清理过期支付 | `ADMIN` |
| `POST` | `/callback` | (内部) 支付网关回调 | 公开 |
| `POST` | `/callback/simulate` | (测试) 模拟支付回调 | 公开 |

---

## 🚀 如何运行

### **后端**

1.  配置 `application.properties` 中的数据库连接信息。
2.  使用 Maven 安装依赖并运行 Spring Boot 应用。

### **前端**

1.  进入 `bookstore-frontend` 目录。
2.  运行 `npm install` 安装依赖。
3.  运行 `npm run dev` 启动开发服务器。

---

## ✅ 未来扩展方向

- **智能推荐系统**: 基于用户购买历史和浏览行为，利用协同过滤或机器学习算法，为用户推荐可能感兴趣的图书。
- **优惠券与促销活动**: 引入优惠券系统、限时折扣、捆绑销售等营销工具，提升用户购买意愿和客单价。
- **高级数据分析与可视化**: 在管理员后台集成更丰富的数据看板，通过图表展示销售趋势、用户画像、热门图书等关键指标，为运营决策提供数据支持。
- **集成第三方登录**: 支持通过 Google, GitHub 等社交账号快速登录，简化用户注册流程。
- **引入消息队列 (MQ)**: 使用 RabbitMQ 或 Kafka 异步处理订单创建、日志记录等耗时操作，提升系统响应速度和可靠性。
- **容器化部署**: 使用 Docker 和 Docker Compose 将前后端应用容器化，实现一键部署和环境隔离，简化运维流程。

基于 Spring Boot + React + TypeScript 技术栈开发的完整图书销售系统。

## 🚀 项目结构

```
bookstore-system/
├── bookstore-backend/         # 后端 Spring Boot 项目
│   ├── src/main/java/com/bookstore/
│   │   ├── config/          # Spring Security, JWT 等配置
│   │   ├── controller/      # API 路由控制器
│   │   ├── dto/             # 数据传输对象
│   │   ├── entity/          # JPA 实体类
│   │   ├── repository/      # Spring Data JPA 仓库
│   │   └── service/         # 业务逻辑服务
│   └── pom.xml              # Maven 依赖管理
├── bookstore-frontend/        # 前端 React 项目
│   ├── src/
│   │   ├── components/      # 可复用 UI 组件
│   │   ├── pages/           # 页面级组件
│   │   ├── services/        # API 请求服务
│   │   ├── store/           # 状态管理 (e.g., Redux/Zustand)
│   │   └── types/           # TypeScript 类型定义
│   └── package.json         # npm 依赖管理
└── README.md                # 项目说明文档
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

## ✨ 功能特性

### 用户端

- **认证与授权**: 安全的注册、登录，基于 JWT 的会话管理。
- **图书浏览**: 支持分页、按关键词搜索、按价格区间筛选图书。
- **购物车**: 添加、移除商品，修改商品数量，清空购物车。
- **订单流程**: 从购物车创建订单，查看个人历史订单，申请取消订单。
- **模拟支付**: 对接模拟支付网关，完成支付流程。

### 管理端

- **数据看板**: 提供销售额、订单量等核心指标的统计概览。
- **图书管理**: 全面的增、删、改、查功能，管理图书库存和信息。
- **用户管理**: 查看所有用户，管理用户状态（激活/禁用）和角色。
- **订单管理**: 查看所有订单，按状态筛选，更新订单状态，处理用户的取消订单申请。
- **支付管理**: 查看支付记录，处理退款请求，手动确认或取消支付。

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
- [x] 后端开发
- [x] 前端开发
- [x] 集成测试
- [ ] 部署上线

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
