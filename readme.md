# 后端模板（Golang）

## 技术栈
- gin
- gorm
- MySQL

## 功能
- **健康检查**：提供 `/health` 接口，用于检查服务运行状态。

```bash
curl http://127.0.0.1:8080/health
```


## 项目结构
```
music_system/
├── cmd/                 # 应用程序入口
│   └── main.go          # 主程序入口文件
│
├── config/              # 配置相关
│   ├── config.go        # 应用配置，包含数据库连接参数
│   ├── database.go      # 数据库初始化配置
│   └── mysql.sql        # 数据库初始化脚本
│
├── model/               # 数据模型
│   ├── base_model.go    # 基础模型定义
│   ├── user.go          # 用户定义
│   ├── music.go         # 音乐定义
│   ├── singer.go        # 音乐人
│   └── comment.go       # 评论
│
│   └── repo/            # 仓库接口定义
│       ├── base_model.go  # 基础仓库接口 IBaseModel 定义
│       ├── user.go
│       ├── music.go
│       └── comment.go
│
├── router/              # 路由处理
│   ├── health.go        # 健康检查路由
│   ├── user.go
│   ├── music.go
│   └── comment.go       
│
├── service/             # 业务逻辑层
│   ├── user.go
│   ├── music.go
│   └── comment.go 
│
└── go.mod               # Go 模块文件

```

## 注意事项
- 服务器将在 `http://localhost:5000` 启动
- 确保MySQL服务已启动
- 默认数据库配置:
  - 主机: `localhost`
  - 端口: `3306`
  - 数据库名: `backend_gorm_template_db`
  - 用户名: `root`
  - 密码: `root`
  - 字符集: `utf8mb4`