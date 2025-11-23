# 架构设计

## 系统架构

### 高层架构

```
┌──────────────────────────────────────────────────────────────┐
│                         用户层                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ 浏览器   │  │  kubectl │  │  API客户端│                   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                   │
└───────┼─────────────┼─────────────┼─────────────────────────┘
        │             │             │
        │ HTTPS       │ K8s API     │ gRPC
        ▼             ▼             ▼
┌──────────────────────────────────────────────────────────────┐
│                      Ingress / Load Balancer                  │
└──────────────────────────────────────────────────────────────┘
        │                             │
        ▼                             ▼
┌─────────────────────┐     ┌─────────────────────────────────┐
│   Dashboard         │     │   Kubeapps APIs                 │
│   (React SPA)       │────▶│   (gRPC Server)                 │
│                     │     │                                 │
│  - UI Components    │     │  - Plugin Manager               │
│  - Redux Store      │     │  - Auth Middleware              │
│  - gRPC-Web Client  │     │  - Multi-cluster Support        │
└─────────────────────┘     └──────────┬──────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
        ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
        │  Helm Plugin     │ │ Flux Plugin  │ │ Kapp Plugin      │
        │  (Go)            │ │ (Go)         │ │ (Go)             │
        └────────┬─────────┘ └──────┬───────┘ └────────┬─────────┘
                 │                  │                  │
                 └──────────────────┴──────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────────┐
        │              Kubernetes API Server                    │
        │                                                       │
        │  - Helm Releases                                      │
        │  - Flux HelmReleases                                  │
        │  - Carvel PackageInstalls                             │
        │  - AppRepository CRDs                                 │
        └───────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Apprepository    │    │  Asset Syncer    │    │  Pinniped Proxy  │
│ Controller       │    │  (Go)            │    │  (Rust)          │
│ (Go)             │    │                  │    │                  │
└────────┬─────────┘    └────────┬─────────┘    └──────────────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         │              │   PostgreSQL     │
         │              │   (Chart Meta)   │
         │              └──────────────────┘
         │
         ▼
┌──────────────────┐
│   Redis          │
│   (Cache)        │
└──────────────────┘
```

## 核心组件详解

### 1. Dashboard (前端)

#### 技术栈
- **框架**: React 17 + TypeScript
- **状态管理**: Redux + Redux Thunk
- **UI 库**: Clarity Design System
- **路由**: React Router v6
- **API 通信**: gRPC-Web (Connect)
- **构建工具**: Craco (Create React App)

#### 组件架构

```
src/
├── components/          # UI 组件
│   ├── AppList/        # 应用列表
│   ├── AppView/        # 应用详情
│   ├── Catalog/        # 应用目录
│   ├── DeploymentForm/ # 部署表单
│   └── ...
├── actions/            # Redux Actions
│   ├── installedpackages.ts
│   ├── availablepackages.ts
│   └── ...
├── reducers/           # Redux Reducers
│   ├── installedpackages.ts
│   ├── availablepackages.ts
│   └── index.ts
├── shared/             # 共享工具
│   ├── Auth.ts         # 认证
│   ├── Kube.ts         # K8s 客户端
│   ├── PackagesService.ts
│   └── utils.ts
└── store/              # Redux Store
    └── index.ts
```

#### 数据流

```
用户操作 → Action Creator → Thunk Middleware → API Call → Reducer → Store → Component
```

#### 关键模块

**认证模块** (`shared/Auth.ts`):
```typescript
export class Auth {
  static getAuthToken(): string | null
  static setAuthToken(token: string, oidc: boolean): void
  static validateToken(cluster: string, token: string): Promise<void>
  static wsProtocols(): string[]
}
```

**包服务** (`shared/PackagesService.ts`):
```typescript
class PackagesService {
  getAvailablePackages(cluster: string, namespace: string): Promise<Package[]>
  getInstalledPackages(cluster: string, namespace: string): Promise<Package[]>
  installPackage(request: InstallRequest): Promise<InstalledPackage>
  upgradePackage(request: UpgradeRequest): Promise<InstalledPackage>
}
```

### 2. Kubeapps APIs (后端核心)

#### 技术栈
- **语言**: Go 1.23.2
- **框架**: gRPC + Connect
- **CLI**: Cobra
- **配置**: Viper
- **K8s 客户端**: client-go

#### 服务架构

```
cmd/kubeapps-apis/
├── cmd/                    # CLI 命令
│   └── root.go            # 根命令
├── core/                   # 核心服务
│   ├── packages/          # 包管理 API
│   │   └── v1alpha1/
│   │       ├── packages.go
│   │       └── repositories.go
│   └── plugins/           # 插件管理 API
│       └── v1alpha1/
│           └── plugins.go
├── plugins/               # 插件实现
│   ├── helm/             # Helm 插件
│   ├── fluxv2/           # Flux 插件
│   ├── kapp_controller/  # Carvel 插件
│   └── resources/        # 资源插件
├── server/               # gRPC 服务器
│   └── server.go
└── main.go
```

#### 插件系统

**插件接口**:
```go
// 包插件接口
type PackagesServiceServer interface {
    GetAvailablePackageSummaries(context.Context, *GetAvailablePackageSummariesRequest) (*GetAvailablePackageSummariesResponse, error)
    GetAvailablePackageDetail(context.Context, *GetAvailablePackageDetailRequest) (*GetAvailablePackageDetailResponse, error)
    GetInstalledPackageSummaries(context.Context, *GetInstalledPackageSummariesRequest) (*GetInstalledPackageSummariesResponse, error)
    CreateInstalledPackage(context.Context, *CreateInstalledPackageRequest) (*CreateInstalledPackageResponse, error)
    UpdateInstalledPackage(context.Context, *UpdateInstalledPackageRequest) (*UpdateInstalledPackageResponse, error)
    DeleteInstalledPackage(context.Context, *DeleteInstalledPackageRequest) (*DeleteInstalledPackageResponse, error)
}
```

**插件注册**:
```go
// 注册插件
func RegisterPlugins(serveOpts core.ServeOptions) error {
    // 注册 Helm 插件
    helmPlugin := helm.NewPlugin(serveOpts)
    pluginManager.Register("helm.packages", helmPlugin)
    
    // 注册 Flux 插件
    fluxPlugin := fluxv2.NewPlugin(serveOpts)
    pluginManager.Register("fluxv2.packages", fluxPlugin)
    
    // 注册 Kapp 插件
    kappPlugin := kapp.NewPlugin(serveOpts)
    pluginManager.Register("kapp_controller.packages", kappPlugin)
    
    return nil
}
```

#### gRPC 服务器

**服务器配置**:
```go
type ServeOptions struct {
    Port                    int
    PluginDirs              []string
    ClustersConfigPath      string
    PluginConfigPath        string
    PinnipedProxyURL        string
    GlobalPackagingNamespace string
    UnsafeLocalDevKubeconfig bool
}
```

**中间件**:
```go
// 日志中间件
func LogRequest(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error)

// 认证中间件
func AuthInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error)
```

### 3. Helm 插件

#### 职责
- 管理 Helm Charts
- 部署 Helm Releases
- 查询 Helm 仓库

#### 关键功能

```go
// Chart 客户端
type ChartClient interface {
    GetChart(details *ChartDetails, repoURL string) (*chart.Chart, error)
    GetChartVersion(details *ChartDetails, repoURL string) (*chart.Chart, error)
}

// Release 管理
type ReleaseManager interface {
    InstallRelease(namespace, name string, chart *chart.Chart, values map[string]interface{}) (*release.Release, error)
    UpgradeRelease(namespace, name string, chart *chart.Chart, values map[string]interface{}) (*release.Release, error)
    RollbackRelease(namespace, name string, revision int) error
    UninstallRelease(namespace, name string) error
}
```

### 4. Flux 插件

#### 职责
- 管理 Flux HelmRelease
- 监控 Flux 资源状态
- 集成 Flux Source Controller

#### CRD 集成

```go
// HelmRelease CRD
type HelmRelease struct {
    metav1.TypeMeta
    metav1.ObjectMeta
    Spec   HelmReleaseSpec
    Status HelmReleaseStatus
}

// 监控 HelmRelease
func (s *Server) watchHelmReleases(ctx context.Context, namespace string) error {
    watcher, err := s.fluxClient.HelmV2beta1().HelmReleases(namespace).Watch(ctx, metav1.ListOptions{})
    // ...
}
```

### 5. Apprepository Controller

#### 职责
- 监控 AppRepository CRD
- 触发 Chart 同步
- 管理仓库凭证

#### 控制器逻辑

```go
// AppRepository CRD
type AppRepository struct {
    metav1.TypeMeta
    metav1.ObjectMeta
    Spec   AppRepositorySpec
    Status AppRepositoryStatus
}

// 控制器循环
func (c *Controller) Run(stopCh <-chan struct{}) error {
    // 监听 AppRepository 变化
    c.informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
        AddFunc:    c.handleAdd,
        UpdateFunc: c.handleUpdate,
        DeleteFunc: c.handleDelete,
    })
    
    // 启动 informer
    go c.informer.Run(stopCh)
    
    // 等待缓存同步
    cache.WaitForCacheSync(stopCh, c.informer.HasSynced)
    
    // 处理队列
    for c.processNextItem() {
    }
    
    return nil
}
```

### 6. Asset Syncer

#### 职责
- 同步 Chart 元数据到 PostgreSQL
- 处理 Chart 图标
- 缓存 Chart 信息

#### 同步流程

```go
// 同步器
type Syncer struct {
    db       *sql.DB
    redis    *redis.Client
    repoURL  string
}

// 同步 Chart
func (s *Syncer) Sync(ctx context.Context, repo *AppRepository) error {
    // 1. 获取 index.yaml
    index, err := s.fetchIndex(repo.Spec.URL)
    
    // 2. 解析 Charts
    charts := s.parseCharts(index)
    
    // 3. 下载图标
    for _, chart := range charts {
        icon, err := s.downloadIcon(chart.Icon)
        chart.IconData = icon
    }
    
    // 4. 存储到数据库
    err = s.storeCharts(charts)
    
    // 5. 更新缓存
    err = s.updateCache(charts)
    
    return nil
}
```

### 7. Pinniped Proxy (Rust)

#### 职责
- Pinniped 认证集成
- Token 交换
- 代理 K8s API 请求

#### 架构

```rust
// 主服务
#[tokio::main]
async fn main() -> Result<()> {
    let config = Config::from_env()?;
    
    // 创建代理服务器
    let proxy = PinnipedProxy::new(config);
    
    // 启动 HTTP 服务器
    let addr = SocketAddr::from(([0, 0, 0, 0], 3333));
    Server::bind(&addr)
        .serve(make_service_fn(|_| {
            let proxy = proxy.clone();
            async move {
                Ok::<_, Infallible>(service_fn(move |req| {
                    proxy.clone().handle_request(req)
                }))
            }
        }))
        .await?;
    
    Ok(())
}

// Token 交换
async fn exchange_token(&self, token: &str) -> Result<String> {
    // 调用 Pinniped API 交换 token
    let response = self.pinniped_client
        .exchange_token(token)
        .await?;
    
    Ok(response.credential)
}
```

## 数据模型

### 核心实体

#### Package (包)
```protobuf
message AvailablePackageSummary {
  string name = 1;
  string display_name = 2;
  string latest_version = 3;
  string icon_url = 4;
  string short_description = 5;
  PackageAppVersion latest_app_version = 6;
  AvailablePackageReference available_package_ref = 7;
}
```

#### InstalledPackage (已安装包)
```protobuf
message InstalledPackageSummary {
  InstalledPackageReference installed_package_ref = 1;
  string name = 2;
  string icon_url = 3;
  PackageAppVersion pkg_version_reference = 4;
  PackageAppVersion current_version = 5;
  InstalledPackageStatus status = 6;
}
```

#### Repository (仓库)
```protobuf
message PackageRepository {
  string name = 1;
  string namespace = 2;
  string url = 3;
  PackageRepositoryAuth auth = 4;
  string type = 5;
  string description = 6;
}
```

### 数据库 Schema

#### PostgreSQL

```sql
-- Charts 表
CREATE TABLE charts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    repo_namespace VARCHAR(255) NOT NULL,
    description TEXT,
    home VARCHAR(255),
    icon TEXT,
    keywords TEXT[],
    maintainers JSONB,
    sources TEXT[],
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, repo_name, repo_namespace)
);

-- Chart Versions 表
CREATE TABLE chart_versions (
    id SERIAL PRIMARY KEY,
    chart_id INTEGER REFERENCES charts(id) ON DELETE CASCADE,
    version VARCHAR(255) NOT NULL,
    app_version VARCHAR(255),
    digest VARCHAR(255),
    urls TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(chart_id, version)
);

-- Chart Files 表
CREATE TABLE chart_files (
    id SERIAL PRIMARY KEY,
    chart_version_id INTEGER REFERENCES chart_versions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_content TEXT,
    UNIQUE(chart_version_id, file_name)
);
```

## 通信协议

### gRPC API

#### 包管理 API

```protobuf
service PackagesService {
  // 获取可用包列表
  rpc GetAvailablePackageSummaries(GetAvailablePackageSummariesRequest) 
    returns (GetAvailablePackageSummariesResponse);
  
  // 获取包详情
  rpc GetAvailablePackageDetail(GetAvailablePackageDetailRequest) 
    returns (GetAvailablePackageDetailResponse);
  
  // 获取已安装包列表
  rpc GetInstalledPackageSummaries(GetInstalledPackageSummariesRequest) 
    returns (GetInstalledPackageSummariesResponse);
  
  // 安装包
  rpc CreateInstalledPackage(CreateInstalledPackageRequest) 
    returns (CreateInstalledPackageResponse);
  
  // 更新包
  rpc UpdateInstalledPackage(UpdateInstalledPackageRequest) 
    returns (UpdateInstalledPackageResponse);
  
  // 删除包
  rpc DeleteInstalledPackage(DeleteInstalledPackageRequest) 
    returns (DeleteInstalledPackageResponse);
}
```

### REST API (通过 gRPC Gateway)

```
GET    /apis/core/packages/v1alpha1/availablepackages
GET    /apis/core/packages/v1alpha1/availablepackages/{identifier}
GET    /apis/core/packages/v1alpha1/installedpackages
POST   /apis/core/packages/v1alpha1/installedpackages
PUT    /apis/core/packages/v1alpha1/installedpackages/{identifier}
DELETE /apis/core/packages/v1alpha1/installedpackages/{identifier}
```

## 安全架构

### 认证流程

```
1. 用户登录 → OIDC Provider
2. 获取 ID Token
3. Dashboard 存储 Token
4. 每次请求携带 Token
5. Kubeapps APIs 验证 Token
6. 使用 Token 访问 K8s API
```

### 授权模型

```
Kubernetes RBAC
├── ClusterRole: kubeapps-admin
│   └── 所有资源的完全访问权限
├── ClusterRole: kubeapps-user
│   └── 命名空间内的资源访问权限
└── ClusterRole: kubeapps-viewer
    └── 只读访问权限
```

## 性能优化

### 缓存策略

1. **Redis 缓存**
   - Chart 列表缓存 (TTL: 5分钟)
   - 仓库索引缓存 (TTL: 10分钟)
   - 用户会话缓存

2. **浏览器缓存**
   - 静态资源 (1年)
   - API 响应 (根据 Cache-Control)

3. **数据库查询优化**
   - 索引优化
   - 查询缓存
   - 连接池

### 并发处理

```go
// 并发获取多个集群的包
func (s *Server) GetPackagesFromClusters(ctx context.Context, clusters []string) ([]*Package, error) {
    var wg sync.WaitGroup
    results := make(chan []*Package, len(clusters))
    errors := make(chan error, len(clusters))
    
    for _, cluster := range clusters {
        wg.Add(1)
        go func(c string) {
            defer wg.Done()
            pkgs, err := s.GetPackages(ctx, c)
            if err != nil {
                errors <- err
                return
            }
            results <- pkgs
        }(cluster)
    }
    
    wg.Wait()
    close(results)
    close(errors)
    
    // 合并结果
    var allPackages []*Package
    for pkgs := range results {
        allPackages = append(allPackages, pkgs...)
    }
    
    return allPackages, nil
}
```

## 扩展性设计

### 插件扩展

```go
// 自定义插件
type CustomPlugin struct {
    config PluginConfig
}

func (p *CustomPlugin) GetAvailablePackages(ctx context.Context, req *Request) (*Response, error) {
    // 自定义实现
    return &Response{}, nil
}

// 注册插件
pluginManager.Register("custom.packages", &CustomPlugin{})
```

### API 扩展

```protobuf
// 自定义 API
service CustomService {
  rpc CustomMethod(CustomRequest) returns (CustomResponse);
}
```

## 下一步

- 设置 [开发环境](./03-development-setup.md)
- 了解 [构建流程](./04-build-deploy.md)
- 查看 [API 文档](./07-api-reference.md)
