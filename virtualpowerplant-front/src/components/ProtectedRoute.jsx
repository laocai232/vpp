import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        // 如果没有登录，重定向到登录页面
        return <Navigate to="/login" replace />;
    }
    
    try {
        const user = JSON.parse(currentUser);
        // 检查登录是否过期（24小时）
        const loginTime = new Date(user.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            // 登录过期，清除用户信息并重定向到登录页面
            localStorage.removeItem('currentUser');
            return <Navigate to="/login" replace />;
        }
        
        // 用户已登录且未过期，渲染子组件
        return children;
    } catch (error) {
        // 如果解析用户信息失败，清除并重定向
        localStorage.removeItem('currentUser');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute; 