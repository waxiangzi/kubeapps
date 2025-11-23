// Copyright 2025 the Kubeapps contributors.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Link } from "react-router-dom";
import "./CustomHome.scss";

export const CustomHome: React.FC = () => {
  return (
    <div className="custom-home">
      <div className="hero-section">
        <h1>欢迎使用 Kubeapps</h1>
        <p className="subtitle">简化 Kubernetes 应用管理</p>
      </div>

      <div className="quick-actions">
        <Link to="/catalog" className="action-card">
          <div className="card-icon">📦</div>
          <h3>浏览应用</h3>
          <p>从应用目录中选择并部署应用</p>
        </Link>

        <Link to="/apps" className="action-card">
          <div className="card-icon">🚀</div>
          <h3>我的应用</h3>
          <p>查看和管理已部署的应用</p>
        </Link>

        <Link to="/config/repos" className="action-card">
          <div className="card-icon">🔧</div>
          <h3>仓库管理</h3>
          <p>配置和管理应用仓库</p>
        </Link>

        <Link to="/operators" className="action-card">
          <div className="card-icon">⚙️</div>
          <h3>Operators</h3>
          <p>浏览和安装 Kubernetes Operators</p>
        </Link>
      </div>

      <div className="features-section">
        <h2>核心功能</h2>
        <div className="features-grid">
          <div className="feature-item">
            <h4>多包管理器支持</h4>
            <p>支持 Helm、Flux、Carvel 等多种包管理器</p>
          </div>
          <div className="feature-item">
            <h4>GitOps 工作流</h4>
            <p>原生支持 Flux GitOps 声明式部署</p>
          </div>
          <div className="feature-item">
            <h4>多集群管理</h4>
            <p>统一管理多个 Kubernetes 集群</p>
          </div>
          <div className="feature-item">
            <h4>RBAC 集成</h4>
            <p>基于 Kubernetes RBAC 的权限控制</p>
          </div>
        </div>
      </div>
    </div>
  );
};
