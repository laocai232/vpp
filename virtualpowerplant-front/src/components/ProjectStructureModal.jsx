import React, { useState } from 'react';
import './ProjectStructureModal.css';

const ProjectStructureModal = ({ visible, onClose }) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set([
        '虚拟电厂数据可视化系统',
        '虚拟电厂数据可视化系统/主控台系统',
        '虚拟电厂数据可视化系统/核心功能'
    ]));

    // 项目结构数据 - 按功能模块组织
    const projectStructure = {
        name: '虚拟电厂数据可视化系统',
        type: 'system',
        icon: '⚡',
        children: [
            {
                name: '主控台系统',
                type: 'module',
                icon: '📊',
                description: '虚拟电厂核心管理系统',
                children: [
                    {
                        name: '系统概览',
                        type: 'feature',
                        icon: '🏠',
                        description: '数据可视化大屏 - 实时监控仪表盘、地图可视化、告警管理、交易历史'
                    },
                    {
                        name: '资源接入',
                        type: 'feature',
                        icon: '🔌',
                        description: '设备接入管理 - 新设备注册、接入配置、状态监控'
                    },
                    {
                        name: '运营调度',
                        type: 'feature',
                        icon: '⚙️',
                        description: '任务调度管理 - 调度任务创建、执行监控、系统优化、故障处理'
                    },
                    {
                        name: '资源监视',
                        type: 'feature',
                        icon: '📊',
                        description: '设备监控仪表盘 - 设备健康状态、电力流动图、告警趋势、性能指标'
                    },
                    {
                        name: '辅助服务',
                        type: 'feature',
                        icon: '🎛️',
                        description: '电网辅助服务 - 调频调峰服务、备用容量管理、电压支撑控制'
                    },
                    {
                        name: '数据上报',
                        type: 'feature',
                        icon: '📤',
                        description: '数据管理系统 - 实时数据上报、历史数据查询、报告生成、数据质量监控'
                    },
                    {
                        name: '交易中心',
                        type: 'feature',
                        icon: '💰',
                        description: '电力交易管理 - 价格预测、成本分析、投标分析、交易复盘、历史交易查询'
                    },
                                 
                ]
            },
            {
                name: '其他页面',
                type: 'module',
                icon: '📄',
                description: '系统辅助页面',
                children: [
                    {
                        name: '用户登录',
                        type: 'feature',
                        icon: '🔐',
                        description: '用户认证系统 - 登录验证、权限控制、会话管理'
                    },
                    {
                        name: '能源管理',
                        type: 'feature',
                        icon: '⚡',
                        description: 'EMS能源管理系统 - 能源调度、负荷预测、优化控制'
                    },
                    {
                        name: '案例研究',
                        type: 'feature',
                        icon: '📋',
                        description: '项目案例分析 - 典型案例展示、效果评估、经验总结'
                    }
                ]
            },
            {
                name: '技术架构',
                type: 'module',
                icon: '🏗️',
                description: '系统技术架构',
                children: [
                    {
                        name: '前端框架',
                        type: 'tech',
                        icon: '⚛️',
                        description: 'React 18.2.0 + Vite 4.0.0 - 现代化前端开发框架'
                    },
                    {
                        name: '数据可视化',
                        type: 'tech',
                        icon: '📊',
                        description: 'ECharts 5.4.1 - 专业图表库，支持多种图表类型'
                    },
                    {
                        name: '路由管理',
                        type: 'tech',
                        icon: '🛣️',
                        description: 'React Router DOM - 单页应用路由解决方案'
                    },
                    {
                        name: '特效组件',
                        type: 'tech',
                        icon: '✨',
                        description: 'TSParticles - 粒子效果库，增强视觉体验'
                    },
                    {
                        name: 'API服务',
                        type: 'tech',
                        icon: '🔗',
                        description: 'RESTful API - 统一的后端接口服务'
                    }
                ]
            },
            {
                name: '核心功能',
                type: 'module',
                icon: '🎯',
                description: '系统核心功能特性',
                children: [
                    {
                        name: '实时监控',
                        type: 'function',
                        icon: '📡',
                        description: '设备状态实时监控 - 60秒自动刷新，支持手动控制'
                    },
                    {
                        name: '数据可视化',
                        type: 'function',
                        icon: '📈',
                        description: '多维度数据展示 - 仪表盘、地图、图表、趋势分析'
                    },
                    {
                        name: '告警管理',
                        type: 'function',
                        icon: '🚨',
                        description: '智能告警系统 - 实时告警、分级处理、历史记录'
                    },
                    {
                        name: '交易管理',
                        type: 'function',
                        icon: '💱',
                        description: '电力交易全流程 - 价格预测、投标管理、交易分析'
                    },
                    {
                        name: '设备管理',
                        type: 'function',
                        icon: '🔧',
                        description: '设备全生命周期管理 - 接入配置、状态监控、维护管理'
                    }
                ]
            }
        ]
    };

    const toggleNode = (path) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedNodes(newExpanded);
    };

    const renderNode = (node, path = '', level = 0) => {
        const currentPath = path ? `${path}/${node.name}` : node.name;
        const isExpanded = expandedNodes.has(currentPath);
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={currentPath} className="tree-node">
                <div 
                    className={`tree-node-content ${node.type}`}
                    style={{ paddingLeft: `${level * 20}px` }}
                    onClick={() => hasChildren && toggleNode(currentPath)}
                >
                    {hasChildren && (
                        <span className={`tree-toggle ${isExpanded ? 'expanded' : ''}`}>
                            {isExpanded ? '📂' : '📁'}
                        </span>
                    )}
                    {!hasChildren && <span className="tree-file-icon">{node.icon}</span>}
                    <span className="tree-node-name">{node.name}</span>
                    {node.description && (
                        <span className="tree-node-description">{node.description}</span>
                    )}
                </div>
                {hasChildren && isExpanded && (
                    <div className="tree-children">
                        {node.children.map(child => renderNode(child, currentPath, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (!visible) return null;

    return (
        <div className="project-structure-modal-overlay" onClick={onClose}>
            <div className="project-structure-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <span className="header-icon">🌳</span>
                        项目结构
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-content">
                    <div className="project-info">
                        <div className="info-item">
                            <span className="info-label">系统名称:</span>
                            <span className="info-value">虚拟电厂数据可视化大屏系统</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">技术架构:</span>
                            <span className="info-value">React + Vite + ECharts + TSParticles</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">核心功能:</span>
                            <span className="info-value">实时监控、设备管理、电力交易、数据可视化、告警管理</span>
                        </div>
                    </div>
                    <div className="tree-container">
                        {renderNode(projectStructure)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectStructureModal;
