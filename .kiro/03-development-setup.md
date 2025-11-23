# 开发环境设置

## 系统要求

### 硬件要求
- **CPU**: 4核以上
- **内存**: 16GB 以上
- **磁盘**: 50GB 可用空间

### 操作系统
- macOS 12+
- Linux (Ubuntu 20.04+, Fedora 35+)
- Windows 10/11 (WSL2)

## 必需工具

### 1. Go 开发环境

```bash
# 安装 Go 1.23.2
# macOS
brew install go@1.23

# Linux
wget https://go.dev/dl/go1.23.2.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.23.2.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# 验证安装
go version  # 应显示 go version go1.23.2
```

### 2. Node.js 开发环境

```bash
# 安装 Node.js 20.18.0
# 使用 nvm (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20.18.0
nvm use 20.18.0

# 或使用 brew (macOS)
brew install node@20

# 安装 Bun
npm install -g yarn

# 验证安装
node --version  # v20.18.0
bun --version  # 1.22.x
```

### 3. Rust 开发环境

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 验证安装
rustc --version
cargo --version
```

### 4. Docker

```bash
# macOS
brew install --cask docker

# Linux (Ubuntu)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker-compose --version
```

### 5. Kubernetes 工具

```bash
# kubectl
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# kind (Kubernetes in Docker)
# macOS
brew install kind

# Linux
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Helm
# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# 验证安装
kubectl version --client
kind version
helm version
```

### 6. 开发工具

```bash
# buf (Protobuf 工具)
# macOS
brew install bufbuild/buf/buf

# Linux
BUF_VERSION=1.45.0
curl -sSL "https://github.com/bufbuild/buf/releases/download/v${BUF_VERSION}/buf-Linux-x86_64" -o /tmp/buf
chmod +x /tmp/buf
sudo mv /tmp/buf /usr/local/bin/buf

# golangci-lint
# macOS
brew install golangci-lint

# Linux
curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.61.0

# 验证安装
buf --version
golangci-lint --version
```

## 项目设置

### 1. 克隆仓库

```bash
# 克隆项目
git clone https://github.com/vmware-tanzu/kubeapps.git
cd kubeapps

# 或者如果是 fork
git clone https://github.com/YOUR_USERNAME/kubeapps.git
cd kubeapps
```

### 2. 安装 Go 依赖

```bash
# 下载依赖
go mod download

# 验证依赖
go mod verify

# 整理依赖
go mod tidy
```

### 3. 安装 Node.js 依赖

```bash
# 进入 dashboard 目录
cd dashboard

# 安装依赖
bun install --frozen-lockfile

# 返回根目录
cd ..
```

### 4. 安装 Rust 依赖

```bash
# pinniped-proxy
cd cmd/pinniped-proxy
cargo build
cd ../..

# oci-catalog
cd cmd/oci-catalog
cargo build
cd ../..
```

## 本地开发环境

### 方式 1: 使用 Kind 集群 (推荐)

```bash
# 创建 Kind 集群
make cluster-kind

# 这会创建一个名为 kubeapps 的集群
# 配置文件在 script/makefiles/cluster-kind.mk

# 验证集群
kubectl cluster-info --context kind-kubeapps
kubectl get nodes
```

### 方式 2: 使用现有集群

```bash
# 配置 kubectl 指向你的集群
export KUBECONFIG=/path/to/your/kubeconfig

# 验证连接
kubectl cluster-info
kubectl get nodes
```

## 数据库设置

### PostgreSQL

```bash
# 使用 Docker 运行 PostgreSQL
docker run --name kubeapps-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=kubeapps \
  -p 5432:5432 \
  -d postgres:14

# 验证连接
psql -h localhost -U postgres -d kubeapps
```

### Redis

```bash
# 使用 Docker 运行 Redis
docker run --name kubeapps-redis \
  -p 6379:6379 \
  -d redis:7

# 验证连接
redis-cli ping  # 应返回 PONG
```

## IDE 配置

### VS Code

**推荐扩展**:
```json
{
  "recommendations": [
    "golang.go",
    "rust-lang.rust-analyzer",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-azuretools.vscode-docker",
    "ms-kubernetes-tools.vscode-kubernetes-tools",
    "bufbuild.vscode-buf"
  ]
}
```

**工作区设置** (`.vscode/settings.json`):
```json
{
  "go.useLanguageServer": true,
  "go.lintTool": "golangci-lint",
  "go.lintOnSave": "workspace",
  "editor.formatOnSave": true,
  "[go]": {
    "editor.defaultFormatter": "golang.go"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### GoLand / IntelliJ IDEA

1. 打开项目
2. 配置 Go SDK (1.23.2)
3. 启用 Go Modules
4. 配置 Protobuf 支持
5. 安装 Kubernetes 插件

## 环境变量

创建 `.env` 文件:

```bash
# Kubernetes
export KUBECONFIG=~/.kube/config

# Go
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

# Node
export NODE_OPTIONS=--max-old-space-size=4096

# 数据库
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=password
export DB_NAME=kubeapps

# Redis
export REDIS_HOST=localhost
export REDIS_PORT=6379

# 开发模式
export DEV_MODE=true
export LOG_LEVEL=debug
```

加载环境变量:
```bash
source .env
```

## 验证设置

### 运行检查脚本

```bash
# 检查所有工具
./script/check-dev-env.sh
```

或手动检查:

```bash
# Go
go version
go env GOPATH

# Node
node --version
bun --version

# Rust
rustc --version
cargo --version

# Docker
docker --version
docker ps

# Kubernetes
kubectl version --client
kind version
helm version

# 开发工具
buf --version
golangci-lint --version

# 数据库
psql -h localhost -U postgres -c "SELECT version();"
redis-cli ping
```

### 构建测试

```bash
# 构建 Go 服务
make test

# 构建 Dashboard
cd dashboard
bun build
cd ..

# 构建 Rust 服务
cd cmd/pinniped-proxy
cargo build
cd ../..
```

## 常见问题

### Go 模块问题

```bash
# 清理缓存
go clean -modcache

# 重新下载
go mod download
```

### Node 模块问题

```bash
# 清理缓存
cd dashboard
rm -rf node_modules yarn.lock
bun cache clean
bun install
cd ..
```

### Docker 权限问题 (Linux)

```bash
# 添加用户到 docker 组
sudo usermod -aG docker $USER
newgrp docker
```

### Kind 集群问题

```bash
# 删除并重建集群
kind delete cluster --name kubeapps
make cluster-kind
```

## 下一步

- 了解 [构建流程](./04-build-deploy.md)
- 查看 [测试策略](./05-testing.md)
- 阅读 [代码规范](./06-code-standards.md)

## Kiro 辅助命令

```bash
# 使用 Kiro 设置环境
kiro-cli chat "检查我的开发环境是否满足 Kubeapps 的要求"

# 安装缺失的工具
kiro-cli chat "安装 Kubeapps 开发所需的所有工具"

# 创建本地集群
kiro-cli chat "创建一个 Kind 集群用于 Kubeapps 开发"

# 排查环境问题
kiro-cli chat "我的 Go 模块下载失败，如何解决？"
```
