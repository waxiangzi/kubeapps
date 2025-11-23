# 项目概览

## 项目信息

**名称**: Kubeapps  
**描述**: 基于 Web 的 Kubernetes 应用管理平台  
**许可证**: Apache-2.0  
**语言**: Go (后端), TypeScript/React (前端), Rust (代理服务)  
**状态**: 已归档 (2025-08-25)

## 核心功能

### 1. 应用包管理
- 浏览和部署 Helm Charts
- 支持 Flux HelmRelease
- 支持 Carvel 包
- 支持 Kubernetes Operators (OLM)

### 2. 多仓库支持
- 公共 Helm 仓库
- 私有 Helm 仓库
- OCI 镜像仓库
- VMware Marketplace
- Bitnami Application Catalog

### 3. 认证授权
- OIDC 认证
- Pinniped 集成
- Kubernetes RBAC
- 多集群支持

### 4. 应用生命周期
- 部署应用
- 升级应用
- 回滚应用
- 删除应用
- 查看应用状态

## 技术架构

### 微服务架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Dashboard (React)                       │
│  - UI 组件                                               │
│  - Redux 状态管理                                        │
│  - gRPC-Web 客户端                                       │
└────────────────────┬────────────────────────────────────┘
                     │ gRPC-Web
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Kubeapps APIs (Go)                          │
│  - gRPC 服务器                                           │
│  - 插件管理                                              │
│  - 认证中间件                                            │
└──┬──────────────┬──────────────┬────────────────────────┘
   │              │              │
   │ Plugin API  │              │ K8s API
   ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────────────┐
│  Helm    │  │  Flux    │  │  Kapp Controller │
│  Plugin  │  │  Plugin  │  │  Plugin          │
└──────────┘  └──────────┘  └──────────────────┘
   │              │              │
   └──────────────┴──────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Kubernetes Cluster                          │
│  - Helm Releases                                         │
│  - Flux HelmReleases                                     │
│  - Carvel PackageInstalls                                │
└─────────────────────────────────────────────────────────┘
```

### 数据流

```
用户操作 → Dashboard → gRPC-Web → Kubeapps APIs → 插件 → K8s API → 集群资源
```

## 目录结构

```
kubeapps/
├── cmd/                          # 微服务入口
│   ├── kubeapps-apis/           # 主 API 服务
│   │   ├── cmd/                 # CLI 命令
│   │   ├── core/                # 核心服务
│   │   ├── plugins/             # 插件实现
│   │   ├── server/              # gRPC 服务器
│   │   └── main.go
│   ├── apprepository-controller/ # 仓库控制器
│   ├── asset-syncer/            # 资源同步器
│   ├── pinniped-proxy/          # 认证代理 (Rust)
│   └── oci-catalog/             # OCI 目录 (Rust)
│
├── dashboard/                    # React 前端
│   ├── public/                  # 静态资源
│   ├── src/
│   │   ├── actions/             # Redux actions
│   │   ├── components/          # React 组件
│   │   ├── reducers/            # Redux reducers
│   │   ├── shared/              # 共享工具
│   │   └── index.tsx
│   └── package.json
│
├── pkg/                         # 共享 Go 包
│   ├── chart/                   # Chart 处理
│   ├── dbutils/                 # 数据库工具
│   ├── helm/                    # Helm 客户端
│   ├── kube/                    # K8s 客户端
│   └── tarutil/                 # Tar 工具
│
├── chart/                       # Helm Chart (开发用)
│   └── kubeapps/
│       ├── templates/
│       ├── values.yaml
│       └── Chart.yaml
│
├── integration/                 # E2E 测试
│   ├── tests/
│   └── playwright.config.js
│
├── script/                      # 构建和部署脚本
│   ├── makefiles/
│   └── linters/
│
├── site/                        # 文档网站
│   └── content/
│
├── go.mod                       # Go 依赖
├── Makefile                     # 构建脚本
└── README.md
```

## 核心组件详解

### 1. Kubeapps APIs (Go)

**职责**:
- 提供统一的 gRPC API
- 管理插件生命周期
- 处理认证和授权
- 多集群支持

**关键文件**:
- `cmd/kubeapps-apis/main.go` - 入口
- `cmd/kubeapps-apis/server/server.go` - gRPC 服务器
- `cmd/kubeapps-apis/core/packages/v1alpha1/packages.go` - 包管理 API

**插件系统**:
```go
// 插件接口
type Plugin interface {
    GetAvailablePackages(ctx context.Context, req *Request) (*Response, error)
    GetInstalledPackages(ctx context.Context, req *Request) (*Response, error)
    InstallPackage(ctx context.Context, req *Request) (*Response, error)
    // ...
}
```

### 2. Dashboard (React + TypeScript)

**职责**:
- 提供 Web UI
- 管理应用状态
- 与后端 API 通信

**关键文件**:
- `dashboard/src/index.tsx` - 入口
- `dashboard/src/components/` - UI 组件
- `dashboard/src/actions/` - Redux actions
- `dashboard/src/shared/` - 工具和服务

**技术栈**:
- React 17
- Redux + Redux Thunk
- TypeScript
- Clarity Design System
- gRPC-Web (Connect)

### 3. Apprepository Controller (Go)

**职责**:
- 监控 AppRepository CRD
- 触发 Chart 同步
- 管理仓库凭证

**关键文件**:
- `cmd/apprepository-controller/main.go`
- `cmd/apprepository-controller/server/controller.go`

### 4. Asset Syncer (Go)

**职责**:
- 同步 Chart 元数据到 PostgreSQL
- 处理 Chart 图标
- 缓存 Chart 信息

**关键文件**:
- `cmd/asset-syncer/main.go`
- `cmd/asset-syncer/server/sync.go`

### 5. Pinniped Proxy (Rust)

**职责**:
- Pinniped 认证集成
- Token 交换
- 代理 K8s API 请求

**关键文件**:
- `cmd/pinniped-proxy/src/main.rs`
- `cmd/pinniped-proxy/Cargo.toml`

### 6. OCI Catalog (Rust)

**职责**:
- OCI 镜像仓库支持
- 镜像元数据查询
- 镜像标签列表

**关键文件**:
- `cmd/oci-catalog/src/main.rs`
- `cmd/oci-catalog/Cargo.toml`

## 数据存储

### PostgreSQL
- Chart 元数据
- 仓库信息
- 缓存数据

### Redis
- 会话缓存
- 临时数据
- 速率限制

### Kubernetes
- AppRepository CRD
- HelmRelease (Flux)
- PackageInstall (Carvel)
- Secrets (凭证)

## 部署模式

### 1. 单集群模式
```
Kubeapps 部署在同一个集群中管理应用
```

### 2. 多集群模式
```
Kubeapps 部署在管理集群，管理多个目标集群
```

### 3. 全局包集群
```
Kubeapps 从专用集群获取包信息
```

## 关键特性

### 安全性
- RBAC 集成
- OIDC 认证
- Pinniped 支持
- TLS 加密
- Secret 管理

### 可扩展性
- 插件架构
- 多包管理器支持
- 自定义仓库
- API 扩展

### 用户体验
- 直观的 Web UI
- 实时状态更新
- 搜索和过滤
- 多语言支持

## 依赖关系

### Go 依赖 (主要)
```
- kubernetes (client-go, apimachinery)
- helm (helm.sh/helm/v3)
- flux (fluxcd.io)
- carvel (carvel.dev)
- grpc (google.golang.org/grpc)
- connect (github.com/bufbuild/connect-go)
- cobra (github.com/spf13/cobra)
- viper (github.com/spf13/viper)
```

### npm 依赖 (主要)
```
- react, react-dom
- redux, react-redux
- @connectrpc/connect-web
- @cds/core, @cds/react
- axios
- monaco-editor
- typescript
```

### Rust 依赖 (主要)
```
- tokio (异步运行时)
- tonic (gRPC)
- hyper (HTTP)
- serde (序列化)
```

## 版本信息

- **Go**: 1.23.2
- **Node**: 20.18.0
- **Rust**: latest stable
- **Kubernetes**: 1.24+
- **Helm**: 3.x

## 性能指标

### 资源需求
- **kubeapps-apis**: 256Mi RAM, 250m CPU
- **dashboard**: 128Mi RAM, 100m CPU
- **PostgreSQL**: 512Mi RAM, 250m CPU
- **Redis**: 256Mi RAM, 100m CPU

### 扩展性
- 支持数千个 Charts
- 支持数百个应用实例
- 支持多集群管理

## 限制和约束

1. **仅支持 Helm 3**: 不支持 Helm 2
2. **需要 RBAC**: 必须启用 Kubernetes RBAC
3. **浏览器要求**: 现代浏览器 (Chrome, Firefox, Safari, Edge)
4. **网络要求**: 需要访问 K8s API 和镜像仓库

## 下一步

- 阅读 [架构设计](./02-architecture.md)
- 设置 [开发环境](./03-development-setup.md)
- 了解 [构建流程](./04-build-deploy.md)
