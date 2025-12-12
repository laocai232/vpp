import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Particles from "react-tsparticles";
import particlesConfig from "../../assets/particle/particlejs-config";
import bgImg from '../../assets/img/bg-img.png';

import './style.css'

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [errors, setErrors] = useState({});
    const [loginMessage, setLoginMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // 模拟用户数据库
    const validUsers = [
        { username: 'admin', password: '123456', role: 'admin', redirectTo: '/homeview' },
        { username: 'operator', password: '123456', role: 'operator', redirectTo: '/emsmanagement' },
        { username: 'viewer', password: '123456', role: 'viewer', redirectTo: '/casestudy' },
        { username: 'test', password: 'test123', role: 'user', redirectTo: '/homeview' }
    ];

    useEffect(() => {
        // 页面加载动画
        const timer = setTimeout(() => {
            setShowForm(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const validateForm = () => {
        const newErrors = {};

        // 用户名校验
        if (!formData.username.trim()) {
            newErrors.username = '请输入用户名';
        } else if (formData.username.length < 3) {
            newErrors.username = '用户名至少3个字符';
        }

        // 密码校验
        if (!formData.password) {
            newErrors.password = '请输入密码';
        } else if (formData.password.length < 6) {
            newErrors.password = '密码至少6个字符';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const authenticateUser = (username, password) => {
        return validUsers.find(user => 
            user.username === username && user.password === password
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // 清除对应字段的错误信息
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        // 清除登录消息
        if (loginMessage) {
            setLoginMessage('');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // 表单校验
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setLoginMessage('');
        
        // 模拟网络延迟
        setTimeout(() => {
            const user = authenticateUser(formData.username, formData.password);
            
            if (user) {
                setLoginMessage('登录成功，正在跳转...');
                
                // 保存用户信息到localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    username: user.username,
                    role: user.role,
                    loginTime: new Date().toISOString()
                }));
                
                // 延迟跳转，显示成功消息
                setTimeout(() => {
                    navigate(user.redirectTo);
                }, 1500);
            } else {
                setLoginMessage('用户名或密码错误');
                setIsLoading(false);
            }
        }, 1000);
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setLoginMessage('注册功能暂未开放，请联系管理员');
    };

    const handleQuickLogin = (userType) => {
        const user = validUsers.find(u => u.role === userType);
        if (user) {
            setFormData({
                username: user.username,
                password: user.password
            });
            setLoginMessage(`已填入${userType === 'admin' ? '管理员' : userType === 'operator' ? '操作员' : '观察员'}账号信息`);
        }
    };

    return(
        <>
            <Particles params={particlesConfig} />
            
            <div className="login-container">
                <div className="background-overlay"></div>
                
                {/* 左侧装饰区域 */}
                <div className="decoration-panel">
                    <div className="decoration-content">
                        <div className="logo-section">
                            <div className="logo-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor"/>
                                </svg>
                            </div>
                            <h1 className="brand-title">虚拟电厂</h1>
                            <p className="brand-subtitle">智能能源管理平台</p>
                        </div>
                        
                        <div className="features-list">
                            <div className="feature-item">
                                <div className="feature-icon">⚡</div>
                                <span>智能调度</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">📊</div>
                                <span>聚合调节</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🔋</div>
                                <span>能源管理</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🌐</div>
                                <span>实时监控</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右侧登录表单 */}
                <div className={`login-panel ${showForm ? 'show' : ''}`}>
                    <div className="login-form-container">
                        <div className="form-header">
                            <h2 className="form-title">欢迎回来</h2>
                            <p className="form-subtitle">登录您的虚拟电厂管理账户</p>
                        </div>
                        
                        {/* 快速登录区域 */}
                        <div className="quick-access">
                            <p className="quick-access-title">快速体验</p>
                            <div className="role-cards">
                                <div className="role-card admin" onClick={() => handleQuickLogin('admin')}>
                                    <div className="role-icon">👑</div>
                                    <span>管理员</span>
                                </div>
                                <div className="role-card operator" onClick={() => handleQuickLogin('operator')}>
                                    <div className="role-icon">⚙️</div>
                                    <span>操作员</span>
                                </div>
                                <div className="role-card viewer" onClick={() => handleQuickLogin('viewer')}>
                                    <div className="role-icon">👁️</div>
                                    <span>观察员</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="divider">
                            <span>或使用账号登录</span>
                        </div>
                        
                        <form className="login-form" onSubmit={handleLogin}>
                            <div className="input-group">
                                <div className="input-wrapper">
                                    <div className="input-icon">
                           
                                    </div>
                                    <input 
                                        type='text' 
                                        name="username"
                                        placeholder="请输入用户名" 
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.username ? 'error' : ''}`}
                                        required
                                    />
                                </div>
                                {errors.username && (
                                    <span className="error-text">{errors.username}</span>
                                )}
                            </div>
                            
                            <div className="input-group">
                                <div className="input-wrapper">
                                    <div className="input-icon">
                         
                                    </div>
                                    <input 
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="请输入密码" 
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.password ? 'error' : ''}`}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none">
                                            {showPassword ? (
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2"/>
                                            ) : (
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                                            )}
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="error-text">{errors.password}</span>
                                )}
                            </div>

                            {/* 登录消息显示 */}
                            {loginMessage && (
                                <div className={`message-box ${loginMessage.includes('成功') ? 'success' : loginMessage.includes('错误') ? 'error' : 'info'}`}>
                                    <div className="message-icon">
                                        {loginMessage.includes('成功') ? '✓' : 
                                         loginMessage.includes('错误') ? '✗' : 'ℹ'}
                                    </div>
                                    <span>{loginMessage}</span>
                                </div>
                            )}

                            <div className="form-actions">
                                <button 
                                    type="submit"
                                    className={`login-button ${isLoading ? 'loading' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="spinner"></div>
                                            <span>登录中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>立即登录</span>
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
                                            </svg>
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    type="button"
                                    className="register-button"
                                    onClick={handleRegister}
                                    disabled={isLoading}
                                >
                                    创建新账户
                                </button>
                            </div>
                        </form>

                        <div className="form-footer">
                            <p></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

