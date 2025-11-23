# Kubeapps 前端定制化指南

## 快速开始

### 1. 基础配置定制

#### 运行时配置 (`public/config.json`)

```json
{
  "kubeappsCluster": "default",
  "kubeappsNamespace": "kubeapps",
  "appVersion": "v2.0.0",
  "authProxyEnabled": false,
  "oauthLoginURI": "/oauth2/start",
  "oauthLogoutURI": "/oauth2/sign_out",
  "clusters": ["default", "production", "staging"],
  "theme": "light",
  "remoteComponentsUrl": "",
  "customAppViews": [],
  "featureFlags": {
    "operators": true,
    "schemaEditor": {
      "enabled": true
    }
  }
}
```

### 2. 主题定制

#### 修改颜色方案 (`src/index.scss`)

```scss
// 自定义主题变量
:root {
  // 主色调
  --primary-color: #0066cc;
  --primary-hover: #0052a3;
  
  // 背景色
  --background-color: #f5f5f5;
  --card-background: #ffffff;
  
  // 文字颜色
  --text-primary: #333333;
  --text-secondary: #666666;
  
  // 边框
  --border-color: #e0e0e0;
  
  // 状态颜色
  --success-color: #28a745;
  --warning-color: #ffc107;
  --error-color: #dc3545;
  --info-color: #17a2b8;
}

// 暗色主题
[data-theme="dark"] {
  --background-color: #1a1a1a;
  --card-background: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --border-color: #444444;
}
```

### 3. Logo 定制

#### 替换 Logo

```bash
# 替换 Logo 文件
cp your-logo.svg dashboard/src/icons/kubeapps-color.svg
cp your-logo-white.svg dashboard/src/icons/kubeapps-white.svg

# 或修改 Header 组件
# dashboard/src/components/Header/Header.tsx
```

```tsx
// Header.tsx
import YourLogo from 'icons/your-logo.svg';

export function Header() {
  return (
    <header>
      <img src={YourLogo} alt="Your Company" />
    </header>
  );
}
```

## 组件定制

### 1. 自定义首页

创建 `src/components/CustomHome/CustomHome.tsx`:

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './CustomHome.scss';

export const CustomHome: React.FC = () => {
  return (
    <div className="custom-home">
      <h1>欢迎使用您的应用管理平台</h1>
      <div className="quick-actions">
        <Link to="/catalog" className="action-card">
          <h3>浏览应用</h3>
          <p>查看可用的应用程序</p>
        </Link>
        <Link to="/apps" className="action-card">
          <h3>我的应用</h3>
          <p>管理已部署的应用</p>
        </Link>
        <Link to="/config/repos" className="action-card">
          <h3>仓库管理</h3>
          <p>配置应用仓库</p>
        </Link>
      </div>
    </div>
  );
};
```

### 2. 自定义应用卡片

修改 `src/components/Catalog/CatalogItem.tsx`:

```tsx
import React from 'react';
import { AvailablePackageSummary } from 'gen/kubeappsapis/core/packages/v1alpha1/packages_pb';

interface ICatalogItemProps {
  package: AvailablePackageSummary;
}

export const CustomCatalogItem: React.FC<ICatalogItemProps> = ({ package: pkg }) => {
  return (
    <div className="custom-catalog-item">
      <div className="item-header">
        <img src={pkg.iconUrl || '/placeholder.svg'} alt={pkg.displayName} />
        <h3>{pkg.displayName}</h3>
      </div>
      <div className="item-body">
        <p className="description">{pkg.shortDescription}</p>
        <div className="metadata">
          <span className="version">{pkg.latestVersion?.pkgVersion}</span>
          <span className="category">{pkg.categories?.[0]}</span>
        </div>
      </div>
      <div className="item-footer">
        <button className="btn-primary">部署</button>
        <button className="btn-secondary">详情</button>
      </div>
    </div>
  );
};
```

### 3. 自定义部署表单

创建 `src/components/CustomDeploymentForm/CustomDeploymentForm.tsx`:

```tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { installPackage } from 'actions/installedpackages';

export const CustomDeploymentForm: React.FC = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    namespace: 'default',
    values: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await dispatch(installPackage({
      cluster: 'default',
      namespace: formData.namespace,
      releaseName: formData.name,
      values: formData.values,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="custom-deployment-form">
      <div className="form-group">
        <label>应用名称</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="form-group">
        <label>命名空间</label>
        <select
          value={formData.namespace}
          onChange={e => setFormData({ ...formData, namespace: e.target.value })}
        >
          <option value="default">default</option>
          <option value="production">production</option>
          <option value="staging">staging</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>配置 (YAML)</label>
        <textarea
          value={formData.values}
          onChange={e => setFormData({ ...formData, values: e.target.value })}
          rows={10}
          placeholder="key: value"
        />
      </div>
      
      <button type="submit" className="btn-primary">
        部署应用
      </button>
    </form>
  );
};
```

## 高级定制

### 1. 添加自定义路由

修改 `src/containers/RoutesContainer/Routes.tsx`:

```tsx
import { CustomHome } from 'components/CustomHome/CustomHome';
import { CustomDashboard } from 'components/CustomDashboard/CustomDashboard';

export const Routes: React.FC = () => {
  return (
    <Switch>
      {/* 自定义首页 */}
      <Route exact path="/" component={CustomHome} />
      
      {/* 自定义仪表板 */}
      <Route path="/dashboard" component={CustomDashboard} />
      
      {/* 原有路由 */}
      <Route path="/catalog" component={Catalog} />
      <Route path="/apps" component={AppList} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
};
```

### 2. 自定义 Redux Store

添加自定义 reducer `src/reducers/custom.ts`:

```typescript
import { deprecated } from 'typesafe-actions';

const { createAction } = deprecated;

// Actions
export const setCustomData = createAction('SET_CUSTOM_DATA', resolve => {
  return (data: any) => resolve(data);
});

// Reducer
export interface ICustomState {
  data: any;
  loading: boolean;
}

const initialState: ICustomState = {
  data: null,
  loading: false,
};

export const customReducer = (state = initialState, action: any): ICustomState => {
  switch (action.type) {
    case 'SET_CUSTOM_DATA':
      return { ...state, data: action.payload };
    default:
      return state;
  }
};
```

注册到 store `src/reducers/index.ts`:

```typescript
import { customReducer } from './custom';

export const rootReducer = combineReducers({
  // 原有 reducers
  apps: appsReducer,
  auth: authReducer,
  // 自定义 reducer
  custom: customReducer,
});
```

### 3. 自定义 API 服务

创建 `src/shared/CustomService.ts`:

```typescript
import { KubeappsGrpcClient } from './KubeappsGrpcClient';

export class CustomService {
  private client: KubeappsGrpcClient;

  constructor(token?: string) {
    this.client = new KubeappsGrpcClient(token);
  }

  async getCustomData(cluster: string, namespace: string) {
    // 调用自定义 API
    const response = await fetch(`/api/custom/${cluster}/${namespace}`);
    return response.json();
  }

  async createCustomResource(data: any) {
    const response = await fetch('/api/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

### 4. 国际化定制

添加中文语言包 `dashboard/lang/zh.json`:

```json
{
  "welcome": "欢迎",
  "catalog": "应用目录",
  "apps": "我的应用",
  "deploy": "部署",
  "upgrade": "升级",
  "delete": "删除",
  "settings": "设置"
}
```

配置国际化 `src/shared/I18n.ts`:

```typescript
import { createIntl, createIntlCache } from 'react-intl';
import zhMessages from '../../lang/zh.json';
import enMessages from '../../lang/en.json';

const messages = {
  zh: zhMessages,
  en: enMessages,
};

export function setupI18n(locale: string = 'zh') {
  const cache = createIntlCache();
  return createIntl(
    {
      locale,
      messages: messages[locale],
    },
    cache
  );
}
```

## 样式定制

### 1. 使用 CSS 变量

```scss
// src/styles/variables.scss
$primary-color: var(--primary-color, #0066cc);
$secondary-color: var(--secondary-color, #6c757d);
$success-color: var(--success-color, #28a745);
$danger-color: var(--danger-color, #dc3545);

$font-family: 'Helvetica Neue', Arial, sans-serif;
$font-size-base: 14px;
$border-radius: 4px;
```

### 2. 组件样式

```scss
// src/components/CustomHome/CustomHome.scss
.custom-home {
  padding: 2rem;
  
  h1 {
    color: var(--text-primary);
    margin-bottom: 2rem;
  }
  
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    
    .action-card {
      background: var(--card-background);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1.5rem;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      h3 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }
}
```

## 功能扩展

### 1. 添加自定义仪表板

```tsx
// src/components/CustomDashboard/CustomDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IStoreState } from 'shared/types';

export const CustomDashboard: React.FC = () => {
  const apps = useSelector((state: IStoreState) => state.installedpackages.items);
  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    failed: 0,
  });

  useEffect(() => {
    setStats({
      total: apps.length,
      running: apps.filter(app => app.status?.ready).length,
      failed: apps.filter(app => app.status?.reason === 'Failed').length,
    });
  }, [apps]);

  return (
    <div className="custom-dashboard">
      <h1>应用概览</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>总应用数</p>
        </div>
        <div className="stat-card success">
          <h3>{stats.running}</h3>
          <p>运行中</p>
        </div>
        <div className="stat-card danger">
          <h3>{stats.failed}</h3>
          <p>失败</p>
        </div>
      </div>
      
      <div className="recent-apps">
        <h2>最近部署</h2>
        {apps.slice(0, 5).map(app => (
          <div key={app.name} className="app-item">
            <span>{app.name}</span>
            <span className={`status ${app.status?.ready ? 'success' : 'warning'}`}>
              {app.status?.ready ? '运行中' : '部署中'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. 添加自定义过滤器

```tsx
// src/components/CustomFilter/CustomFilter.tsx
import React, { useState } from 'react';

interface ICustomFilterProps {
  onFilterChange: (filters: any) => void;
}

export const CustomFilter: React.FC<ICustomFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    namespace: '',
  });

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="custom-filter">
      <select
        value={filters.category}
        onChange={e => handleChange('category', e.target.value)}
      >
        <option value="">所有分类</option>
        <option value="database">数据库</option>
        <option value="web">Web 服务</option>
        <option value="monitoring">监控</option>
      </select>
      
      <select
        value={filters.status}
        onChange={e => handleChange('status', e.target.value)}
      >
        <option value="">所有状态</option>
        <option value="running">运行中</option>
        <option value="failed">失败</option>
        <option value="pending">待部署</option>
      </select>
      
      <input
        type="text"
        placeholder="搜索..."
        onChange={e => handleChange('search', e.target.value)}
      />
    </div>
  );
};
```

## 构建和部署

### 1. 开发模式

```bash
cd dashboard

# 启动开发服务器
bun start

# 访问 http://localhost:3000
```

### 2. 生产构建

```bash
# 构建
bun build

# 输出到 build/ 目录
```

### 3. Docker 构建

```bash
# 构建自定义镜像
docker build -t your-registry/kubeapps-dashboard:custom \
  -f dashboard/Dockerfile dashboard/

# 推送镜像
docker push your-registry/kubeapps-dashboard:custom
```

### 4. Helm 部署

```yaml
# custom-values.yaml
dashboard:
  image:
    registry: your-registry
    repository: kubeapps-dashboard
    tag: custom
  
  config:
    theme: "light"
    customAppViews: []
```

```bash
helm upgrade kubeapps bitnami/kubeapps \
  -f custom-values.yaml \
  -n kubeapps
```

## 最佳实践

### 1. 组件结构

```
src/components/CustomComponent/
├── CustomComponent.tsx      # 组件逻辑
├── CustomComponent.scss     # 组件样式
├── CustomComponent.test.tsx # 单元测试
└── index.ts                 # 导出
```

### 2. 类型定义

```typescript
// src/shared/types.ts
export interface ICustomConfig {
  theme: 'light' | 'dark';
  language: string;
  features: {
    dashboard: boolean;
    analytics: boolean;
  };
}
```

### 3. 代码分割

```tsx
// 懒加载组件
const CustomDashboard = React.lazy(() => import('./components/CustomDashboard'));

<Suspense fallback={<Loading />}>
  <CustomDashboard />
</Suspense>
```

## 常见定制场景

### 1. 企业品牌定制

- 替换 Logo 和图标
- 修改主题颜色
- 自定义字体
- 添加公司信息

### 2. 功能定制

- 添加自定义仪表板
- 集成监控系统
- 添加审批流程
- 自定义部署流程

### 3. 集成定制

- 集成 LDAP/AD
- 集成 Jira/Confluence
- 集成 Slack/钉钉通知
- 集成 CI/CD 系统

## 使用 Kiro 辅助定制

```bash
# 生成自定义组件
kiro-cli chat "创建一个自定义的应用卡片组件"

# 修改样式
kiro-cli chat "修改主题颜色为蓝色系"

# 添加功能
kiro-cli chat "添加一个应用使用统计的仪表板"

# 国际化
kiro-cli chat "添加中文语言支持"
```

## 总结

Kubeapps 前端提供了丰富的定制化能力：

- ✅ **配置定制**: 通过 config.json 快速配置
- ✅ **主题定制**: CSS 变量和 SCSS 支持
- ✅ **组件定制**: React 组件化架构
- ✅ **功能扩展**: Redux + 自定义 Actions
- ✅ **国际化**: React Intl 支持

开始定制你的 Kubeapps 前端吧！
