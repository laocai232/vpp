import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './style.css';

export default function EMSManagement() {
    const location = useLocation();
    const iframeRef = useRef(null);
    
    // 检查是否为只读模式
    const isReadOnlyMode = new URLSearchParams(location.search).get('mode') === 'readonly';
    
    // const localProjectUrl = isReadOnlyMode 
    //     ? 'http://localhost:5174/#/menu?readonly=true'
    //     : 'http://localhost:5174/#/menu';
    
    useEffect(() => {
        // 组件挂载时设置全屏模式
        if (!isReadOnlyMode) {
            document.body.classList.add('fullscreen-mode');
            
            // 获取根元素并设置全屏样式
            const rootElement = document.getElementById('root');
            if (rootElement) {
                rootElement.classList.add('fullscreen-mode');
                rootElement.style.margin = '0';
                rootElement.style.padding = '0';
                rootElement.style.height = '100vh';
                rootElement.style.width = '100vw';
                rootElement.style.overflow = 'hidden';
            }
            
            // 设置html元素样式
            const htmlElement = document.documentElement;
            if (htmlElement) {
                htmlElement.style.margin = '0';
                htmlElement.style.padding = '0';
                htmlElement.style.height = '100vh';
                htmlElement.style.width = '100vw';
                htmlElement.style.overflow = 'hidden';
            }
        }
        
        // 组件卸载时恢复正常模式
        return () => {
            if (!isReadOnlyMode) {
                document.body.classList.remove('fullscreen-mode');
                
                const rootElement = document.getElementById('root');
                if (rootElement) {
                    rootElement.classList.remove('fullscreen-mode');
                    rootElement.style.margin = '';
                    rootElement.style.padding = '';
                    rootElement.style.height = '';
                    rootElement.style.width = '';
                    rootElement.style.overflow = '';
                }
                
                const htmlElement = document.documentElement;
                if (htmlElement) {
                    htmlElement.style.margin = '';
                    htmlElement.style.padding = '';
                    htmlElement.style.height = '';
                    htmlElement.style.width = '';
                    htmlElement.style.overflow = '';
                }
            }
        };
    }, [isReadOnlyMode]);
    
    if (isReadOnlyMode) {
        return (
            <div className="ems-readonly-container">
                <div className="readonly-header">
                    <div className="header-content">
                        <h1>综合能源管理系统</h1>
                        <div className="readonly-badge">
                            <span className="readonly-icon">👁️</span>
                            <span>只读演示模式</span>
                        </div>
                    </div>
                    <div className="header-actions">
                        {/* <a 
                            href={localProjectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="external-link-btn"
                        >
                            🔗 新窗口打开
                        </a> */}
                        <a 
                            href="/login" 
                            className="login-btn-header"
                        >
                            🔐 登录获取完整功能
                        </a>
                    </div>
                </div>
                
                <div className="readonly-iframe-container">
                    <iframe
                        ref={iframeRef}
                        id="embedded-project"
                        src={localProjectUrl}
                        title="嵌入的能源管理系统（只读模式）"
                        className="readonly-iframe"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
                        loading="lazy"
                        frameBorder="0"
                        scrolling="no"
                    />
                    
                    {/* <div className="readonly-overlay">
                        <div className="readonly-notice">
                            <h4>🔒 只读演示模式</h4>
                            <p>当前为演示模式，所有操作功能已禁用</p>
                            <p>登录后可获得完整的管理和控制权限</p>
                            <a href="/login" className="login-link">立即登录</a>
                        </div>
                    </div> */}
                </div>
            </div>
        );
    }
    
    return (
        <div className="ems-container">
            <iframe
                ref={iframeRef}
                id="embedded-project"
                src={localProjectUrl}
                title="嵌入的能源管理系统"
                className="fullscreen-iframe"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
                loading="lazy"
                frameBorder="0"
                scrolling="no"
            />
        </div>
    );
}