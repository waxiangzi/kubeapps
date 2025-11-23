# Kubeapps - Kiro Spec Documentation

**项目**: Kubeapps - Kubernetes Application Management Platform  
**状态**: 已归档 (2025-08-25)  
**维护模式**: 社区 Fork / 学习参考  
**最后更新**: 2025-11-23

## 📋 目录

1. [项目概览](./01-project-overview.md)
2. [架构设计](./02-architecture.md)
3. [开发环境](./03-development-setup.md)
4. [构建与部署](./04-build-deploy.md)
5. [测试策略](./05-testing.md)
6. [代码规范](./06-code-standards.md)
7. [API 文档](./07-api-reference.md)
8. [故障排查](./08-troubleshooting.md)
9. [维护指南](./09-maintenance.md)
10. [贡献指南](./10-contributing.md)

## 🚀 快速开始

### 使用 Kiro 进行开发

```bash
# 1. 设置开发环境
kiro-cli chat "根据 .kiro/03-development-setup.md 设置开发环境"

# 2. 构建所有服务
kiro-cli chat "构建所有微服务"

# 3. 运行测试
kiro-cli chat "运行完整测试套件"

# 4. 启动本地开发环境
kiro-cli chat "启动 kind 集群并部署 Kubeapps"
```

### 常用 Kiro 命令

```bash
# 代码审查
kiro-cli chat "审查 cmd/kubeapps-apis/server/server.go 的代码质量"

# 添加新功能
kiro-cli chat "在 Helm 插件中添加新的 API 端点"

# 修复 Bug
kiro-cli chat "修复 dashboard 中的 token 存储安全问题"

# 重构代码
kiro-cli chat "重构 utils.ts，按功能拆分为多个文件"

# 更新依赖
kiro-cli chat "更新所有 Go 依赖到最新稳定版本"

# 生成文档
kiro-cli chat "为 PackagesService 生成 API 文档"
```

## 📁 项目结构

```
kubeapps/
├── .kiro/                    # Kiro Spec 文档
│   ├── README.md            # 本文件
│   ├── 01-project-overview.md
│   ├── 02-architecture.md
│   └── ...
├── cmd/                      # 微服务入口
│   ├── kubeapps-apis/       # 主 API 服务 (Go)
│   ├── apprepository-controller/  # 仓库控制器 (Go)
│   ├── asset-syncer/        # 资源同步器 (Go)
│   ├── pinniped-proxy/      # 认证代理 (Rust)
│   └── oci-catalog/         # OCI 目录服务 (Rust)
├── dashboard/               # React 前端
├── pkg/                     # 共享 Go 包
├── chart/                   # Helm Chart (开发用)
├── integration/             # E2E 测试
└── script/                  # 构建脚本

```

## 🎯 核心组件

### 后端服务 (Go)

| 服务 | 端口 | 职责 | 语言 |
|------|------|------|------|
| kubeapps-apis | 50051 | 主 API 网关，插件管理 | Go |
| apprepository-controller | - | 监控应用仓库 CRD | Go |
| asset-syncer | - | 同步 Chart 元数据到数据库 | Go |
| pinniped-proxy | 3333 | Pinniped 认证代理 | Rust |
| oci-catalog | 50061 | OCI 镜像目录服务 | Rust |

### 前端应用 (React)

| 组件 | 技术栈 | 职责 |
|------|--------|------|
| Dashboard | React 17 + TypeScript | Web UI |
| State Management | Redux + Redux Thunk | 状态管理 |
| UI Framework | Clarity Design System | 组件库 |
| API Client | gRPC-Web (Connect) | 后端通信 |

## 🛠️ 技术栈

### 后端
- **语言**: Go 1.23.2, Rust (latest)
- **框架**: gRPC, Connect, Cobra
- **数据库**: PostgreSQL, Redis
- **K8s**: client-go, controller-runtime

### 前端
- **语言**: TypeScript 5.x
- **框架**: React 17, Redux
- **构建**: Craco, Webpack
- **测试**: Jest, Playwright

### DevOps
- **容器**: Docker, Buildkit
- **编排**: Kubernetes, Helm
- **CI/CD**: GitHub Actions
- **测试**: Kind, Playwright

## 📝 Kiro 使用场景

### 1. 日常开发

```bash
# 创建新功能
kiro-cli chat "创建一个新的 Flux 插件 API 端点用于获取 HelmRelease 状态"

# 修改现有代码
kiro-cli chat "修改 Auth.ts，使用 httpOnly cookie 替代 localStorage"

# 添加测试
kiro-cli chat "为 PackagesService 添加单元测试"
```

### 2. Bug 修复

```bash
# 定位问题
kiro-cli chat "分析为什么 dashboard 无法连接到 kubeapps-apis"

# 修复代码
kiro-cli chat "修复 cluster_config.go 中的证书验证问题"

# 验证修复
kiro-cli chat "运行相关测试验证修复"
```

### 3. 重构优化

```bash
# 代码重构
kiro-cli chat "重构 server.go，提取日志配置到单独的模块"

# 性能优化
kiro-cli chat "优化 dashboard 的包大小，实施代码分割"

# 安全加固
kiro-cli chat "审查并修复所有安全漏洞"
```

### 4. 文档维护

```bash
# 更新文档
kiro-cli chat "更新 API 文档以反映最新的 gRPC 接口"

# 生成文档
kiro-cli chat "为新增的插件生成使用文档"
```

## 🔧 开发工作流

### 标准流程

1. **需求分析**
   ```bash
   kiro-cli chat "分析需求：添加对 Carvel 包的支持"
   ```

2. **设计方案**
   ```bash
   kiro-cli chat "设计 Carvel 插件的架构和 API"
   ```

3. **实现代码**
   ```bash
   kiro-cli chat "实现 Carvel 插件的核心功能"
   ```

4. **编写测试**
   ```bash
   kiro-cli chat "为 Carvel 插件添加单元测试和集成测试"
   ```

5. **代码审查**
   ```bash
   kiro-cli chat "审查 Carvel 插件的代码质量"
   ```

6. **文档更新**
   ```bash
   kiro-cli chat "更新文档以包含 Carvel 插件的使用说明"
   ```

## 📚 相关资源

- [官方文档](https://kubeapps.dev)
- [GitHub 仓库](https://github.com/vmware-tanzu/kubeapps)
- [Bitnami Chart](https://github.com/bitnami/charts/tree/main/bitnami/kubeapps)
- [Kubernetes Slack #kubeapps](https://kubernetes.slack.com/messages/kubeapps)

## ⚠️ 重要提示

1. **项目已归档**: 原项目已于 2025-08-25 归档，不再接受新的 PR
2. **安全更新**: 使用前请检查依赖的安全漏洞
3. **社区 Fork**: 如需持续维护，建议创建社区 Fork
4. **学习用途**: 适合作为 Kubernetes 应用管理的学习参考

## 🤝 贡献

如果你维护的是 Fork 版本，请参考 [贡献指南](./10-contributing.md)。

---

**维护者**: Kiro AI Assistant  
**联系方式**: 通过 kiro-cli 进行交互
