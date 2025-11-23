# 代码规范

## Go 代码规范

### 风格指南

遵循 [Effective Go](https://golang.org/doc/effective_go.html) 和 [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)

### 命名规范

```go
// ✅ 包名：小写，单个单词
package kube

// ✅ 接口名：名词，通常以 -er 结尾
type ChartClient interface{}
type PackageManager interface{}

// ✅ 结构体：驼峰命名
type ClusterConfig struct{}

// ✅ 函数：驼峰命名，动词开头
func GetPackages() {}
func CreateRelease() {}

// ✅ 常量：驼峰命名或全大写
const MaxRetries = 3
const DEFAULT_TIMEOUT = 30

// ✅ 私有成员：小写开头
type server struct {
    port int
    host string
}
```

### 代码组织

```go
// 文件结构顺序
package kube

import (
    // 标准库
    "context"
    "fmt"
    
    // 第三方库
    "github.com/spf13/cobra"
    "k8s.io/client-go/kubernetes"
    
    // 本地包
    "github.com/vmware-tanzu/kubeapps/pkg/chart"
)

// 常量
const (
    DefaultPort = 8080
)

// 变量
var (
    ErrNotFound = errors.New("not found")
)

// 类型定义
type Config struct {
    Port int
}

// 构造函数
func NewConfig() *Config {
    return &Config{}
}

// 方法
func (c *Config) Validate() error {
    return nil
}

// 函数
func ParseConfig(data []byte) (*Config, error) {
    return nil, nil
}
```

### 错误处理

```go
// ✅ 返回错误
func GetChart(name string) (*Chart, error) {
    if name == "" {
        return nil, fmt.Errorf("chart name cannot be empty")
    }
    return &Chart{}, nil
}

// ✅ 包装错误
func ProcessChart(name string) error {
    chart, err := GetChart(name)
    if err != nil {
        return fmt.Errorf("failed to get chart %s: %w", name, err)
    }
    return nil
}

// ✅ 自定义错误
type ValidationError struct {
    Field string
    Value interface{}
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("invalid %s: %v", e.Field, e.Value)
}
```

### 注释

```go
// Package kube provides Kubernetes client utilities.
package kube

// ClusterConfig contains configuration for a Kubernetes cluster.
// It includes authentication details and connection settings.
type ClusterConfig struct {
    // Name is the unique identifier for the cluster
    Name string
    
    // APIServiceURL is the Kubernetes API server URL
    APIServiceURL string
}

// NewClusterConfig creates a new ClusterConfig with default values.
func NewClusterConfig(name string) *ClusterConfig {
    return &ClusterConfig{
        Name: name,
    }
}

// Validate checks if the configuration is valid.
// It returns an error if any required field is missing.
func (c *ClusterConfig) Validate() error {
    if c.Name == "" {
        return fmt.Errorf("cluster name is required")
    }
    return nil
}
```

### Linting

```bash
# 运行 golangci-lint
golangci-lint run ./...

# 配置文件 .golangci.yml
linters:
  enable:
    - gofmt
    - goimports
    - govet
    - errcheck
    - staticcheck
    - unused
    - gosimple
    - ineffassign
```

## TypeScript/React 代码规范

### 风格指南

遵循 [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) 和 [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### 命名规范

```typescript
// ✅ 组件：PascalCase
export const AppList: React.FC = () => {};

// ✅ 函数：camelCase
export function getAuthToken(): string | null {}

// ✅ 接口：PascalCase，以 I 开头
export interface IConfig {
  apiUrl: string;
}

// ✅ 类型：PascalCase
export type PackageStatus = 'deployed' | 'failed' | 'pending';

// ✅ 常量：UPPER_SNAKE_CASE
export const API_BASE_URL = '/api';

// ✅ 枚举：PascalCase
export enum PackageType {
  Helm = 'helm',
  Flux = 'flux',
  Carvel = 'carvel',
}
```

### 组件结构

```typescript
// AppList.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IStoreState } from '../../shared/types';
import { fetchPackages } from '../../actions/packages';
import './AppList.scss';

// Props 接口
interface IAppListProps {
  namespace: string;
  cluster: string;
}

// 组件
export const AppList: React.FC<IAppListProps> = ({ namespace, cluster }) => {
  const dispatch = useDispatch();
  const packages = useSelector((state: IStoreState) => state.packages.items);
  const [filter, setFilter] = useState('');
  
  useEffect(() => {
    dispatch(fetchPackages(cluster, namespace));
  }, [dispatch, cluster, namespace]);
  
  const filteredPackages = packages.filter(pkg => 
    pkg.name.includes(filter)
  );
  
  return (
    <div className="app-list">
      <input
        type="text"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter packages..."
      />
      <ul>
        {filteredPackages.map(pkg => (
          <li key={pkg.id}>{pkg.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Hooks 使用

```typescript
// ✅ 自定义 Hook
export function usePackages(cluster: string, namespace: string) {
  const dispatch = useDispatch();
  const packages = useSelector((state: IStoreState) => state.packages.items);
  const loading = useSelector((state: IStoreState) => state.packages.isFetching);
  
  useEffect(() => {
    dispatch(fetchPackages(cluster, namespace));
  }, [dispatch, cluster, namespace]);
  
  return { packages, loading };
}

// 使用
const MyComponent: React.FC = () => {
  const { packages, loading } = usePackages('default', 'default');
  
  if (loading) return <div>Loading...</div>;
  return <div>{packages.length} packages</div>;
};
```

### Redux Actions

```typescript
// actions/packages.ts
import { ThunkAction } from 'redux-thunk';
import { IStoreState } from '../shared/types';
import { deprecated } from 'typesafe-actions';

const { createAction } = deprecated;

// Action Creators
export const requestPackages = createAction('REQUEST_PACKAGES');
export const receivePackages = createAction('RECEIVE_PACKAGES', resolve => {
  return (packages: Package[]) => resolve(packages);
});
export const errorPackages = createAction('ERROR_PACKAGES', resolve => {
  return (error: Error) => resolve(error);
});

// Thunk Action
export function fetchPackages(
  cluster: string,
  namespace: string
): ThunkAction<Promise<void>, IStoreState, null, any> {
  return async dispatch => {
    dispatch(requestPackages());
    try {
      const packages = await PackagesService.getPackages(cluster, namespace);
      dispatch(receivePackages(packages));
    } catch (error) {
      dispatch(errorPackages(error as Error));
    }
  };
}
```

### Linting

```bash
# ESLint
bun eslint

# Prettier
bun prettier

# TypeScript 检查
bun ts-compile-check
```

```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Rust 代码规范

### 风格指南

遵循 [Rust Style Guide](https://doc.rust-lang.org/1.0.0/style/)

### 命名规范

```rust
// ✅ 模块：snake_case
mod pinniped_proxy;

// ✅ 结构体：PascalCase
struct PinnipedProxy {}

// ✅ 函数：snake_case
fn exchange_token() {}

// ✅ 常量：UPPER_SNAKE_CASE
const MAX_RETRIES: u32 = 3;

// ✅ 枚举：PascalCase
enum AuthMethod {
    Token,
    Certificate,
}
```

### 代码组织

```rust
// main.rs
use std::net::SocketAddr;
use tokio::net::TcpListener;

// 模块声明
mod config;
mod proxy;
mod auth;

// 使用声明
use config::Config;
use proxy::PinnipedProxy;

// 主函数
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::from_env()?;
    let proxy = PinnipedProxy::new(config);
    
    let addr = SocketAddr::from(([0, 0, 0, 0], 3333));
    let listener = TcpListener::bind(addr).await?;
    
    proxy.serve(listener).await?;
    
    Ok(())
}
```

### Linting

```bash
# Clippy
cargo clippy -- -D warnings

# Format
cargo fmt

# 配置文件 .rustfmt.toml
max_width = 100
tab_spaces = 4
```

## Protobuf 规范

### 文件结构

```protobuf
// proto/kubeappsapis/core/packages/v1alpha1/packages.proto
syntax = "proto3";

package kubeappsapis.core.packages.v1alpha1;

option go_package = "github.com/vmware-tanzu/kubeapps/cmd/kubeapps-apis/gen/core/packages/v1alpha1";

import "google/api/annotations.proto";
import "protoc-gen-openapiv2/options/annotations.proto";

// 服务定义
service PackagesService {
  // GetAvailablePackageSummaries returns the available packages.
  rpc GetAvailablePackageSummaries(GetAvailablePackageSummariesRequest) 
    returns (GetAvailablePackageSummariesResponse) {
    option (google.api.http) = {
      get: "/core/packages/v1alpha1/availablepackages"
    };
  }
}

// 消息定义
message GetAvailablePackageSummariesRequest {
  // Context specifies the cluster and namespace.
  Context context = 1;
  
  // FilterOptions specifies the filters to apply.
  FilterOptions filter_options = 2;
  
  // PaginationOptions specifies the pagination.
  PaginationOptions pagination_options = 3;
}
```

### 命名规范

```protobuf
// ✅ 服务：PascalCase，以 Service 结尾
service PackagesService {}

// ✅ RPC 方法：PascalCase，动词开头
rpc GetPackages() returns (GetPackagesResponse);
rpc CreatePackage() returns (CreatePackageResponse);

// ✅ 消息：PascalCase
message Package {}
message PackageList {}

// ✅ 字段：snake_case
message Package {
  string package_name = 1;
  string display_name = 2;
}

// ✅ 枚举：PascalCase
enum PackageStatus {
  PACKAGE_STATUS_UNSPECIFIED = 0;
  PACKAGE_STATUS_DEPLOYED = 1;
  PACKAGE_STATUS_FAILED = 2;
}
```

## Git 提交规范

### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

### 示例

```
feat(helm): add support for OCI registries

Implement OCI registry support for Helm charts.
This allows users to pull charts from OCI-compliant registries.

Closes #1234
```

## 代码审查清单

### Go

- [ ] 遵循 Go 代码规范
- [ ] 所有导出的函数/类型有注释
- [ ] 错误处理正确
- [ ] 有单元测试
- [ ] 测试覆盖率 > 80%
- [ ] 通过 golangci-lint
- [ ] 没有 race condition

### TypeScript/React

- [ ] 遵循 TypeScript 规范
- [ ] 组件有 Props 类型定义
- [ ] 使用 Hooks 而非 Class 组件
- [ ] 有单元测试
- [ ] 通过 ESLint 和 Prettier
- [ ] 没有 console.log

### 通用

- [ ] 代码可读性好
- [ ] 没有硬编码的值
- [ ] 敏感信息不在代码中
- [ ] 有适当的日志
- [ ] 性能考虑
- [ ] 安全考虑

## Kiro 辅助命令

```bash
# 检查代码规范
kiro-cli chat "检查代码是否符合规范"

# 格式化代码
kiro-cli chat "格式化所有 Go 代码"

# 修复 lint 问题
kiro-cli chat "修复 ESLint 报告的所有问题"

# 生成注释
kiro-cli chat "为 ClusterConfig 结构体生成文档注释"

# 重构代码
kiro-cli chat "重构 utils.ts 以符合代码规范"
```
