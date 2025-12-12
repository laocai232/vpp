import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './style.css';

export default function Casestudy() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('连接中...');
    const [messages, setMessages] = useState([]);
    const iframeRef = useRef(null);
    const location = useLocation();
    
    // 检查是否为只读模式
    const isReadOnlyMode = new URLSearchParams(location.search).get('mode') === 'readonly';
    
    // 本地项目的端口地址 - 请修改为您的实际端口
    const localProjectUrl = isReadOnlyMode 
        ? 'http://localhost:5174/#/frequency-control?id=10&readonly=true'
        : 'http://localhost:5174/#/frequency-control?id=10';
    
    useEffect(() => {
        // 监听来自iframe的消息
        const handleMessage = (event) => {
            // 安全检查：确保消息来自预期的源
            if (event.origin !== 'http://localhost:5174') {
                return;
            }
            
            console.log('收到来自嵌入项目的消息:', event.data);
            setMessages(prev => [...prev, {
                type: 'received',
                data: event.data,
                timestamp: new Date().toLocaleTimeString()
            }]);
            
            // 处理特定类型的消息
            if (event.data.type === 'status') {
                setConnectionStatus(event.data.message);
            }
        };
        
        window.addEventListener('message', handleMessage);
        
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);
    
    const handleIframeLoad = () => {
        setIsLoading(false);
        setHasError(false);
        setConnectionStatus('已连接');
        
        // 如果是只读模式，向嵌入的项目发送只读模式消息
        if (isReadOnlyMode) {
            setTimeout(() => {
                sendMessageToIframe({
                    type: 'setReadOnlyMode',
                    readonly: true,
                    message: '当前为只读模式',
                    timestamp: new Date().toISOString()
                });
            }, 1000);
        }
    };
    
    const handleIframeError = () => {
        setIsLoading(false);
        setHasError(true);
        setConnectionStatus('连接失败');
    };
    
    const sendMessageToIframe = (message) => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(message, 'http://localhost:5174');
            setMessages(prev => [...prev, {
                type: 'sent',
                data: message,
                timestamp: new Date().toLocaleTimeString()
            }]);
        }
    };
    
    const refreshIframe = () => {
        setIsLoading(true);
        setHasError(false);
        setConnectionStatus('重新连接中...');
        setMessages([]);
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    return (
        <div className="casestudy-container">
            <div className="casestudy-header">
                <div className="header-left">
                    <h1>系统调频案例</h1>
                    {isReadOnlyMode && (
                        <div className="readonly-badge">
                            <span className="readonly-icon">👁️</span>
                            <span>只读模式</span>
                        </div>
                    )}
                    <span className={`status-indicator ${hasError ? 'error' : isLoading ? 'loading' : 'connected'}`}>
                        {connectionStatus}
                    </span>
                </div>
                <div className="controls">
                    {!isReadOnlyMode && (
                        <>
                            <button onClick={refreshIframe} className="refresh-btn">
                                🔄 刷新
                            </button>
                        </>
                    )}
                    {/* <a 
                        href={localProjectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="external-link-btn"
                    >
                        🔗 新窗口打开
                    </a> */}
                    {isReadOnlyMode && (
                        <a 
                            href="/login" 
                            className="login-btn-header"
                        >
                            🔐 登录获取完整功能
                        </a>
                    )}
                </div>
            </div>
            
            <div className="main-content">
                <div className="iframe-section">
                    <div className="iframe-container">
                        {isLoading && (
                            <div className="loading-overlay">
                                <div className="loading-spinner"></div>
                                <p>正在加载调频系统...</p>
                            </div>
                        )}
                        
                        {hasError && (
                            <div className="error-overlay">
                                <div className="error-content">
                                    <h3>⚠️ 无法加载调频系统</h3>
                                    <p>请确保调频系统正在运行在相应端口</p>
                                    <div className="error-tips">
                                        <h4>解决方案：</h4>
                                        <ul>
                                            <li>检查目标项目是否已启动</li>
                                            <li>确认端口号是否正确</li>
                                            <li>检查防火墙设置</li>
                                            <li>确保项目支持iframe嵌入</li>
                                        </ul>
                                    </div>
                                    {!isReadOnlyMode && (
                                        <button onClick={refreshIframe} className="retry-btn">
                                            重试连接
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <iframe
                            ref={iframeRef}
                            id="embedded-project"
                            src={localProjectUrl}
                            title="嵌入的调频系统"
                            className={`embedded-iframe ${isReadOnlyMode ? 'readonly-iframe' : ''}`}
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
                        />
                    </div>
                </div>
                
                {!isReadOnlyMode && (
                    <div className="communication-panel">
                        <h3>通信日志</h3>
                        <div className="message-list">
                            {messages.length === 0 ? (
                                <p className="no-messages">暂无通信记录</p>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={index} className={`message ${msg.type}`}>
                                        <div className="message-header">
                                            <span className="message-type">
                                                {msg.type === 'sent' ? '📤 发送' : '📥 接收'}
                                            </span>
                                            <span className="message-time">{msg.timestamp}</span>
                                        </div>
                                        <div className="message-content">
                                            {JSON.stringify(msg.data, null, 2)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* {isReadOnlyMode && (
                <div className="readonly-overlay">
                    <div className="readonly-notice">
                        <h4>🔒 只读模式</h4>
                        <p>当前为演示模式，所有控制功能已禁用</p>
                        <a href="/login" className="login-link">登录获取完整功能</a>
                    </div>
                </div>
            )} */}
        </div>
    );
}