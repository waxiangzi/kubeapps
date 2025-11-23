# 构建与部署

## 构建流程

### 快速构建

```bash
# 构建所有组件
make all

# 构建特定组件
make kubeapps/dashboard
make kubeapps/kubeapps-apis
make kubeapps/apprepository-controller
make kubeapps/asset-syncer
make kubeapps/pinniped-proxy
make kubeapps/oci-catalog
```

### 详细构建步骤

#### 1. Dashboard (React)

```bash
cd dashboard

# 安装依赖
bun install --frozen-lockfile

# 开发模式
bun start  # 启动开发服务器 (http://localhost:3000)

# 生产构建
bun build  # 输出到 build/

# 代码检查
bun lint
bun prettier-check
bun ts-compile-check

# 测试
bun test

cd ..
```

#### 2. Kubeapps APIs (Go)

```bash
# 生成 Protobuf 代码
cd cmd/kubeapps-apis
buf generate
cd ../..

# 构建二进制
go build -o kubeapps-apis ./cmd/kubeapps-apis

# 或使用 Docker
docker build -t kubeapps/kubeapps-apis:dev \
  -f cmd/kubeapps-apis/Dockerfile .

# 运行
./kubeapps-apis serve \
  --port=50051 \
  --clusters-config-path=./clusters.yaml
```

#### 3. Apprepository Controller (Go)

```bash
# 构建
go build -o apprepository-controller \
  ./cmd/apprepository-controller

# Docker 构建
docker build -t kubeapps/apprepository-controller:dev \
  -f cmd/apprepository-controller/Dockerfile .
```

#### 4. Asset Syncer (Go)

```bash
# 构建
go build -o asset-syncer ./cmd/asset-syncer

# Docker 构建
docker build -t kubeapps/asset-syncer:dev \
  -f cmd/asset-syncer/Dockerfile .
```

#### 5. Pinniped Proxy (Rust)

```bash
cd cmd/pinniped-proxy

# 开发构建
cargo build

# 发布构建
cargo build --release

# Docker 构建
docker build -t kubeapps/pinniped-proxy:dev -f Dockerfile .

cd ../..
```

#### 6. OCI Catalog (Rust)

```bash
cd cmd/oci-catalog

# 生成 Protobuf 代码
buf generate

# 构建
cargo build --release

# Docker 构建
docker build -t kubeapps/oci-catalog:dev -f Dockerfile .

cd ../..
```

## Docker 镜像

### 构建所有镜像

```bash
# 设置镜像标签
export IMAGE_TAG=dev-$(date +%Y%m%d-%H%M%S)

# 构建所有镜像
make all

# 查看镜像
docker images | grep kubeapps
```

### 推送到镜像仓库

```bash
# 登录 Docker Hub
docker login

# 标记镜像
docker tag kubeapps/dashboard:${IMAGE_TAG} your-registry/kubeapps/dashboard:${IMAGE_TAG}

# 推送镜像
docker push your-registry/kubeapps/dashboard:${IMAGE_TAG}

# 批量推送
for component in dashboard kubeapps-apis apprepository-controller asset-syncer pinniped-proxy oci-catalog; do
  docker tag kubeapps/${component}:${IMAGE_TAG} your-registry/kubeapps/${component}:${IMAGE_TAG}
  docker push your-registry/kubeapps/${component}:${IMAGE_TAG}
done
```

### 多架构构建

```bash
# 设置目标架构
export TARGET_ARCHITECTURE=arm64

# 构建
make all

# 支持的架构
# amd64, arm64, riscv64, ppc64le, s390x, 386, arm/v7, arm/v6
```

## 本地部署

### 使用 Kind 集群

#### 1. 创建集群

```bash
# 创建 Kind 集群
make cluster-kind

# 验证集群
kubectl cluster-info --context kind-kubeapps
```

#### 2. 加载镜像到 Kind

```bash
# 加载所有镜像
for component in dashboard kubeapps-apis apprepository-controller asset-syncer pinniped-proxy oci-catalog; do
  kind load docker-image kubeapps/${component}:${IMAGE_TAG} --name kubeapps
done
```

#### 3. 部署 Kubeapps

```bash
# 使用开发 Makefile
make deploy-dev

# 或手动部署
kubectl create namespace kubeapps

# 部署 PostgreSQL
kubectl apply -f chart/kubeapps/templates/postgresql.yaml

# 部署 Redis
kubectl apply -f chart/kubeapps/templates/redis.yaml

# 部署 Kubeapps 组件
kubectl apply -f chart/kubeapps/templates/
```

#### 4. 访问 Dashboard

```bash
# 端口转发
kubectl port-forward -n kubeapps svc/kubeapps 8080:80

# 访问 http://localhost:8080
```

### 使用 Helm Chart

#### 开发 Chart

```bash
# 使用本地 Chart
helm install kubeapps ./chart/kubeapps \
  --namespace kubeapps \
  --create-namespace \
  --set image.tag=${IMAGE_TAG} \
  --set image.pullPolicy=Never
```

#### 生产 Chart (Bitnami)

```bash
# 添加 Bitnami 仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# 安装
helm install kubeapps bitnami/kubeapps \
  --namespace kubeapps \
  --create-namespace

# 自定义配置
helm install kubeapps bitnami/kubeapps \
  --namespace kubeapps \
  --create-namespace \
  --values custom-values.yaml
```

## 配置

### Kubeapps APIs 配置

**命令行参数**:
```bash
./kubeapps-apis serve \
  --port=50051 \
  --clusters-config-path=/config/clusters.yaml \
  --plugin-config-path=/config/plugins.yaml \
  --pinniped-proxy-url=http://pinniped-proxy:3333 \
  --global-packaging-namespace=kubeapps-global
```

**集群配置** (`clusters.yaml`):
```yaml
clusters:
  - name: default
    apiServiceURL: https://kubernetes.default.svc
    certificateAuthorityData: LS0tLS1...
    serviceToken: eyJhbGc...
    
  - name: remote-cluster
    apiServiceURL: https://remote-cluster.example.com
    certificateAuthorityData: LS0tLS1...
    pinnipedConfig:
      enabled: true
      namespace: pinniped-concierge
      authenticatorType: JWTAuthenticator
      authenticatorName: jwt-authenticator
```

**插件配置** (`plugins.yaml`):
```yaml
plugins:
  - name: helm.packages
    version: v1alpha1
    
  - name: fluxv2.packages
    version: v1alpha1
    
  - name: kapp_controller.packages
    version: v1alpha1
```

### Dashboard 配置

**运行时配置** (`public/config.json`):
```json
{
  "kubeappsCluster": "default",
  "kubeappsNamespace": "kubeapps",
  "appVersion": "v2.0.0",
  "authProxyEnabled": false,
  "oauthLoginURI": "/oauth2/start",
  "oauthLogoutURI": "/oauth2/sign_out",
  "authProxySkipLoginPage": false,
  "clusters": ["default"],
  "theme": "light",
  "remoteComponentsUrl": ""
}
```

### 环境变量

```bash
# Kubeapps APIs
export PORT=50051
export CLUSTERS_CONFIG_PATH=/config/clusters.yaml
export PLUGIN_CONFIG_PATH=/config/plugins.yaml

# Asset Syncer
export DB_HOST=postgresql
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=password
export DB_NAME=assets

# Apprepository Controller
export KUBECONFIG=/root/.kube/config
export NAMESPACE=kubeapps
```

## 生产部署

### 前置要求

1. **Kubernetes 集群**: 1.24+
2. **Helm**: 3.x
3. **存储**: PersistentVolume 支持
4. **Ingress**: Nginx Ingress Controller 或类似

### 部署步骤

#### 1. 准备命名空间

```bash
kubectl create namespace kubeapps
```

#### 2. 配置 Ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kubeapps
  namespace: kubeapps
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - kubeapps.example.com
      secretName: kubeapps-tls
  rules:
    - host: kubeapps.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: kubeapps
                port:
                  number: 80
```

#### 3. 配置 OIDC

```yaml
# values.yaml
authProxy:
  enabled: true
  provider: oidc
  clientID: kubeapps
  clientSecret: your-client-secret
  cookieSecret: random-secret-string
  additionalFlags:
    - --oidc-issuer-url=https://your-oidc-provider.com
    - --scope=openid email profile groups
```

#### 4. 部署

```bash
# 使用自定义配置
helm install kubeapps bitnami/kubeapps \
  --namespace kubeapps \
  --values values.yaml \
  --set postgresql.enabled=true \
  --set postgresql.auth.password=secure-password \
  --set redis.enabled=true
```

#### 5. 验证部署

```bash
# 检查 Pods
kubectl get pods -n kubeapps

# 检查服务
kubectl get svc -n kubeapps

# 检查 Ingress
kubectl get ingress -n kubeapps

# 查看日志
kubectl logs -n kubeapps -l app=kubeapps
```

### 高可用配置

```yaml
# values.yaml
replicaCount: 3

frontend:
  replicaCount: 3

kubeappsapis:
  replicaCount: 3

postgresql:
  replication:
    enabled: true
    numSynchronousReplicas: 1
    synchronousCommit: "on"
  
redis:
  master:
    persistence:
      enabled: true
  replica:
    replicaCount: 2
    persistence:
      enabled: true

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - kubeapps
          topologyKey: kubernetes.io/hostname
```

## 升级

### Helm 升级

```bash
# 获取当前配置
helm get values kubeapps -n kubeapps > current-values.yaml

# 升级
helm upgrade kubeapps bitnami/kubeapps \
  --namespace kubeapps \
  --values current-values.yaml \
  --version 14.0.0

# 回滚
helm rollback kubeapps -n kubeapps
```

### 数据库迁移

```bash
# 备份数据库
kubectl exec -n kubeapps postgresql-0 -- \
  pg_dump -U postgres assets > backup.sql

# 恢复数据库
kubectl exec -i -n kubeapps postgresql-0 -- \
  psql -U postgres assets < backup.sql
```

## 监控

### Prometheus Metrics

```yaml
# ServiceMonitor
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: kubeapps
  namespace: kubeapps
spec:
  selector:
    matchLabels:
      app: kubeapps
  endpoints:
    - port: metrics
      interval: 30s
```

### 日志收集

```yaml
# Fluentd 配置
<source>
  @type tail
  path /var/log/containers/kubeapps-*.log
  pos_file /var/log/kubeapps.log.pos
  tag kubeapps.*
  <parse>
    @type json
  </parse>
</source>

<match kubeapps.**>
  @type elasticsearch
  host elasticsearch.logging.svc
  port 9200
  index_name kubeapps
</match>
```

## 故障排查

### 常见问题

#### Pods 无法启动

```bash
# 查看 Pod 状态
kubectl describe pod -n kubeapps <pod-name>

# 查看日志
kubectl logs -n kubeapps <pod-name>

# 检查镜像拉取
kubectl get events -n kubeapps --sort-by='.lastTimestamp'
```

#### 数据库连接失败

```bash
# 测试连接
kubectl run -it --rm debug --image=postgres:14 --restart=Never -- \
  psql -h postgresql.kubeapps.svc -U postgres -d assets

# 检查 Secret
kubectl get secret -n kubeapps postgresql -o yaml
```

#### API 无法访问

```bash
# 检查服务
kubectl get svc -n kubeapps kubeapps-internal-kubeappsapis

# 端口转发测试
kubectl port-forward -n kubeapps svc/kubeapps-internal-kubeappsapis 50051:8080

# 测试 gRPC
grpcurl -plaintext localhost:50051 list
```

## Kiro 辅助命令

```bash
# 构建项目
kiro-cli chat "构建所有 Kubeapps 组件"

# 部署到 Kind
kiro-cli chat "在 Kind 集群中部署 Kubeapps"

# 排查部署问题
kiro-cli chat "Kubeapps Pod 一直处于 CrashLoopBackOff 状态，如何排查？"

# 升级部署
kiro-cli chat "升级 Kubeapps 到最新版本"

# 配置 OIDC
kiro-cli chat "配置 Kubeapps 使用 Keycloak 作为 OIDC 提供商"
```

## 下一步

- 了解 [测试策略](./05-testing.md)
- 查看 [故障排查](./08-troubleshooting.md)
- 阅读 [维护指南](./09-maintenance.md)
