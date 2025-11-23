# Kiro AI 使用指南

本指南介绍如何使用 Kiro AI 助手高效地维护和开发 Kubeapps 项目。

## 基础用法

### 启动 Kiro

```bash
# 在项目根目录启动
cd /Users/xinxiang.wang/app/kubeapps
kiro-cli chat
```

### 基本交互

```bash
# 询问项目信息
kiro> 这个项目的主要功能是什么？

# 查看文档
kiro> 如何设置开发环境？

# 执行任务
kiro> 构建所有组件
```

## 常见场景

### 1. 项目理解

```bash
# 了解架构
kiro> 解释 Kubeapps 的架构设计

# 理解代码
kiro> 解释 cmd/kubeapps-apis/server/server.go 的作用

# 查看依赖
kiro> 列出所有 Go 依赖及其用途

# 理解数据流
kiro> 用户部署应用的完整流程是什么？
```

### 2. 环境设置

```bash
# 检查环境
kiro> 检查我的开发环境是否满足要求

# 安装工具
kiro> 安装所有必需的开发工具

# 创建集群
kiro> 创建一个 Kind 集群用于开发

# 配置数据库
kiro> 启动 PostgreSQL 和 Redis 容器
```

### 3. 代码开发

#### 添加新功能

```bash
# 需求分析
kiro> 我想添加对 Carvel 包的搜索功能，需要修改哪些文件？

# 生成代码
kiro> 在 Helm 插件中添加一个新的 API 端点用于获取 Chart 依赖

# 实现功能
kiro> 实现 GetChartDependencies 方法

# 添加测试
kiro> 为 GetChartDependencies 添加单元测试
```

#### 修复 Bug

```bash
# 定位问题
kiro> dashboard 无法连接到 kubeapps-apis，可能的原因是什么？

# 分析日志
kiro> 分析这段错误日志：[粘贴日志]

# 修复代码
kiro> 修复 Auth.ts 中的 token 存储安全问题

# 验证修复
kiro> 运行相关测试验证修复是否有效
```

#### 代码重构

```bash
# 分析代码
kiro> 分析 utils.ts 的代码质量问题

# 重构建议
kiro> 如何重构 server.go 以提高可维护性？

# 执行重构
kiro> 将 utils.ts 按功能拆分为多个文件

# 验证重构
kiro> 运行测试确保重构没有破坏功能
```

### 4. 测试

```bash
# 运行测试
kiro> 运行所有单元测试

# 生成测试
kiro> 为 PackagesService 生成完整的单元测试

# 修复测试
kiro> 修复失败的测试用例

# 提高覆盖率
kiro> 为 cluster_config.go 添加测试以达到 80% 覆盖率

# E2E 测试
kiro> 运行 E2E 测试并生成报告
```

### 5. 构建和部署

```bash
# 构建
kiro> 构建所有 Docker 镜像

# 部署
kiro> 在 Kind 集群中部署 Kubeapps

# 更新
kiro> 更新 dashboard 镜像到最新版本

# 回滚
kiro> 回滚到上一个版本
```

### 6. 调试

```bash
# 查看日志
kiro> 查看 kubeapps-apis 的最近 100 行日志

# 排查问题
kiro> Pod 一直处于 CrashLoopBackOff 状态，如何排查？

# 性能分析
kiro> API 响应很慢，如何定位性能瓶颈？

# 网络问题
kiro> 测试 dashboard 到 kubeapps-apis 的网络连接
```

### 7. 文档

```bash
# 生成文档
kiro> 为 PackagesService 生成 API 文档

# 更新文档
kiro> 更新部署文档以反映最新的配置选项

# 解释代码
kiro> 为 ClusterConfig 结构体生成详细的注释

# 创建示例
kiro> 创建一个使用 Helm 插件的示例代码
```

### 8. 代码审查

```bash
# 审查代码
kiro> 审查 cmd/kubeapps-apis/server/server.go 的代码质量

# 检查规范
kiro> 检查代码是否符合 Go 代码规范

# 安全审查
kiro> 审查代码中的安全问题

# 性能审查
kiro> 分析代码的性能问题
```

## 高级用法

### 1. 批量操作

```bash
# 批量更新
kiro> 更新所有 Go 依赖到最新稳定版本

# 批量测试
kiro> 运行所有插件的单元测试

# 批量构建
kiro> 构建所有微服务的 Docker 镜像
```

### 2. 自动化任务

```bash
# 自动修复
kiro> 自动修复所有 ESLint 报告的问题

# 自动格式化
kiro> 格式化所有 Go 和 TypeScript 代码

# 自动生成
kiro> 为所有 API 端点生成 OpenAPI 文档
```

### 3. 复杂查询

```bash
# 依赖分析
kiro> 分析 kubeapps-apis 的所有依赖关系

# 影响分析
kiro> 如果修改 ClusterConfig 结构体，会影响哪些代码？

# 性能分析
kiro> 分析整个系统的性能瓶颈

# 安全分析
kiro> 扫描项目中的所有安全漏洞
```

### 4. 集成工作流

```bash
# 完整开发流程
kiro> 我要添加一个新功能：支持 OCI 镜像仓库。请帮我完成从设计到测试的全流程。

# 完整修复流程
kiro> 用户报告了一个 Bug：部署应用时超时。请帮我定位、修复并验证。

# 完整发布流程
kiro> 准备发布 v2.1.0 版本，包括更新版本号、生成 changelog、构建镜像。
```

## 最佳实践

### 1. 清晰的问题描述

```bash
# ❌ 不好的问题
kiro> 代码有问题

# ✅ 好的问题
kiro> dashboard/src/shared/Auth.ts 中的 setAuthToken 方法将敏感 token 存储在 localStorage，存在 XSS 风险，如何改进？
```

### 2. 提供上下文

```bash
# ❌ 缺少上下文
kiro> 修复这个错误

# ✅ 提供上下文
kiro> 运行 'make test' 时出现以下错误：
[粘贴错误信息]
这是在修改了 cluster_config.go 之后发生的。
```

### 3. 分步骤执行

```bash
# ❌ 一次性要求太多
kiro> 添加新功能、写测试、更新文档、部署到生产

# ✅ 分步骤
kiro> 第一步：设计新功能的 API 接口
kiro> 第二步：实现核心功能
kiro> 第三步：添加单元测试
kiro> 第四步：更新文档
```

### 4. 验证结果

```bash
# 执行操作后验证
kiro> 构建 dashboard 镜像
kiro> 验证镜像是否构建成功
kiro> 测试镜像是否能正常运行
```

## 常用命令模板

### 开发

```bash
# 设置环境
kiro> 根据 .kiro/03-development-setup.md 设置开发环境

# 创建功能
kiro> 在 [组件] 中添加 [功能]，包括实现和测试

# 修复 Bug
kiro> 修复 [文件] 中的 [问题]

# 重构代码
kiro> 重构 [文件]，[重构目标]
```

### 测试

```bash
# 运行测试
kiro> 运行 [组件] 的 [测试类型] 测试

# 生成测试
kiro> 为 [函数/类] 生成单元测试

# 修复测试
kiro> 修复 [测试文件] 中失败的测试
```

### 部署

```bash
# 构建
kiro> 构建 [组件] 的 Docker 镜像

# 部署
kiro> 在 [环境] 中部署 Kubeapps

# 更新
kiro> 更新 [组件] 到版本 [版本号]
```

### 调试

```bash
# 查看日志
kiro> 查看 [组件] 的日志

# 排查问题
kiro> [问题描述]，如何排查？

# 性能分析
kiro> 分析 [组件] 的性能问题
```

## 提示和技巧

### 1. 使用文档引用

```bash
# 引用 Kiro Spec 文档
kiro> 根据 .kiro/02-architecture.md 解释插件系统的工作原理

# 引用代码文件
kiro> 分析 cmd/kubeapps-apis/server/server.go 的代码结构
```

### 2. 保存常用命令

创建 `.kiro/aliases.md`:

```markdown
# Kiro 命令别名

## 开发
- `setup`: 设置开发环境
- `build`: 构建所有组件
- `test`: 运行所有测试

## 部署
- `deploy-dev`: 部署到开发环境
- `deploy-prod`: 部署到生产环境
```

### 3. 使用代码片段

```bash
# 请求生成特定模式的代码
kiro> 生成一个新的 gRPC 服务，遵循现有的模式

# 请求修改代码
kiro> 将这段代码改为使用 context.Context
```

### 4. 学习和探索

```bash
# 学习代码库
kiro> 解释 Kubeapps 的插件系统是如何工作的

# 探索最佳实践
kiro> Kubeapps 中如何处理错误？

# 了解设计决策
kiro> 为什么选择 gRPC 而不是 REST API？
```

## 故障排查

### Kiro 无法理解问题

```bash
# 提供更多上下文
kiro> 我在尝试 [具体操作]，遇到了 [具体问题]，相关代码在 [文件路径]

# 分解问题
kiro> 首先，[子问题1]
kiro> 然后，[子问题2]
```

### Kiro 给出的答案不准确

```bash
# 指出问题
kiro> 这个方案不适用，因为 [原因]。请提供其他方案。

# 提供反馈
kiro> 这个实现有问题：[具体问题]。请修正。
```

### Kiro 执行命令失败

```bash
# 检查环境
kiro> 检查当前环境配置

# 手动执行
kiro> 请给我命令，我手动执行

# 查看错误
kiro> 执行失败，错误信息：[粘贴错误]
```

## 进阶技巧

### 1. 自定义工作流

创建 `.kiro/workflows/` 目录，定义常用工作流：

```yaml
# .kiro/workflows/new-feature.yaml
name: 添加新功能
steps:
  - name: 设计 API
    prompt: 设计 {feature} 的 API 接口
  - name: 实现功能
    prompt: 实现 {feature} 的核心逻辑
  - name: 添加测试
    prompt: 为 {feature} 添加单元测试
  - name: 更新文档
    prompt: 更新文档以包含 {feature}
```

### 2. 集成 Git

```bash
# 生成提交信息
kiro> 为这次修改生成 Git commit message

# 代码审查
kiro> 审查 Git diff 中的代码变更

# 生成 PR 描述
kiro> 为这个 PR 生成描述
```

### 3. 持续学习

```bash
# 定期审查
kiro> 审查最近一周的代码变更

# 性能监控
kiro> 分析最近的性能指标

# 安全扫描
kiro> 扫描新增的依赖是否有安全漏洞
```

## 总结

Kiro AI 是你的智能开发助手，可以帮助你：

- ✅ 快速理解代码库
- ✅ 高效完成开发任务
- ✅ 自动化重复工作
- ✅ 提高代码质量
- ✅ 加速问题排查

记住：
1. 提供清晰的问题描述
2. 给出足够的上下文
3. 分步骤执行复杂任务
4. 验证 Kiro 的输出
5. 持续学习和改进

开始使用 Kiro，让 AI 助力你的开发工作！
