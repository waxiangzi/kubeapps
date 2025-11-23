# 测试策略

## 测试金字塔

```
        ┌─────────────┐
        │   E2E Tests │  (10%)
        └─────────────┘
      ┌─────────────────┐
      │ Integration Tests│  (20%)
      └─────────────────┘
    ┌───────────────────────┐
    │    Unit Tests         │  (70%)
    └───────────────────────┘
```

## 单元测试

### Go 测试

#### 运行测试

```bash
# 所有测试
go test ./...

# 特定包
go test ./pkg/kube

# 带覆盖率
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# 详细输出
go test -v ./...

# 并行测试
go test -parallel 4 ./...
```

#### 编写测试

```go
// pkg/kube/cluster_config_test.go
package kube

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestClusterConfig_Validate(t *testing.T) {
    tests := []struct {
        name    string
        config  ClusterConfig
        wantErr bool
    }{
        {
            name: "valid config",
            config: ClusterConfig{
                Name:          "test",
                APIServiceURL: "https://api.example.com",
            },
            wantErr: false,
        },
        {
            name: "missing name",
            config: ClusterConfig{
                APIServiceURL: "https://api.example.com",
            },
            wantErr: true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.config.Validate()
            if tt.wantErr {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
            }
        })
    }
}
```

#### Mock 测试

```go
// 使用 go-sqlmock
func TestSyncChart(t *testing.T) {
    db, mock, err := sqlmock.New()
    assert.NoError(t, err)
    defer db.Close()
    
    mock.ExpectExec("INSERT INTO charts").
        WithArgs("nginx", "bitnami", "default").
        WillReturnResult(sqlmock.NewResult(1, 1))
    
    syncer := NewSyncer(db)
    err = syncer.SyncChart(&Chart{
        Name:      "nginx",
        RepoName:  "bitnami",
        Namespace: "default",
    })
    
    assert.NoError(t, err)
    assert.NoError(t, mock.ExpectationsWereMet())
}
```

### TypeScript/React 测试

#### 运行测试

```bash
cd dashboard

# 所有测试
yarn test

# 监听模式
yarn test --watch

# 覆盖率
yarn test --coverage

# 特定文件
yarn test Auth.test.ts
```

#### 编写测试

```typescript
// dashboard/src/shared/Auth.test.ts
import { Auth } from './Auth';

describe('Auth', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  describe('getAuthToken', () => {
    it('returns null when no token is stored', () => {
      expect(Auth.getAuthToken()).toBeNull();
    });
    
    it('returns stored token', () => {
      localStorage.setItem('kubeapps_auth_token', 'test-token');
      expect(Auth.getAuthToken()).toBe('test-token');
    });
  });
  
  describe('setAuthToken', () => {
    it('stores token in localStorage', () => {
      Auth.setAuthToken('new-token', false);
      expect(localStorage.getItem('kubeapps_auth_token')).toBe('new-token');
    });
  });
});
```

#### 组件测试

```typescript
// dashboard/src/components/AppList/AppList.test.tsx
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AppList } from './AppList';
import { createMockStore } from '../../mocked-store';

describe('AppList', () => {
  it('renders loading state', () => {
    const store = createMockStore({
      installedpackages: { isFetching: true, items: [] }
    });
    
    render(
      <Provider store={store}>
        <AppList />
      </Provider>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('renders app list', () => {
    const store = createMockStore({
      installedpackages: {
        isFetching: false,
        items: [
          { name: 'nginx', namespace: 'default' },
          { name: 'redis', namespace: 'default' }
        ]
      }
    });
    
    render(
      <Provider store={store}>
        <AppList />
      </Provider>
    );
    
    expect(screen.getByText('nginx')).toBeInTheDocument();
    expect(screen.getByText('redis')).toBeInTheDocument();
  });
});
```

### Rust 测试

```bash
# pinniped-proxy
cd cmd/pinniped-proxy
cargo test

# oci-catalog
cd cmd/oci-catalog
cargo test
```

```rust
// cmd/pinniped-proxy/src/lib.rs
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_parse_token() {
        let token = "Bearer eyJhbGc...";
        let result = parse_token(token);
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_exchange_token() {
        let proxy = PinnipedProxy::new(Config::default());
        let result = proxy.exchange_token("test-token").await;
        assert!(result.is_ok());
    }
}
```

## 集成测试

### Go 集成测试

```bash
# 需要数据库
export ENABLE_PG_INTEGRATION_TESTS=1
cd cmd/asset-syncer
go test -count=1 ./...
```

```go
// cmd/asset-syncer/server/sync_test.go
// +build integration

func TestSyncIntegration(t *testing.T) {
    if os.Getenv("ENABLE_PG_INTEGRATION_TESTS") == "" {
        t.Skip("Skipping integration test")
    }
    
    // 连接真实数据库
    db, err := sql.Open("postgres", "postgres://localhost/test")
    require.NoError(t, err)
    defer db.Close()
    
    // 运行集成测试
    syncer := NewSyncer(db)
    err = syncer.Sync(context.Background(), testRepo)
    assert.NoError(t, err)
}
```

### API 集成测试

```go
// cmd/kubeapps-apis/plugin_test/integration_test.go
func TestHelmPluginIntegration(t *testing.T) {
    // 启动测试服务器
    server := startTestServer(t)
    defer server.Stop()
    
    // 创建客户端
    client := createTestClient(server.URL)
    
    // 测试 API
    resp, err := client.GetAvailablePackages(context.Background(), &Request{
        Context: &Context{
            Cluster:   "default",
            Namespace: "default",
        },
    })
    
    assert.NoError(t, err)
    assert.NotEmpty(t, resp.Packages)
}
```

## E2E 测试

### Playwright 测试

#### 配置

```javascript
// integration/playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: process.env.INTEGRATION_ENTRYPOINT || 'http://localhost:8080',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
};
```

#### 编写测试

```javascript
// integration/tests/main-group-1/01-login.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Login', () => {
  test('should login with token', async ({ page }) => {
    await page.goto('/');
    
    // 输入 token
    await page.fill('input[name="token"]', process.env.ADMIN_TOKEN);
    await page.click('button[type="submit"]');
    
    // 验证登录成功
    await expect(page).toHaveURL('/catalog');
    await expect(page.locator('text=Catalog')).toBeVisible();
  });
});

test.describe('Deploy Application', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/');
    await page.fill('input[name="token"]', process.env.ADMIN_TOKEN);
    await page.click('button[type="submit"]');
  });
  
  test('should deploy nginx', async ({ page }) => {
    // 搜索 nginx
    await page.goto('/catalog');
    await page.fill('input[placeholder="Search"]', 'nginx');
    
    // 选择 Chart
    await page.click('text=nginx');
    
    // 部署
    await page.click('button:has-text("Deploy")');
    await page.fill('input[name="releaseName"]', 'test-nginx');
    await page.click('button:has-text("Deploy")');
    
    // 验证部署成功
    await expect(page.locator('text=Deployed')).toBeVisible({ timeout: 60000 });
  });
});
```

#### 运行 E2E 测试

```bash
# 启动集群
make cluster-kind

# 部署 Kubeapps
make deploy-dev

# 运行测试
cd integration
yarn install
yarn test

# 特定测试
yarn test tests/main-group-1/01-login.spec.js

# 调试模式
yarn test --debug
```

## 性能测试

### 负载测试

```bash
# 使用 k6
k6 run load-test.js
```

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let response = http.get('http://kubeapps.local/api/packages');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### 基准测试

```go
// pkg/kube/cluster_config_bench_test.go
func BenchmarkClusterConfig_Validate(b *testing.B) {
    config := ClusterConfig{
        Name:          "test",
        APIServiceURL: "https://api.example.com",
    }
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _ = config.Validate()
    }
}
```

## 测试覆盖率

### 目标

- **单元测试**: > 80%
- **集成测试**: > 60%
- **E2E 测试**: 关键路径 100%

### 生成报告

```bash
# Go 覆盖率
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html

# TypeScript 覆盖率
cd dashboard
yarn test --coverage
# 报告在 coverage/lcov-report/index.html
```

### CI 集成

```yaml
# .github/workflows/test.yml
- name: Test with coverage
  run: |
    go test -coverprofile=coverage.out ./...
    
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage.out
```

## 测试最佳实践

### 1. 测试命名

```go
// ✅ 好的命名
func TestClusterConfig_Validate_WithMissingName_ReturnsError(t *testing.T)

// ❌ 不好的命名
func TestValidate(t *testing.T)
```

### 2. 表驱动测试

```go
func TestParseVersion(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    *Version
        wantErr bool
    }{
        {"valid semver", "1.2.3", &Version{1, 2, 3}, false},
        {"invalid format", "abc", nil, true},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := ParseVersion(tt.input)
            if tt.wantErr {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
                assert.Equal(t, tt.want, got)
            }
        })
    }
}
```

### 3. 使用 Mock

```go
// 定义接口
type ChartClient interface {
    GetChart(name string) (*Chart, error)
}

// Mock 实现
type MockChartClient struct {
    mock.Mock
}

func (m *MockChartClient) GetChart(name string) (*Chart, error) {
    args := m.Called(name)
    return args.Get(0).(*Chart), args.Error(1)
}

// 使用 Mock
func TestService(t *testing.T) {
    mockClient := new(MockChartClient)
    mockClient.On("GetChart", "nginx").Return(&Chart{Name: "nginx"}, nil)
    
    service := NewService(mockClient)
    chart, err := service.GetChart("nginx")
    
    assert.NoError(t, err)
    assert.Equal(t, "nginx", chart.Name)
    mockClient.AssertExpectations(t)
}
```

### 4. 清理资源

```go
func TestWithCleanup(t *testing.T) {
    // 创建临时资源
    tmpDir, err := os.MkdirTemp("", "test")
    require.NoError(t, err)
    
    // 确保清理
    t.Cleanup(func() {
        os.RemoveAll(tmpDir)
    })
    
    // 测试逻辑
}
```

## Kiro 辅助命令

```bash
# 运行测试
kiro-cli chat "运行所有单元测试"

# 生成测试
kiro-cli chat "为 PackagesService 生成单元测试"

# 修复测试
kiro-cli chat "修复失败的测试用例"

# 提高覆盖率
kiro-cli chat "为 cluster_config.go 添加测试以提高覆盖率到 80%"

# 运行 E2E 测试
kiro-cli chat "在 Kind 集群中运行 E2E 测试"
```
