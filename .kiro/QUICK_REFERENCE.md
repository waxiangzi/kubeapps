# Kubeapps 快速参考

## 常用命令

### 开发环境

```bash
# 设置环境
make cluster-kind              # 创建 Kind 集群
make deploy-dev                # 部署到开发环境

# 构建
make all                       # 构建所有组件
make kubeapps/dashboard        # 构建 Dashboard
make kubeapps/kubeapps-apis    # 构建 APIs

# 测试
make test                      # 运行 Go 测试
make test-dashboard            # 运行前端测试
cd integration && yarn test    # 运行 E2E 测试

# 代码质量
make lint                      # 运行所有 linter
make fmt                       # 格式化 Go 代码
cd dashboard && yarn lint      # 前端 lint
```

### Docker

```bash
# 构建镜像
export IMAGE_TAG=dev-$(date +%Y%m%d)
make all

# 加载到 Kind
kind load docker-image kubeapps/dashboard:${IMAGE_TAG} --name kubeapps

# 推送镜像
docker push your-registry/kubeapps/dashboard:${IMAGE_TAG}
```

### Kubernetes

```bash
# 部署
kubectl create namespace kubeapps
helm install kubeapps ./chart/kubeapps -n kubeapps

# 查看状态
kubectl get pods -n kubeapps
kubectl get svc -n kubeapps

# 查看日志
kubectl logs -n kubeapps -l app=kubeapps-apis
kubectl logs -n kubeapps -l app=kubeapps-dashboard

# 端口转发
kubectl port-forward -n kubeapps svc/kubeapps 8080:80

# 删除
helm uninstall kubeapps -n kubeapps
kubectl delete namespace kubeapps
```

## 项目结构速查

```
kubeapps/
├── cmd/                      # 微服务
│   ├── kubeapps-apis/       # 主 API (Go)
│   ├── apprepository-controller/  # 仓库控制器 (Go)
│   ├── asset-syncer/        # 资源同步 (Go)
│   ├── pinniped-proxy/      # 认证代理 (Rust)
│   └── oci-catalog/         # OCI 目录 (Rust)
├── dashboard/               # React 前端
├── pkg/                     # 共享 Go 包
├── chart/                   # Helm Chart
├── integration/             # E2E 测试
└── script/                  # 脚本
```

## 关键文件

| 文件 | 用途 |
|------|------|
| `go.mod` | Go 依赖 |
| `dashboard/package.json` | npm 依赖 |
| `Makefile` | 构建脚本 |
| `chart/kubeapps/values.yaml` | Helm 配置 |
| `cmd/kubeapps-apis/main.go` | API 入口 |
| `dashboard/src/index.tsx` | 前端入口 |

## API 端点

### gRPC API

```
kubeapps-apis:50051
├── /kubeappsapis.core.packages.v1alpha1.PackagesService
│   ├── GetAvailablePackageSummaries
│   ├── GetAvailablePackageDetail
│   ├── GetInstalledPackageSummaries
│   ├── CreateInstalledPackage
│   ├── UpdateInstalledPackage
│   └── DeleteInstalledPackage
└── /kubeappsapis.core.plugins.v1alpha1.PluginsService
    └── GetConfiguredPlugins
```

### REST API (通过 Gateway)

```
GET    /apis/core/packages/v1alpha1/availablepackages
GET    /apis/core/packages/v1alpha1/availablepackages/{id}
GET    /apis/core/packages/v1alpha1/installedpackages
POST   /apis/core/packages/v1alpha1/installedpackages
PUT    /apis/core/packages/v1alpha1/installedpackages/{id}
DELETE /apis/core/packages/v1alpha1/installedpackages/{id}
```

## 环境变量

### Kubeapps APIs

```bash
PORT=50051
CLUSTERS_CONFIG_PATH=/config/clusters.yaml
PLUGIN_CONFIG_PATH=/config/plugins.yaml
PINNIPED_PROXY_URL=http://pinniped-proxy:3333
GLOBAL_PACKAGING_NAMESPACE=kubeapps-global
```

### Asset Syncer

```bash
DB_HOST=postgresql
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=assets
REDIS_HOST=redis
REDIS_PORT=6379
```

### Dashboard

```bash
REACT_APP_API_URL=/apis
NODE_OPTIONS=--max-old-space-size=4096
```

## 配置文件

### clusters.yaml

```yaml
clusters:
  - name: default
    apiServiceURL: https://kubernetes.default.svc
    certificateAuthorityData: LS0tLS1...
    serviceToken: eyJhbGc...
```

### plugins.yaml

```yaml
plugins:
  - name: helm.packages
    version: v1alpha1
  - name: fluxv2.packages
    version: v1alpha1
```

### values.yaml (Helm)

```yaml
# 镜像配置
image:
  registry: docker.io
  repository: bitnami/kubeapps
  tag: latest

# 副本数
replicaCount: 1

# 资源限制
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

# 数据库
postgresql:
  enabled: true
  auth:
    password: password

# Redis
redis:
  enabled: true
```

## 故障排查

### Pod 无法启动

```bash
# 查看事件
kubectl describe pod -n kubeapps <pod-name>

# 查看日志
kubectl logs -n kubeapps <pod-name>

# 检查镜像
kubectl get pod -n kubeapps <pod-name> -o jsonpath='{.spec.containers[*].image}'
```

### API 连接失败

```bash
# 测试连接
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://kubeapps-internal-kubeappsapis.kubeapps.svc:8080/healthz

# 检查服务
kubectl get svc -n kubeapps
kubectl get endpoints -n kubeapps
```

### 数据库问题

```bash
# 连接数据库
kubectl exec -it -n kubeapps postgresql-0 -- psql -U postgres

# 检查表
\dt
SELECT * FROM charts LIMIT 10;

# 备份
kubectl exec -n kubeapps postgresql-0 -- \
  pg_dump -U postgres assets > backup.sql
```

## 性能优化

### 前端

```typescript
// 代码分割
const LazyComponent = React.lazy(() => import('./Component'));

// Memo 优化
const MemoizedComponent = React.memo(Component);

// useMemo
const expensiveValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// useCallback
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

### 后端

```go
// 并发处理
var wg sync.WaitGroup
for _, item := range items {
    wg.Add(1)
    go func(i Item) {
        defer wg.Done()
        process(i)
    }(item)
}
wg.Wait()

// 缓存
cache.Set(key, value, 5*time.Minute)

// 连接池
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(5)
```

## 安全最佳实践

### 1. 认证

```yaml
# 启用 OIDC
authProxy:
  enabled: true
  provider: oidc
  clientID: kubeapps
  clientSecret: ${OIDC_CLIENT_SECRET}
```

### 2. RBAC

```yaml
# 最小权限原则
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: kubeapps-user
rules:
  - apiGroups: [""]
    resources: ["configmaps", "secrets"]
    verbs: ["get", "list"]
```

### 3. 网络策略

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: kubeapps
spec:
  podSelector:
    matchLabels:
      app: kubeapps
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: nginx-ingress
```

## Kiro 命令速查

### 开发

```bash
# 设置环境
kiro-cli chat "设置 Kubeapps 开发环境"

# 构建项目
kiro-cli chat "构建所有组件"

# 运行测试
kiro-cli chat "运行完整测试套件"
```

### 调试

```bash
# 查看日志
kiro-cli chat "查看 kubeapps-apis 的日志"

# 排查问题
kiro-cli chat "为什么 Pod 一直重启？"

# 性能分析
kiro-cli chat "分析 API 响应慢的原因"
```

### 代码

```bash
# 添加功能
kiro-cli chat "添加新的 Helm 插件 API"

# 修复 Bug
kiro-cli chat "修复 token 存储的安全问题"

# 重构
kiro-cli chat "重构 utils.ts 文件"

# 代码审查
kiro-cli chat "审查 server.go 的代码质量"
```

### 文档

```bash
# 生成文档
kiro-cli chat "为 PackagesService 生成 API 文档"

# 更新文档
kiro-cli chat "更新部署文档"
```

## 有用的链接

- [官方文档](https://kubeapps.dev)
- [GitHub](https://github.com/vmware-tanzu/kubeapps)
- [Slack #kubeapps](https://kubernetes.slack.com/messages/kubeapps)
- [Bitnami Chart](https://github.com/bitnami/charts/tree/main/bitnami/kubeapps)

## 常见问题

### Q: 如何添加新的包管理器支持？

A: 实现 PackagesService 插件接口，参考 `cmd/kubeapps-apis/plugins/helm/`

### Q: 如何自定义 Dashboard 主题？

A: 修改 `dashboard/src/index.scss` 和 Clarity 变量

### Q: 如何配置多集群？

A: 在 `clusters.yaml` 中添加集群配置

### Q: 如何启用 Pinniped？

A: 设置 `pinnipedConfig.enabled: true` 在集群配置中

### Q: 如何备份数据？

A: 备份 PostgreSQL 数据库和 Kubernetes Secrets

## 版本兼容性

| Kubeapps | Kubernetes | Helm | Go | Node |
|----------|------------|------|-----|------|
| 2.x      | 1.24+      | 3.x  | 1.23| 20.x |

## 下一步

- 查看 [完整文档](./)
- 阅读 [架构设计](./02-architecture.md)
- 学习 [开发流程](./03-development-setup.md)
