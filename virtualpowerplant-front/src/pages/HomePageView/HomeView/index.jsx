import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import ResourceAccess from '../ResourceAccess';
import OperationManagement from '../OperationManagement';
import ResourceMonitoring from '../ResourceMonitoring';
import AggregationControl from '../AggregationControl';
import DataReporting from '../DataReporting';
import TradingCenter from '../TradingCenter';
import earthData from './earthdata.json';
import DataReportingByte from '../DataReportingByte';
import homeViewApiService from './ApiService';
import ProjectStructureModal from '../../../components/ProjectStructureModal';
import './style.css';

export default function HomeView() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentModule, setCurrentModule] = useState('overview');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showProjectStructure, setShowProjectStructure] = useState(false);

    useEffect(() => {
        // 设置默认用户数据，避免一直显示加载中
        setUser({
            username: '管理员',
            role: 'admin'
        });

        // 实时时间更新
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const handleShowProjectStructure = () => {
        setShowProjectStructure(true);
    };

    const handleCloseProjectStructure = () => {
        setShowProjectStructure(false);
    };

    const modules = [
        { id: 'overview', name: '系统概览', icon: '🏠', color: '#667eea' },
        // { id: 'resource-access', name: '资源接入', icon: '🔌', color: '#a8edea' },
        { id: 'operation-management', name: '运营调度', icon: '⚙️', color: '#667eea' },
        { id: 'resource-monitoring', name: '资源监视', icon: '📊', color: '#11998e' },
        { id: 'aggregation-control', name: '辅助服务', icon: '🎛️', color: '#764ba2' },
        { id: 'data-reporting-byte', name: '数据上报', icon: '📤', color: '#fa709a' },
        { id: 'trading-center', name: '交易中心', icon: '💰', color: '#667eea' },
        // { id: 'tree-center', name: '树形结构', icon: '', color: '#667eea' }
    ];

    const renderCurrentModule = () => {
        switch (currentModule) {
            case 'resource-access':
                return <ResourceAccess />;
            case 'operation-management':
                return <OperationManagement />;
            case 'resource-monitoring':
                return <ResourceMonitoring />;
            case 'aggregation-control':
                return <AggregationControl />;
            // case 'data-reporting':
            //     return <DataReporting />;
            case 'data-reporting-byte':
                return <DataReportingByte />;
            case 'trading-center':
                return <TradingCenter />;
            default:
                return <SystemOverview user={user || {}} currentTime={currentTime} />;
        }
    };

    return (
        <div className="home-view">
            {/* 全局标题栏 */}
            <div className="global-header">
                <div className="title-decoration-left"></div>
                <div className="global-title-container">
                    <h1 className="global-title">虚拟电厂智能聚合调度系统</h1>
                    {/* <img className="img" src="./img/head.gif" alt="" /> */}
                </div>
                <div className="title-decoration-right"></div>
                <div className="system-status online">
                    <span className="status-dot"></span>
                    系统运行正常
                </div>
            </div>

            {/* 顶部导航栏 */}
            <div className="top-navigation">
                <div className="nav-left">
                    <button className="logout-btn" onClick={handleLogout}>
                        退出登录
                    </button>
                    {/* <button className="logout-btn project-structure-btn" onClick={handleShowProjectStructure}>
                        查看项目结构
                    </button> */}
                  
                </div>

                <div className="nav-center">
                    <div className="module-tabs">
                        {modules.map(module => (
                            <button
                                key={module.id}
                                className={`module-tab ${currentModule === module.id ? 'active' : ''}`}
                                onClick={() => setCurrentModule(module.id)}
                                style={{'--tab-color': module.color}}
                            >
                                <span className="tab-icon">{module.icon}</span>
                                <span className="tab-name">{module.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="nav-right">
                    {/* <div className="user-info">
                        <span className="user-name">{user.username}</span>
                        <span className="user-role">{getRoleDisplayName(user.role)}</span>
                    </div> */}
                      <span className="current-time">{currentTime.toLocaleString()}</span>
                </div>
            </div>

            {/* 主要内容区域 */}
            <div className="main-content">
                {renderCurrentModule()}
            </div>

            {/* 项目结构弹窗 */}
            <ProjectStructureModal
                visible={showProjectStructure}
                onClose={handleCloseProjectStructure}
            />
        </div>
    );
}

// 高端大屏监控风格的系统概览组件
function SystemOverview({ user, currentTime }) {
    const realTimePowerRef = useRef(null);
    const mapRef = useRef(null);
    const deviceStatusRef = useRef(null);
    const productionRef = useRef(null);
    const trendRef = useRef(null);
    const efficiencyRef = useRef(null);

    const [realTimeData, setRealTimeData] = useState({
        totalPower: 1200,
        totalVoltage: 1000,
        windPower: 1700,
        solarPower: 1161,
        loadData: [85, 92, 78, 96, 88, 95, 89]
    });

    const [selectedRegion, setSelectedRegion] = useState(null);
    
    // 模拟电站数据
    const [powerStations] = useState([
        {
            id: 1,
            name: '邢台主变电站',
            type: 'MAIN_STATION',
            coordinates: [114.507131, 37.064125],
            capacity: 500, // MW
            currentLoad: 420,
            voltage: '220kV',
            status: 'ONLINE',
            temperature: 35,
            efficiency: 92,
            lastMaintenance: '2024-01-15',
            description: '邢台市主要变电站，负责全市电力调配'
        },
        {
            id: 2,
            name: '信都变电站',
            type: 'SUB_STATION',
            coordinates: [114.473687, 37.068009],
            capacity: 300,
            currentLoad: 285,
            voltage: '110kV',
            status: 'ONLINE',
            temperature: 32,
            efficiency: 89,
            lastMaintenance: '2024-02-01',
            description: '信都区域变电站，服务周边工业区'
        },
        {
            id: 3,
            name: '南和电力站',
            type: 'POWER_PLANT',
            coordinates: [114.686945, 37.004428],
            capacity: 180,
            currentLoad: 165,
            voltage: '35kV',
            status: 'ONLINE',
            temperature: 38,
            efficiency: 94,
            lastMaintenance: '2024-01-28',
            description: '南和县火力发电站'
        },
        {
            id: 4,
            name: '任泽风电站',
            type: 'WIND_POWER',
            coordinates: [114.683061, 37.125894],
            capacity: 120,
            currentLoad: 95,
            voltage: '35kV',
            status: 'ONLINE',
            temperature: 28,
            efficiency: 87,
            lastMaintenance: '2024-02-10',
            description: '任泽区风力发电站，清洁能源'
        },
        {
            id: 5,
            name: '临城光伏站',
            type: 'SOLAR_POWER',
            coordinates: [114.498667, 37.442895],
            capacity: 80,
            currentLoad: 72,
            voltage: '10kV',
            status: 'ONLINE',
            temperature: 31,
            efficiency: 91,
            lastMaintenance: '2024-01-20',
            description: '临城县光伏发电站，太阳能发电'
        },
        {
            id: 6,
            name: '桥西配电站',
            type: 'DISTRIBUTION',
            coordinates: [114.485123, 37.076543],
            capacity: 50,
            currentLoad: 45,
            voltage: '10kV',
            status: 'MAINTENANCE',
            temperature: 35,
            efficiency: 85,
            lastMaintenance: '2024-02-18',
            description: '桥西区配电站，正在维护中'
        }
    ]);

    const [selectedStation, setSelectedStation] = useState(null);

    // 告警数据状态
    const [alertData, setAlertData] = useState([]);
    
    // 告警表格滚动引用
    const alertTableRef = useRef(null);
    
    // 自动滚动状态
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const autoScrollIntervalRef = useRef(null);
    
    // 交易历史数据状态
    const [tradingData, setTradingData] = useState([]);
    
    // 交易历史表格滚动引用
    const tradingTableRef = useRef(null);
    
    // 交易历史自动滚动状态
    const [tradingAutoScrollEnabled, setTradingAutoScrollEnabled] = useState(true);
    const tradingAutoScrollIntervalRef = useRef(null);

    // 生成模拟告警数据
    const generateAlertData = () => {
        const alertTypes = [
            { level: 'critical', levelText: '严重', levelIcon: '🔴', messages: [
                '变压器温度过高超过85°C',
                '主线路短路故障检测',
                '备用电源系统失效',
                '电压异常超出安全范围',
                '设备过载保护触发'
            ]},
            { level: 'warning', levelText: '警告', levelIcon: '🟡', messages: [
                '设备运行温度偏高',
                '负荷接近设定上限',
                '通信信号质量下降',
                '维护周期即将到期',
                '电能质量轻微异常'
            ]},
            { level: 'info', levelText: '信息', levelIcon: '🔵', messages: [
                '设备例行检查完成',
                '负荷调整操作成功',
                '系统配置更新完毕',
                '数据备份任务完成',
                '新设备接入成功'
            ]}
        ];

        const devices = [
            '邢台主变电站#1', '邢台主变电站#2', '信都变电站#1', '信都变电站#2',
            '南和电力站#1', '任泽风电站#1', '任泽风电站#2', '临城光伏站#1',
            '桥西配电站#1', '桥西配电站#2', '开发区变电站', '市区配电网'
        ];

        const statuses = ['pending', 'processing', 'resolved'];
        
        const newAlerts = [];
        const alertCount = Math.floor(Math.random() * 8) + 3; // 3-10条告警

        for (let i = 0; i < alertCount; i++) {
            const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            const device = devices[Math.floor(Math.random() * devices.length)];
            const message = alertType.messages[Math.floor(Math.random() * alertType.messages.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            // 生成最近2小时内的随机时间
            const now = new Date();
            const alertTime = new Date(now.getTime() - Math.random() * 2 * 60 * 60 * 1000);
            
            newAlerts.push({
                id: `alert-${Date.now()}-${i}`,
                time: alertTime.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                }),
                level: alertType.level,
                levelText: alertType.levelText,
                levelIcon: alertType.levelIcon,
                device,
                message,
                status,
                timestamp: alertTime.getTime(),
                isNew: Math.random() < 0.3 // 30%概率是新告警
            });
        }

        // 按时间倒序排列（最新的在前）
        return newAlerts.sort((a, b) => b.timestamp - a.timestamp);
    };

    // 初始化告警数据
    const initializeAlerts = () => {
        const initialAlerts = generateAlertData();
        setAlertData(initialAlerts);
    };

    // 添加新告警（模拟实时告警）
    const addNewAlert = () => {
        const alertTypes = [
            { level: 'critical', levelText: '严重', levelIcon: '🔴', messages: [
                '设备温度异常',
                '电压波动严重',
                '负荷超限告警'
            ]},
            { level: 'warning', levelText: '警告', levelIcon: '🟡', messages: [
                '设备性能下降',
                '通信延迟增加',
                '负荷接近上限'
            ]},
            { level: 'info', levelText: '信息', levelIcon: '🔵', messages: [
                '设备状态更新',
                '维护任务完成',
                '系统自检正常'
            ]}
        ];

        const devices = [
            '邢台主变电站#1', '信都变电站#2', '任泽风电站#1', 
            '临城光伏站#1', '桥西配电站#1'
        ];

        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const device = devices[Math.floor(Math.random() * devices.length)];
        const message = alertType.messages[Math.floor(Math.random() * alertType.messages.length)];
        
        const newAlert = {
            id: `alert-${Date.now()}`,
            time: new Date().toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            }),
            level: alertType.level,
            levelText: alertType.levelText,
            levelIcon: alertType.levelIcon,
            device,
            message,
            status: 'pending',
            timestamp: Date.now(),
            isNew: true
        };

        setAlertData(prevAlerts => {
            const updatedAlerts = [newAlert, ...prevAlerts];
            // 限制最多显示20条告警
            return updatedAlerts.slice(0, 20);
        });

        // 滚动到顶部显示新告警
        setTimeout(() => {
            if (alertTableRef.current) {
                alertTableRef.current.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }, 100); // 稍微延迟确保DOM更新完成

        // 3秒后移除新告警高亮
        setTimeout(() => {
            setAlertData(prevAlerts => 
                prevAlerts.map(alert => 
                    alert.id === newAlert.id 
                        ? { ...alert, isNew: false }
                        : alert
                )
            );
        }, 3000);
    };

    // 启动自动滚动
    const startAutoScroll = () => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
        }
        
        autoScrollIntervalRef.current = setInterval(() => {
            if (!autoScrollEnabled || !alertTableRef.current || alertData.length <= 5) {
                return;
            }

            const container = alertTableRef.current;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const currentScrollTop = container.scrollTop;
            
            // 计算下一个滚动位置
            const rowHeight = 45; // 估算的行高
            const nextScrollTop = currentScrollTop + rowHeight;
            
            if (nextScrollTop >= scrollHeight - clientHeight) {
                // 滚动到底部后，平滑回到顶部
                container.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                // 向下滚动一行
                container.scrollTo({
                    top: nextScrollTop,
                    behavior: 'smooth'
                });
            }
        }, 3000); // 每3秒滚动一行
    };

    // 停止自动滚动
    const stopAutoScroll = () => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
    };

    // 切换自动滚动状态
    const toggleAutoScroll = () => {
        setAutoScrollEnabled(prev => {
            const newState = !prev;
            if (newState) {
                startAutoScroll();
            } else {
                stopAutoScroll();
            }
            return newState;
        });
    };

    // 生成模拟交易历史数据
    const generateTradingData = () => {
        const tradingTypes = [
            { type: 'buy', typeText: '购电', typeIcon: '📈', color: '#ff6b6b' },
            { type: 'sell', typeText: '售电', typeIcon: '📉', color: '#00ff88' },
            { type: 'peak', typeText: '调峰', typeIcon: '⚡', color: '#f4e925' },
            { type: 'frequency', typeText: '调频', typeIcon: '🔄', color: '#00d4ff' }
        ];

        const counterparties = [
            '国网河北电力', '华北电力交易中心', '邢台供电公司', 
            '河北南网', '京津唐电网', '冀中能源集团',
            '华电邢台热电', '大唐邢台发电', '国电邢台电厂'
        ];

        const tradingRecords = [];
        const recordCount = Math.floor(Math.random() * 12) + 8; // 8-20条记录

        for (let i = 0; i < recordCount; i++) {
            const tradingType = tradingTypes[Math.floor(Math.random() * tradingTypes.length)];
            const counterparty = counterparties[Math.floor(Math.random() * counterparties.length)];
            
            // 生成最近24小时内的随机时间
            const now = new Date();
            const tradingTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
            
            // 生成交易量和价格
            const volume = (Math.random() * 500 + 50).toFixed(1); // 50-550 MWh
            const price = (Math.random() * 0.3 + 0.4).toFixed(3); // 0.4-0.7 元/MWh
            const amount = (parseFloat(volume) * parseFloat(price) * 1000).toFixed(0); // 总金额（元）
            
            tradingRecords.push({
                id: `trade-${Date.now()}-${i}`,
                time: tradingTime.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                }),
                date: tradingTime.toLocaleDateString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit'
                }),
                type: tradingType.type,
                typeText: tradingType.typeText,
                typeIcon: tradingType.typeIcon,
                typeColor: tradingType.color,
                counterparty,
                volume,
                price,
                amount,
                status: Math.random() > 0.1 ? 'completed' : 'pending', // 90%已完成
                timestamp: tradingTime.getTime(),
                isNew: Math.random() < 0.2 // 20%概率是新交易
            });
        }

        // 按时间倒序排列（最新的在前）
        return tradingRecords.sort((a, b) => b.timestamp - a.timestamp);
    };

    // 初始化交易历史数据
    const initializeTradingData = () => {
        const initialTradingData = generateTradingData();
        setTradingData(initialTradingData);
    };

    // 添加新交易记录（模拟实时交易）
    const addNewTradingRecord = () => {
        const tradingTypes = [
            { type: 'buy', typeText: '购电', typeIcon: '📈', color: '#ff6b6b' },
            { type: 'sell', typeText: '售电', typeIcon: '📉', color: '#00ff88' },
            { type: 'peak', typeText: '调峰', typeIcon: '⚡', color: '#f4e925' },
            { type: 'frequency', typeText: '调频', typeIcon: '🔄', color: '#00d4ff' }
        ];

        const counterparties = [
            '国网河北电力', '华北电力交易中心', '邢台供电公司', 
            '河北南网', '华电邢台热电'
        ];

        const tradingType = tradingTypes[Math.floor(Math.random() * tradingTypes.length)];
        const counterparty = counterparties[Math.floor(Math.random() * counterparties.length)];
        
        const volume = (Math.random() * 300 + 100).toFixed(1);
        const price = (Math.random() * 0.2 + 0.5).toFixed(3);
        const amount = (parseFloat(volume) * parseFloat(price) * 1000).toFixed(0);
        
        const newRecord = {
            id: `trade-${Date.now()}`,
            time: new Date().toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit'
            }),
            date: new Date().toLocaleDateString('zh-CN', {
                month: '2-digit',
                day: '2-digit'
            }),
            type: tradingType.type,
            typeText: tradingType.typeText,
            typeIcon: tradingType.typeIcon,
            typeColor: tradingType.color,
            counterparty,
            volume,
            price,
            amount,
            status: 'pending',
            timestamp: Date.now(),
            isNew: true
        };

        setTradingData(prevData => {
            const updatedData = [newRecord, ...prevData];
            return updatedData.slice(0, 25); // 限制最多显示25条记录
        });

        // 滚动到顶部显示新交易
        setTimeout(() => {
            if (tradingTableRef.current) {
                tradingTableRef.current.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }, 100);

        // 3秒后移除新交易高亮，并可能更新状态为已完成
        setTimeout(() => {
            setTradingData(prevData => 
                prevData.map(record => 
                    record.id === newRecord.id 
                        ? { 
                            ...record, 
                            isNew: false,
                            status: Math.random() > 0.3 ? 'completed' : 'pending'
                        }
                        : record
                )
            );
        }, 3000);
    };

    // 启动交易历史自动滚动
    const startTradingAutoScroll = () => {
        if (tradingAutoScrollIntervalRef.current) {
            clearInterval(tradingAutoScrollIntervalRef.current);
        }
        
        tradingAutoScrollIntervalRef.current = setInterval(() => {
            if (!tradingAutoScrollEnabled || !tradingTableRef.current || tradingData.length <= 6) {
                return;
            }

            const container = tradingTableRef.current;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const currentScrollTop = container.scrollTop;
            
            const rowHeight = 40; // 估算的行高
            const nextScrollTop = currentScrollTop + rowHeight;
            
            if (nextScrollTop >= scrollHeight - clientHeight) {
                container.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                container.scrollTo({
                    top: nextScrollTop,
                    behavior: 'smooth'
                });
            }
        }, 4000); // 每4秒滚动一行
    };

    // 停止交易历史自动滚动
    const stopTradingAutoScroll = () => {
        if (tradingAutoScrollIntervalRef.current) {
            clearInterval(tradingAutoScrollIntervalRef.current);
            tradingAutoScrollIntervalRef.current = null;
        }
    };

    // 获取电站类型信息
    const getStationTypeInfo = (type) => {
        const typeMap = {
            'MAIN_STATION': {
                name: '主变电站',
                icon: '🏭',
                color: '#ff6b35',
                size: 25
            },
            'SUB_STATION': {
                name: '变电站',
                icon: '⚡',
                color: '#00d4ff',
                size: 20
            },
            'POWER_PLANT': {
                name: '火力发电',
                icon: '🔥',
                color: '#ff4757',
                size: 22
            },
            'WIND_POWER': {
                name: '风力发电',
                icon: '💨',
                color: '#7bed9f',
                size: 20
            },
            'SOLAR_POWER': {
                name: '光伏发电',
                icon: '☀️',
                color: '#f4e925',
                size: 18
            },
            'DISTRIBUTION': {
                name: '配电站',
                icon: '🔌',
                color: '#5352ed',
                size: 16
            }
        };
        return typeMap[type] || { name: '未知', icon: '❓', color: '#999', size: 15 };
    };

    // 获取电站状态信息
    const getStationStatusInfo = (status) => {
        const statusMap = {
            'ONLINE': {
                name: '在线',
                color: '#00ff64',
                icon: '🟢'
            },
            'OFFLINE': {
                name: '离线',
                color: '#ff6b6b',
                icon: '🔴'
            },
            'MAINTENANCE': {
                name: '维护中',
                color: '#ff9500',
                icon: '🟡'
            },
            'ERROR': {
                name: '故障',
                color: '#ff4757',
                icon: '🔴'
            }
        };
        return statusMap[status] || { name: '未知', color: '#999', icon: '❓' };
    };

    const [deviceStats, setDeviceStats] = useState({
        total: 0,
        online: 0,
        offline: 0,
        onlineRate: 0,
        typeStats: {},
        trendData: { daily: [85, 92, 94, 96, 97], labels: ['昨日', '今日', '本周', '本月', '今年'] },
        lastUpdated: null,
        loading: true,
        error: null,
        deviceData: null,
        initialized: false
    });

    // 设备详情弹窗状态
    const [deviceDetailModal, setDeviceDetailModal] = useState({
        visible: false,
        status: null,
        devices: [],
        loading: false
    });

    // 获取设备统计数据
    const fetchDeviceStats = async () => {
        try {
            console.log('📡 正在获取设备统计数据...');
            setDeviceStats(prev => ({ ...prev, loading: true, error: null }));
            
            const startTime = performance.now();
            const result = await homeViewApiService.getDeviceOnlineStats();
            const endTime = performance.now();
            
            console.log(`📊 API调用耗时: ${(endTime - startTime).toFixed(2)}ms`);
            console.log('📋 API返回结果:', result);
            
            if (result.success && result.data) {
                console.log(`✅ 成功获取 ${result.data.total} 台设备的数据`);
                setDeviceStats(prev => ({
                    ...prev,
                    ...result.data,
                    loading: false,
                    error: null,
                    lastUpdated: new Date().toISOString(),
                    initialized: true
                }));
            } else {
                console.error('❌ 获取设备统计失败:', result.error);
                setDeviceStats(prev => ({
                    ...prev,
                    loading: false,
                    error: result.error || '获取设备数据失败'
                }));
            }
        } catch (error) {
            console.error('❌ 获取设备统计异常:', error);
            setDeviceStats(prev => ({
                ...prev,
                loading: false,
                error: '网络连接异常: ' + error.message
            }));
        }
    };

    // 日期格式化函数
    const formatDate = (dateValue) => {
        if (!dateValue) return '未知';
        
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return '未知';
            return date.toLocaleDateString('zh-CN');
        } catch (error) {
            return '未知';
        }
    };

    // 日期时间格式化函数
    const formatDateTime = (dateValue) => {
        if (!dateValue) return '未知';
        
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return '未知';
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return '未知';
        }
    };

    // 设备类型显示转换
    const getDeviceTypeDisplay = (deviceType) => {
        const typeMap = {
            'ELECTRIC_METER': '智能电表',
            'SOLAR_PANEL': '光伏板',
            'WIND_TURBINE': '风力发电机',
            'ENERGY_STORAGE': '储能设备',
            'INVERTER': '逆变器',
            'TRANSFORMER': '变压器',
            'SWITCH': '开关设备',
            'SENSOR': '传感器',
            'CONTROLLER': '控制器',
            'MONITOR': '监控设备'
        };
        return typeMap[deviceType] || deviceType || '未知类型';
    };

    // 获取指定状态的设备详情
    const fetchDeviceDetails = async (status) => {
        setDeviceDetailModal(prev => ({ ...prev, loading: true }));
        
        try {
            // 从设备统计数据中获取设备列表
            const allDevices = deviceStats.deviceData || [];
            
            // 根据状态过滤设备
            let filteredDevices = [];
            
            switch (status) {
                case '在线':
                    filteredDevices = allDevices.filter(device => 
                        device.status === 'ONLINE' || 
                        device.online === true || 
                        device.isOnline === true ||
                        device.state === 'running' ||
                        device.state === 'active'
                    );
                    break;
                case '离线':
                    filteredDevices = allDevices.filter(device => 
                        device.status === 'OFFLINE' || 
                        device.online === false || 
                        device.isOnline === false ||
                        (!device.status || device.status === 'offline')
                    );
                    break;
                case '故障':
                    filteredDevices = allDevices.filter(device => 
                        device.status === 'ERROR' || 
                        device.state === 'error' ||
                        device.state === 'fault'
                    );
                    break;
                case '维护中':
                    filteredDevices = allDevices.filter(device => 
                        device.status === 'MAINTENANCE' ||
                        device.state === 'maintenance'
                    );
                    break;
                default:
                    filteredDevices = allDevices;
            }

            // 使用数据库返回的真实数据，映射实际字段
            const devicesWithDetails = filteredDevices.map(device => ({
                ...device,
                // 基本信息字段映射
                name: device.name || '未知设备',
                type: getDeviceTypeDisplay(device.deviceType) || '未知类型',
                description: device.description || '暂无描述',
                
                // 网络配置信息
                ipAddress: device.ipAddress || '未知IP',
                port: device.port || null,
                slaveId: device.slaveId || null,
                
                // 状态和时间信息
                status: device.status || 'UNKNOWN',
                enabled: device.enabled !== undefined ? device.enabled : true,
                createTime: formatDateTime(device.createTime),
                updateTime: formatDateTime(device.updateTime),
                lastCommunicationTime: formatDateTime(device.lastCommunicationTime),
                
                // 设备ID
                deviceId: device.id || '未知ID',
                
                // 兼容性字段（保持原有显示逻辑）
                location: device.location || device.address || '未知位置',
                power: device.power || device.capacity || null,
                voltage: device.voltage || null,
                current: device.current || null,
                temperature: device.temperature || null,
                efficiency: device.efficiency || null,
                workingHours: device.workingHours || device.operationHours || null,
                manufacturer: device.manufacturer || device.vendor || '未知厂商',
                model: device.model || device.deviceModel || '未知型号'
            }));

            setDeviceDetailModal(prev => ({ 
                ...prev, 
                devices: devicesWithDetails, 
                loading: false 
            }));
            
        } catch (error) {
            console.error('获取设备详情失败:', error);
            setDeviceDetailModal(prev => ({ 
                ...prev, 
                devices: [], 
                loading: false 
            }));
        }
    };



    // 处理设备状态图表点击事件
    const handleDeviceStatusClick = (status) => {
        setDeviceDetailModal({
            visible: true,
            status: status,
            devices: [],
            loading: false
        });
        
        // 获取该状态的设备详情
        fetchDeviceDetails(status);
    };

    // 关闭设备详情弹窗
    const closeDeviceDetailModal = () => {
        setDeviceDetailModal({
            visible: false,
            status: null,
            devices: [],
            loading: false
        });
    };

    // 初始化页面和获取数据
    useEffect(() => {
        const initializePage = async () => {
            console.log('🚀 开始初始化页面...');
            
            // 第一步：初始化不依赖后端数据的图表
            console.log('📊 初始化静态图表...');
            initRealTimePowerChart();
            initMapChart();
            initProductionChart();
            initTrendChart();
            initEfficiencyChart();
            
            // 第二步：初始化告警数据
            console.log('🚨 初始化告警数据...');
            initializeAlerts();
            
            // 第三步：初始化交易历史数据
            console.log('💰 初始化交易历史数据...');
            initializeTradingData();
            
            // 第四步：启动自动滚动
            setTimeout(() => {
                startAutoScroll();
                startTradingAutoScroll();
            }, 2000); // 延迟2秒启动自动滚动
            
            // 第三步：获取设备数据
            console.log('📡 开始获取设备数据...');
            await fetchDeviceStats();
            console.log('✅ 设备数据获取完成');
            
            console.log('✅ 页面初始化完成');
        };

        initializePage();

        // 模拟实时数据更新
        const interval = setInterval(() => {
            setRealTimeData(prev => ({
                ...prev,
                totalPower: prev.totalPower + (Math.random() - 0.5) * 20,
                totalVoltage: prev.totalVoltage + (Math.random() - 0.5) * 10,
                windPower: prev.windPower + (Math.random() - 0.5) * 30,
                solarPower: prev.solarPower + (Math.random() - 0.5) * 25,
                loadData: prev.loadData.map(val => Math.max(0, Math.min(100, val + (Math.random() - 0.5) * 5)))
            }));
        }, 5000); // 增加更新间隔以减少性能消耗

        // 定期更新设备数据 - 减少更新频率
        const deviceInterval = setInterval(() => {
            console.log('🔄 定期更新设备数据...');
            fetchDeviceStats();
        }, 60000); // 改为每60秒更新一次

        // 模拟实时告警生成
        const alertInterval = setInterval(() => {
            // 20%概率产生新告警
            if (Math.random() < 0.2) {
                console.log('🚨 生成新告警...');
                addNewAlert();
            }
        }, 8000); // 每8秒检查一次

        // 模拟实时交易生成
        const tradingInterval = setInterval(() => {
            // 15%概率产生新交易
            if (Math.random() < 0.15) {
                console.log('💰 生成新交易...');
                addNewTradingRecord();
            }
        }, 12000); // 每12秒检查一次

        return () => {
            clearInterval(interval);
            clearInterval(deviceInterval);
            clearInterval(alertInterval);
            clearInterval(tradingInterval);
            stopAutoScroll();
            stopTradingAutoScroll();
            // 清理图表实例和相关定时器
            if (realTimePowerRef.current) echarts.dispose(realTimePowerRef.current);
            if (mapRef.current && mapRef.current.chartInstance) echarts.dispose(mapRef.current);
            if (deviceStatusRef.current) echarts.dispose(deviceStatusRef.current);
            if (productionRef.current) echarts.dispose(productionRef.current);
            if (trendRef.current) {
                if (trendRef.current.updateInterval) {
                    clearInterval(trendRef.current.updateInterval);
                }
                echarts.dispose(trendRef.current);
            }
            if (efficiencyRef.current) echarts.dispose(efficiencyRef.current);
        };
    }, []);

    // 监听设备数据变化，数据获取完成后初始化/更新设备状态图表
    useEffect(() => {
        if (deviceStats.initialized && !deviceStats.loading && !deviceStats.error) {
            console.log('📊 设备数据已就绪，初始化设备状态图表...');
            
            // 如果图表尚未初始化，则初始化
            if (!deviceStatusRef.current?.chartInstance) {
                initDeviceStatusChart();
            } else {
                // 如果图表已存在，则更新数据
            updateDeviceStatusChart(deviceStatusRef.current.chartInstance);
        }
        }
    }, [deviceStats.initialized, deviceStats.loading, deviceStats.error, deviceStats.total]);

    // 实时功率仪表盘
    const initRealTimePowerChart = () => {
        if (!realTimePowerRef.current) return;
        const chart = echarts.init(realTimePowerRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            series: [
                {
                    type: 'gauge',
                    center: ['50%', '60%'],
                    startAngle: 200,
                    endAngle: -20,
                    min: 0,
                    max: 2000,
                    splitNumber: 10,
                    itemStyle: {
                        color: '#00d4ff'
                    },
                    progress: {
                        show: true,
                        width: 30
                    },
                    pointer: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            width: 30
                        }
                    },
                    axisTick: {
                        distance: -45,
                        splitNumber: 5,
                        lineStyle: {
                            width: 2,
                            color: '#999'
                        }
                    },
                    splitLine: {
                        distance: -52,
                        length: 14,
                        lineStyle: {
                            width: 3,
                            color: '#999'
                        }
                    },
                    axisLabel: {
                        distance: -20,
                        color: '#999',
                        fontSize: 20
                    },
                    anchor: {
                        show: false
                    },
                    title: {
                        show: false
                    },
                    detail: {
                        valueAnimation: true,
                        width: '60%',
                        lineHeight: 40,
                        borderRadius: 8,
                        offsetCenter: [0, '-15%'],
                        fontSize: 30,
                        fontWeight: 'bolder',
                        formatter: '{value} A',
                        color: '#00d4ff'
                    },
                    data: [
                        {
                            value: realTimeData.totalPower
                        }
                    ]
                }
            ]
        };
        chart.setOption(option);
    };

    // 处理区域选中的函数
    const handleRegionSelect = (regionName) => {
        // 更新选中的区域状态
        setSelectedRegion(regionName);
        
        // 显示选中区域的信息
        console.log(`已选中区域: ${regionName}`);
        
        // 这里可以添加选中区域后的处理逻辑
        // 比如：显示该区域的详细信息、更新右侧面板、加载相关数据等
        
        // 示例：模拟加载该区域的数据
        setTimeout(() => {
            console.log(`${regionName} 的数据加载完成`);
            // 可以在这里更新相关的数据状态
        }, 500);
    };

    // 处理区域取消选中的函数
    const handleRegionUnselect = (regionName) => {
        setSelectedRegion(null);
        console.log(`已取消选中: ${regionName}`);
    };

    // 地图可视化
    const initMapChart = () => {
        if (!mapRef.current) return;
        // 注册地图（只注册一次）
        if (!echarts.getMap('xingtai')) {
            echarts.registerMap('xingtai', earthData);
        }
        const chart = echarts.init(mapRef.current, 'dark');
        
        // 存储被点击选中的区域
        let selectedRegions = new Set();
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(15, 20, 25, 0.9)',
                borderColor: 'rgba(0, 212, 255, 0.5)',
                borderWidth: 1,
                textStyle: {
                    color: '#fff',
                    fontSize: 14
                },
                formatter: function(params) {
                    if (params.componentType === 'geo') {
                        const regionName = params.name;
                        const isSelected = selectedRegions.has(regionName);
                        
                        return `
                            <div style="padding: 10px; min-width: 160px;">
                                <div style="color: #00d4ff; font-weight: bold; margin-bottom: 6px; font-size: 15px;">
                                    📍 ${regionName}
                                </div>
                                <div style="margin-bottom: 4px; font-size: 12px; color: #ccc;">
                                    ${isSelected ? '🟡 当前已选中' : '💡 点击选中此区域'}
                                </div>
                                <div style="font-size: 11px; color: #999; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px; margin-top: 4px;">
                                    ${isSelected ? '再次点击可取消选中' : '选中后可查看详细信息'}
                                </div>
                            </div>
                        `;
                    } else if (params.componentType === 'series') {
                        const stationData = powerStations.find(station => station.name === params.name);
                        if (stationData) {
                            const typeInfo = getStationTypeInfo(stationData.type);
                            const statusInfo = getStationStatusInfo(stationData.status);
                            const loadPercent = Math.round((stationData.currentLoad / stationData.capacity) * 100);
                            
                            return `
                                <div style="padding: 12px; min-width: 200px;">
                                    <div style="color: ${typeInfo.color}; font-weight: bold; margin-bottom: 8px; font-size: 14px;">
                                        ${typeInfo.icon} ${stationData.name}
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                                        <div style="color: #ccc;">类型: <span style="color: #fff;">${typeInfo.name}</span></div>
                                        <div style="color: #ccc;">状态: <span style="color: ${statusInfo.color};">${statusInfo.icon} ${statusInfo.name}</span></div>
                                        <div style="color: #ccc;">容量: <span style="color: #00d4ff;">${stationData.capacity}MW</span></div>
                                        <div style="color: #ccc;">负载: <span style="color: #f4e925;">${stationData.currentLoad}MW</span></div>
                                        <div style="color: #ccc;">电压: <span style="color: #ff6b35;">${stationData.voltage}</span></div>
                                        <div style="color: #ccc;">负载率: <span style="color: ${loadPercent > 90 ? '#ff6b6b' : loadPercent > 70 ? '#ff9500' : '#00ff64'};">${loadPercent}%</span></div>
                                    </div>
                                    <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 10px; color: #999;">
                                        ${stationData.description}
                                    </div>
                                    <div style="margin-top: 4px; font-size: 9px; color: #666;">
                                        💡 点击查看详细信息
                                    </div>
                                </div>
                            `;
                        }
                        return `
                            <div style="padding: 8px;">
                                <div style="color: #f4e925; font-weight: bold; margin-bottom: 4px;">
                                    ⚡ ${params.name}
                                </div>
                                <div style="font-size: 12px; color: #ccc;">
                                    发电容量: ${params.value[2] || 0}MW
                                </div>
                            </div>
                        `;
                    }
                }
            },
            geo: {
                map: 'xingtai',
                roam: true,
                scaleLimit: {
                    min: 0.8,
                    max: 3
                },
                zoom: 1.2,
                center: [114.5, 37.0],
                label: {
                    show: true,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 'bold',
                    textShadowColor: 'rgba(0, 0, 0, 0.8)',
                    textShadowBlur: 3,
                    textShadowOffsetX: 1,
                    textShadowOffsetY: 1
                },
                itemStyle: {
                    areaColor: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(50, 60, 72, 0.8)' },
                            { offset: 1, color: 'rgba(42, 51, 61, 0.9)' }
                        ]
                    },
                    borderColor: 'rgba(0, 212, 255, 0.4)',
                    borderWidth: 1,
                    shadowColor: 'rgba(0, 212, 255, 0.3)',
                    shadowBlur: 5
                },
                emphasis: {
                    label: {
                        show: true,
                        color: '#00d4ff',
                        fontSize: 13,
                        fontWeight: 'bold',
                        textShadowColor: 'rgba(0, 0, 0, 0.9)',
                        textShadowBlur: 4
                    },
                    itemStyle: {
                        areaColor: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
                                { offset: 1, color: 'rgba(0, 180, 220, 0.6)' }
                            ]
                        },
                        borderColor: '#00d4ff',
                        borderWidth: 2,
                        shadowColor: 'rgba(0, 212, 255, 0.8)',
                        shadowBlur: 15,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0
                    }
                },
                select: {
                    label: {
                        show: true,
                        color: '#f4e925',
                        fontSize: 14,
                        fontWeight: 'bold',
                        textShadowColor: 'rgba(0, 0, 0, 0.9)',
                        textShadowBlur: 5,
                        textBorderColor: 'rgba(0, 0, 0, 0.8)',
                        textBorderWidth: 1
                    },
                    itemStyle: {
                        areaColor: {
                            type: 'radial',
                            x: 0.5, y: 0.5, r: 0.8,
                            colorStops: [
                                { offset: 0, color: 'rgba(244, 233, 37, 0.7)' },
                                { offset: 0.5, color: 'rgba(255, 215, 0, 0.6)' },
                                { offset: 1, color: 'rgba(220, 210, 30, 0.8)' }
                            ]
                        },
                        borderColor: '#f4e925',
                        borderWidth: 4,
                        shadowColor: 'rgba(244, 233, 37, 1)',
                        shadowBlur: 25,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0
                    }
                }
            },
            series: [
                {
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    data: powerStations.map(station => {
                        const typeInfo = getStationTypeInfo(station.type);
                        return {
                            name: station.name,
                            value: [...station.coordinates, station.capacity],
                            stationData: station,
                            symbolSize: typeInfo.size,
                            itemStyle: {
                                color: station.status === 'MAINTENANCE' ? '#ff9500' : 
                                       station.status === 'OFFLINE' ? '#ff6b6b' :
                                       station.status === 'ERROR' ? '#ff4757' : typeInfo.color,
                                borderColor: '#fff',
                                borderWidth: 2,
                                shadowColor: typeInfo.color,
                                shadowBlur: 8
                            }
                        };
                    }),
                    symbolSize: function (val, params) {
                        // 根据电站类型返回不同大小
                        if (params.data && params.data.symbolSize) {
                            return params.data.symbolSize;
                        }
                        return Math.max(8, val[2] / 15);
                    },
                    showEffectOn: 'render',
                    rippleEffect: {
                        brushType: 'stroke',
                        color: 'rgba(244, 233, 37, 0.8)',
                        number: 3,
                        period: 4,
                        scale: 2.5
                    },
                    label: {
                        formatter: function(params) {
                            return params.name;
                        },
                        position: 'top',
                        show: true,
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 'bold',
                        textShadowColor: 'rgba(0, 0, 0, 0.8)',
                        textShadowBlur: 3,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: 4,
                        padding: [2, 6]
                    },
                    itemStyle: {
                        color: {
                            type: 'radial',
                            x: 0.5, y: 0.5, r: 0.5,
                            colorStops: [
                                { offset: 0, color: '#f4e925' },
                                { offset: 0.7, color: '#ff6b35' },
                                { offset: 1, color: '#ff4757' }
                            ]
                        },
                        shadowBlur: 15,
                        shadowColor: 'rgba(244, 233, 37, 0.8)',
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    emphasis: {
                        scale: 1.5,
                        itemStyle: {
                            shadowBlur: 25,
                            shadowColor: 'rgba(244, 233, 37, 1)'
                        }
                    }
                }
            ]
        };
        
        chart.setOption(option);
        
        // 添加点击事件处理
        chart.on('click', function(params) {
            if (params.componentType === 'geo') {
                const regionName = params.name;
                
                // 切换选中状态
                if (selectedRegions.has(regionName)) {
                    selectedRegions.delete(regionName);
                    // 取消选中
                    chart.dispatchAction({
                        type: 'geoUnSelect',
                        name: regionName
                    });
                    
                    // 调用取消选中处理函数
                    handleRegionUnselect(regionName);
                } else {
                    selectedRegions.add(regionName);
                    // 选中区域
                    chart.dispatchAction({
                        type: 'geoSelect',
                        name: regionName
                    });
                    
                    // 调用选中处理函数
                    handleRegionSelect(regionName);
                }
            } else if (params.componentType === 'series') {
                // 处理电站点击事件
                const stationData = params.data.stationData;
                if (stationData) {
                    setSelectedStation(stationData);
                    console.log('点击了电站:', stationData.name);
                    
                    // 显示电站详细信息（可以添加弹窗或侧边栏）
                    alert(`电站详情：
名称：${stationData.name}
类型：${getStationTypeInfo(stationData.type).name}
状态：${getStationStatusInfo(stationData.status).name}
容量：${stationData.capacity}MW
当前负载：${stationData.currentLoad}MW
负载率：${Math.round((stationData.currentLoad / stationData.capacity) * 100)}%
电压等级：${stationData.voltage}
描述：${stationData.description}`);
                }
            }
        });
        
        // 添加鼠标悬停事件
        chart.on('mouseover', function(params) {
            if (params.componentType === 'geo') {
                // 高亮当前区域
                chart.dispatchAction({
                    type: 'highlight',
                    name: params.name
                });
            }
        });
        
        chart.on('mouseout', function(params) {
            if (params.componentType === 'geo') {
                // 取消高亮，但保持选中状态
                chart.dispatchAction({
                    type: 'downplay',
                    name: params.name
                });
            }
        });
        
        // 添加双击事件，清除所有选中
        chart.on('dblclick', function(params) {
            if (!params || params.componentType !== 'geo') {
                // 双击空白区域，清除所有选中
                selectedRegions.forEach(regionName => {
                    chart.dispatchAction({
                        type: 'geoUnSelect',
                        name: regionName
                    });
                });
                selectedRegions.clear();
                setSelectedRegion(null);
                console.log('已清除所有选中区域');
            }
        });

        // 保存chart实例以便后续操作
        mapRef.current.chartInstance = chart;
    };

    // 设备状态柱状图
    const initDeviceStatusChart = () => {
        if (!deviceStatusRef.current) {
            console.warn('⚠️ 设备状态图表容器未找到');
            return;
        }
        
        console.log('📊 初始化设备状态图表...');
        const chart = echarts.init(deviceStatusRef.current, 'dark');
        
        // 添加点击事件处理
        chart.on('click', function(params) {
            if (params.componentType === 'series') {
                const statusName = params.name;
                console.log('👆 点击了设备状态:', statusName);
                handleDeviceStatusClick(statusName);
            }
        });
        
        // 保存chart实例以便后续更新
        deviceStatusRef.current.chartInstance = chart;
        
        // 立即更新图表数据
        updateDeviceStatusChart(chart);
        
        console.log('✅ 设备状态图表初始化完成');
    };

    const updateDeviceStatusChart = (chart) => {
        if (!chart) {
            console.warn('⚠️ 图表实例不存在，无法更新');
            return;
        }
        
        const { deviceData, loading, error, onlineRate } = deviceStats;
        console.log('🔄 更新设备状态图表，数据状态:', { 
            hasData: !!deviceData, 
            dataLength: deviceData?.length || 0, 
            loading, 
            error 
        });
        
        // 如果正在加载，显示加载状态
        if (loading) {
            chart.showLoading('default', {
                text: '正在加载设备数据...',
                color: '#00d4ff',
                textColor: '#fff',
                maskColor: 'rgba(0, 0, 0, 0.8)'
            });
            return;
        }
        
        // 隐藏加载状态
        chart.hideLoading();
        
        // 根据后端返回的设备name构建图表数据
        let chartLabels = [];
        let chartData = [];
        
        if (deviceData && Array.isArray(deviceData) && deviceData.length > 0) {
            // 状态映射表
            const statusMap = {
                'ONLINE': '在线',
                'OFFLINE': '离线', 
                'ERROR': '故障',
                'MAINTENANCE': '维护中'
            };
            
            // 统计各状态的设备数量
            const statusCount = {
                'ONLINE': 0,
                'OFFLINE': 0,
                'ERROR': 0,
                'MAINTENANCE': 0
            };
            
            deviceData.forEach(device => {
                const status = device.status ? device.status.toUpperCase() : 'OFFLINE';
                if (statusCount.hasOwnProperty(status)) {
                    statusCount[status]++;
                } else {
                    // 如果是其他状态，根据在线状态判断
                    const isOnline = device.online === true || 
                                   device.isOnline === true ||
                                   device.state === 'running' ||
                                   device.state === 'active';
                    statusCount[isOnline ? 'ONLINE' : 'OFFLINE']++;
                }
            });
            
            // 构建图表数据
            chartLabels = Object.keys(statusCount).map(status => statusMap[status]);
            chartData = Object.values(statusCount);
        } else {
            // 如果没有设备数据，显示空状态
            chartLabels = ['在线', '离线', '故障', '维护中'];
            chartData = [0, 0, 0, 0];
        }
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                    shadowStyle: {
                        color: 'rgba(0, 212, 255, 0.3)'
                    }
                },
                backgroundColor: 'rgba(15, 20, 25, 0.9)',
                borderColor: 'rgba(0, 212, 255, 0.5)',
                borderWidth: 1,
                textStyle: {
                    color: '#fff'
                },
                formatter: function(params) {
                    const data = params[0];
                    const statusName = data.name;
                    const deviceCount = data.value;
                    
                    // 状态图标和颜色映射
                    const statusInfo = {
                        '在线': { icon: '🟢', color: '#00ff64' },
                        '离线': { icon: '🔴', color: '#ff6b6b' },
                        '故障': { icon: '⚠️', color: '#ff9500' },
                        '维护中': { icon: '🔧', color: '#70a1ff' }
                    };
                    
                    const info = statusInfo[statusName] || { icon: '❓', color: '#999' };
                    
                    // 计算百分比（如果有总数的话）
                    const totalDevices = deviceData ? deviceData.length : 0;
                    const percentage = totalDevices > 0 ? Math.round((deviceCount / totalDevices) * 100) : 0;
                    
                    return `
                        <div style="padding: 10px;">
                            <div style="color: #00d4ff; font-weight: bold; margin-bottom: 6px; font-size: 14px;">
                                ${info.icon} ${statusName}设备
                            </div>
                            <div style="margin-bottom: 4px; font-size: 16px;">
                                数量: <span style="color: ${info.color}; font-weight: bold;">${deviceCount}台</span>
                            </div>
                            ${totalDevices > 0 ? `<div style="font-size: 12px; color: #999;">
                                占比: ${percentage}%
                            </div>` : ''}
                            <div style="font-size: 10px; color: #666; margin-top: 6px; border-top: 1px solid #333; padding-top: 4px;">
                                💡 点击查看${statusName}设备详情
                            </div>
                        </div>
                    `;
                }
            },
            grid: {
                left: '8%',
                right: '5%',
                bottom: '20%',
                top: '15%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: chartLabels,
                    axisTick: {
                        alignWithLabel: true,
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.3)'
                        }
                    },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 500,
                        rotate: 0,
                        interval: 0,
                        margin: 8
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.5)',
                            width: 2
                        }
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    min: 0,
                    max: function(value) {
                        // 为标签预留空间，增加20%的余量
                        return Math.ceil(value.max * 1.2);
                    },
                    axisLabel: {
                        color: '#fff',
                        formatter: '{value}台',
                        fontSize: 10
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.5)',
                            width: 2
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.15)',
                            type: 'dashed'
                        }
                    }
                }
            ],
            series: [
                {
                    name: '设备在线率',
                    type: 'bar',
                    barWidth: '45%',
                    data: loading ? [] : chartData,
                    itemStyle: {
                        color: function(params) {
                            const statusName = chartLabels[params.dataIndex];
                            
                            switch(statusName) {
                                case '在线':
                                    // 在线 - 绿色渐变
                                    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: '#00ff64' },
                                        { offset: 0.5, color: '#00e056' },
                                        { offset: 1, color: '#00cc51' }
                                    ]);
                                case '离线':
                                    // 离线 - 红色渐变
                                    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: '#ff6b6b' },
                                        { offset: 0.5, color: '#ff5555' },
                                        { offset: 1, color: '#e55555' }
                                    ]);
                                case '故障':
                                    // 故障 - 橙色渐变
                                    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: '#ff9500' },
                                        { offset: 0.5, color: '#ff8c00' },
                                        { offset: 1, color: '#e6800e' }
                                    ]);
                                case '维护中':
                                    // 维护中 - 蓝色渐变
                                    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: '#70a1ff' },
                                        { offset: 0.5, color: '#5352ed' },
                                        { offset: 1, color: '#3c40c6' }
                                    ]);
                                default:
                                    // 默认 - 灰色渐变
                                    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: '#999' },
                                        { offset: 0.5, color: '#888' },
                                        { offset: 1, color: '#777' }
                                    ]);
                            }
                        },
                        borderRadius: [3, 3, 0, 0],
                        shadowColor: 'rgba(0, 212, 255, 0.3)',
                        shadowBlur: 6
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: function(params) {
                            return `${params.value}台`;
                        },
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 11,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: 3,
                        padding: [3, 6],
                        distance: 8
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 12,
                            shadowColor: 'rgba(0, 212, 255, 0.6)'
                        }
                    },
                    animationDelay: function (idx) {
                        return idx * 100;
                    }
                }
            ],
            animationEasing: 'cubicOut',
            animationDuration: 800
        };
        
        // 如果有错误，显示错误信息
        if (error) {
            option.graphic = [
                {
                    type: 'text',
                    left: 'center',
                    top: 'middle',
                    style: {
                        text: `⚠️ 数据加载失败\n${error}`,
                        fill: '#ff6b6b',
                        fontSize: 12,
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }
                }
            ];
        }
        
        // 如果正在加载，显示加载提示
        if (loading) {
            option.graphic = [
                {
                    type: 'text',
                    left: 'center',
                    top: 'middle',
                    style: {
                        text: '📊 正在加载设备数据...',
                        fill: '#00d4ff',
                        fontSize: 12,
                        textAlign: 'center'
                    }
                }
            ];
        }
        
        chart.setOption(option);
        
        console.log('✅ 设备状态图表更新完成');
    };

    // 产能结构饼图
    const initProductionChart = () => {
        if (!productionRef.current) return;
        const chart = echarts.init(productionRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: {
                    color: '#fff'
                }
            },
            series: [
                {
                    name: '产能结构',
                    type: 'pie',
                    radius: '50%',
                    center: ['60%', '50%'],
                    data: [
                        { value: 1048, name: '光伏发电' },
                        { value: 735, name: '风力发电' },
                        { value: 580, name: '储能系统' },
                        { value: 484, name: '水力发电' },
                        { value: 300, name: '其他' }
                    ],
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        chart.setOption(option);
    };

    // 趋势折线图
    const initTrendChart = () => {
        if (!trendRef.current) return;
        const chart = echarts.init(trendRef.current, 'dark');
        
        // 生成24小时的时间点
        const timePoints = [];
        for (let i = 0; i < 24; i++) {
            timePoints.push(String(i).padStart(2, '0') + ':00');
        }
        
        // 生成典型的日负荷曲线数据（单位：MW）
        const loadData = [
            650, 630, 615, 610, 620, 640, 680, 750,   // 0-7点：夜间低谷期
            820, 890, 950, 980, 1020, 1050, 1080, 1120, // 8-15点：白天用电高峰
            1150, 1180, 1200, 1160, 1100, 980, 850, 720  // 16-23点：傍晚高峰后下降
        ];
        
        // 发电功率曲线（包含风电、光伏、火电等）
        const generationData = [
            580, 560, 545, 540, 550, 570, 610, 680,   // 0-7点：基荷火电为主
            750, 830, 920, 980, 1050, 1120, 1150, 1180, // 8-15点：光伏发电增加
            1160, 1140, 1100, 1020, 940, 820, 720, 650  // 16-23点：光伏减少，风电补充
        ];
        
        // 计算负荷率（发电/用电）
        const loadRate = loadData.map((load, index) => {
            return ((generationData[index] / load) * 100).toFixed(1);
        });
        
        const option = {
            backgroundColor: 'transparent',
            title: {
                show: false
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(15, 20, 25, 0.9)',
                borderColor: 'rgba(0, 212, 255, 0.5)',
                borderWidth: 1,
                textStyle: {
                    color: '#fff',
                    fontSize: 13
                },
                formatter: function(params) {
                    let result = `<div style="padding: 5px;"><strong>${params[0].axisValue}</strong><br/>`;
                    params.forEach(param => {
                        const color = param.color;
                        const value = param.value;
                        const unit = param.seriesName.includes('负荷率') ? '%' : 'MW';
                        result += `<div style="margin: 4px 0;">
                            <span style="display:inline-block;margin-right:8px;border-radius:2px;width:10px;height:10px;background-color:${color};"></span>
                            ${param.seriesName}: <span style="color:${color};font-weight:bold;">${value}${unit}</span>
                        </div>`;
                    });
                    result += '</div>';
                    return result;
                }
            },
            legend: {
                data: ['用电负荷', '发电功率', '负荷率'],
                textStyle: {
                    color: '#fff',
                    fontSize: 12
                },
                top: '3%',
                itemGap: 20,
                icon: 'roundRect'
            },
            grid: {
                left: '8%',
                right: '8%',
                bottom: '15%',
                top: '18%',
                containLabel: false
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: timePoints,
                axisLabel: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: 11,
                    interval: 2, // 每隔2个点显示一个标签
                    rotate: 0
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.4)',
                        width: 1
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.3)'
                    }
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '功率 (MW)',
                    nameTextStyle: {
                        color: '#00d4ff',
                        fontSize: 12
                    },
                    axisLabel: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: 11,
                        formatter: '{value}'
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.4)'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.15)',
                            type: 'dashed'
                        }
                    },
                    min: 500,
                    max: 1300
                },
                {
                    type: 'value',
                    name: '负荷率 (%)',
                    nameTextStyle: {
                        color: '#f4e925',
                        fontSize: 12
                    },
                    position: 'right',
                    axisLabel: {
                        color: 'rgba(244, 233, 37, 0.8)',
                        fontSize: 11,
                        formatter: '{value}%'
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: 'rgba(244, 233, 37, 0.4)'
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    min: 80,
                    max: 110
                }
            ],
            series: [
                {
                    name: '用电负荷',
                    type: 'line',
                    yAxisIndex: 0,
                    data: loadData,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 4,
                    lineStyle: {
                        color: '#ff6b6b',
                        width: 3,
                        shadowColor: 'rgba(255, 107, 107, 0.3)',
                        shadowBlur: 6
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(255, 107, 107, 0.4)' },
                            { offset: 1, color: 'rgba(255, 107, 107, 0.05)' }
                        ])
                    },
                    emphasis: {
                        focus: 'series',
                        lineStyle: {
                            width: 4
                        }
                    }
                },
                {
                    name: '发电功率',
                    type: 'line',
                    yAxisIndex: 0,
                    data: generationData,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 4,
                    lineStyle: {
                        color: '#00d4ff',
                        width: 3,
                        shadowColor: 'rgba(0, 212, 255, 0.3)',
                        shadowBlur: 6
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
                            { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
                        ])
                    },
                    emphasis: {
                        focus: 'series',
                        lineStyle: {
                            width: 4
                        }
                    }
                },
                {
                    name: '负荷率',
                    type: 'line',
                    yAxisIndex: 1,
                    data: loadRate,
                    smooth: true,
                    symbol: 'diamond',
                    symbolSize: 5,
                    lineStyle: {
                        color: '#f4e925',
                        width: 2,
                        type: 'dashed',
                        shadowColor: 'rgba(244, 233, 37, 0.3)',
                        shadowBlur: 4
                    },
                    itemStyle: {
                        color: '#f4e925',
                        borderColor: '#f4e925',
                        borderWidth: 2
                    },
                    emphasis: {
                        focus: 'series',
                        lineStyle: {
                            width: 3
                        }
                    }
                }
            ],
            animation: true,
            animationDuration: 2000,
            animationEasing: 'cubicOut'
        };
        chart.setOption(option);
        
        // 存储图表实例以便后续更新
        trendRef.current.chartInstance = chart;
        
        // 模拟实时数据更新
        const updateInterval = setInterval(() => {
            // 随机微调数据模拟实时变化
            const newLoadData = loadData.map(val => 
                Math.max(500, Math.min(1400, val + (Math.random() - 0.5) * 20))
            );
            const newGenerationData = generationData.map(val => 
                Math.max(450, Math.min(1300, val + (Math.random() - 0.5) * 15))
            );
            const newLoadRate = newLoadData.map((load, index) => {
                return ((newGenerationData[index] / load) * 100).toFixed(1);
            });
            
            chart.setOption({
                series: [
                    { data: newLoadData },
                    { data: newGenerationData },
                    { data: newLoadRate }
                ]
            });
        }, 10000); // 每10秒更新一次
        
        // 组件卸载时清理定时器
        if (trendRef.current) {
            trendRef.current.updateInterval = updateInterval;
        }
    };

    // 效率雷达图
    const initEfficiencyChart = () => {
        if (!efficiencyRef.current) return;
        const chart = echarts.init(efficiencyRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            radar: {
                indicator: [
                    { name: '系统效率', max: 100 },
                    { name: '设备利用率', max: 100 },
                    { name: '能源转换率', max: 100 },
                    { name: '故障率', max: 100 },
                    { name: '维护效率', max: 100 },
                    { name: '环保指数', max: 100 }
                ],
                center: ['50%', '50%'],
                radius: 80,
                axisName: {
                    color: '#fff'
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.3)'
                    }
                },
                splitArea: {
                    areaStyle: {
                        color: ['rgba(0, 212, 255, 0.1)', 'rgba(0, 212, 255, 0.05)']
                    }
                }
            },
            series: [
                {
                    name: '系统效率',
                    type: 'radar',
                    data: [
                        {
                            value: [92, 87, 95, 85, 90, 88],
                            name: '当前系统'
                        }
                    ],
                    itemStyle: {
                        color: '#00d4ff'
                    },
                    areaStyle: {
                        color: 'rgba(0, 212, 255, 0.3)'
                    },
                    lineStyle: {
                        color: '#00d4ff',
                        width: 2
                    }
                }
            ]
        };
        chart.setOption(option);
    };

    return (
        <div className="dashboard-overview">
            {/* 标题栏 */}
            <div className="dashboard-header">
                <div className="header-left">
                    <span className="header-icon">🔌</span>
               
                    <h1>电厂分布面板</h1>
                </div>
                <div className="header-center">

                </div>
                <div className="header-right">
                    <span className="header-icon">📊</span>
                    <span>实时监控</span>
                    <span className="header-icon">🛡️</span>
                    <span>系统安全</span>
                </div>
            </div>

            {/* 主要仪表盘区域 */}
            <div className="dashboard-grid">

                {/* 中央 - 地图区域 */}
                <div
                    className="dashboard-card map-container map-container-enhanced"
                    onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 0 80px 0 #00d4ff, 0 0 40px 0 #00d4ff55';
                        e.currentTarget.style.borderColor = '#00f6ff';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 0 40px 0 rgba(0,212,255,0.18)';
                        e.currentTarget.style.borderColor = '#00d4ff';
                    }}
                >
                    <div className="map-title-enhanced">
                        <span className="title-icon map-title-icon">🗺️</span>
                        邢台市电力资源分布
                        <div className="map-title-underline"></div>
                        
                        {/* 电站统计信息 */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '8px',
                            fontSize: '0.75em',
                            gap: '12px'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                flex: 1
                            }}>
                                <span style={{ color: '#00d4ff' }}>
                                    🏭 总计: {powerStations.length}座
                                </span>
                                <span style={{ color: '#00ff64' }}>
                                    🟢 在线: {powerStations.filter(s => s.status === 'ONLINE').length}座
                                </span>
                                <span style={{ color: '#ff9500' }}>
                                    🟡 维护: {powerStations.filter(s => s.status === 'MAINTENANCE').length}座
                                </span>
                                <span style={{ color: '#ff6b6b' }}>
                                    🔴 离线: {powerStations.filter(s => s.status === 'OFFLINE').length}座
                                </span>
                            </div>
                            
                            {selectedStation && (
                                <div style={{
                                    fontSize: '0.9em',
                                    color: '#f4e925',
                                    textAlign: 'right',
                                    minWidth: 'fit-content'
                                }}>
                                    ⚡ 已选电站: {selectedStation.name}
                                </div>
                            )}
                        </div>
                        
                        {selectedRegion && (
                            <div style={{
                                fontSize: '0.8em',
                                color: '#f4e925',
                                marginTop: '4px',
                                fontWeight: 'normal',
                                textShadow: '0 0 8px #f4e92555'
                            }}>
                                📍 当前选中区域: {selectedRegion}
                            </div>
                        )}
                    </div>
                    <div ref={mapRef} className="map-content-area"></div>
                    
        
                </div>

                {/* 左上 - 设备在线率 */}
                <div className="dashboard-card real-time-data device-status-card">
                    <div className="card-title device-status-title">
                        <span className="title-icon device-status-icon">📟</span>
                        设备在线率监控
                        {/* <span className="click-hint">💡 点击柱状图查看详情</span> */}
                        
                        <div className="control-buttons">
                            <button 
                                className="refresh-btn" 
                                onClick={() => {
                                    console.log('🔄 手动刷新设备数据');
                                    fetchDeviceStats();
                                }}
                                disabled={deviceStats.loading}
                                style={{
                                    marginLeft: '10px',
                                    padding: '4px 8px',
                                    fontSize: '0.7em',
                                    background: deviceStats.loading ? 'rgba(100, 100, 100, 0.3)' : 'rgba(0, 255, 100, 0.2)',
                                    border: '1px solid rgba(0, 255, 100, 0.5)',
                                    borderRadius: '4px',
                                    color: deviceStats.loading ? '#888' : '#00ff64',
                                    cursor: deviceStats.loading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                {deviceStats.loading ? '🔄' : '🔃'} 刷新数据
                            </button>
                        
                        
                        </div>
                    </div>
                    
                    {/* 数据状态显示 */}
                    <div className="data-status">
  
                        {deviceStats.lastUpdated && (
                            <span className="last-updated">
                                最后更新: {new Date(deviceStats.lastUpdated).toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    
                    {/* 在线率趋势图表 */}
                    <div className="chart-container">
                        {!deviceStats.initialized && (
                            <div className="chart-placeholder" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '280px',
                                fontSize: '14px',
                                color: '#00d4ff',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '8px',
                                border: '1px dashed rgba(0, 212, 255, 0.3)'
                            }}>
                                📊 等待设备数据加载...
                            </div>
                        )}
                        <div 
                            ref={deviceStatusRef} 
                            className="device-status-content"
                            style={{
                                display: deviceStats.initialized ? 'block' : 'none',
                                height: '280px'
                            }}
                        ></div>
                    </div>
                </div>

                {/* 右上 - 产能结构 */}
                <div className="dashboard-card device-status production-structure-card">
                    <div className="card-title production-structure-title">
                        <span className="title-icon production-structure-icon">🔋</span>
                        产能结构
                    </div>
                    <div ref={productionRef} className="production-structure-content"></div>
                </div>

                {/* 左下 - 日负荷曲线 */}
                <div className="dashboard-card custom-area-1">
                <div className="card-title">
                        <span className="title-icon">📊</span>
                        日负荷曲线
                    </div>
                    <div ref={trendRef} className="power-trend-content"></div>
                </div>

                {/* 中下 - 告警信息展示 */}
                <div className="dashboard-card power-trend alert-display-card">
                    <div className="card-title alert-display-title">
                        <div className="alert-title-left">
                            <span className="title-icon">🚨</span>
                            实时告警信息
                               

                        </div>
                        <div className="alert-status">
                            <span className="alert-count">
                                <span className="critical">严重: {alertData.filter(a => a.level === 'critical').length}</span>
                                <span className="warning">警告: {alertData.filter(a => a.level === 'warning').length}</span>
                                <span className="info">信息: {alertData.filter(a => a.level === 'info').length}</span>
                            </span>
                            <span className="last-update">
                                最后更新: {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                    <div className="alert-content">
                        <div 
                            className="alert-table-container" 
                            ref={alertTableRef}
                            onMouseEnter={() => {
                                if (autoScrollEnabled) {
                                    stopAutoScroll();
                                }
                            }}
                            onMouseLeave={() => {
                                if (autoScrollEnabled) {
                                    startAutoScroll();
                                }
                            }}
                        >
                            <table className="alert-table">
                                <thead>
                                    <tr>
                                        <th>时间</th>
                                        <th>级别</th>
                                        <th>设备</th>
                                        <th>告警内容</th>
                                        <th>状态</th>
                                    </tr>
                                </thead>
                                <tbody className="alert-table-body">
                                    {alertData.map((alert, index) => (
                                        <tr 
                                            key={alert.id} 
                                            className={`alert-row alert-${alert.level} ${alert.isNew ? 'new-alert' : ''}`}
                                            style={{
                                                animationDelay: `${index * 0.1}s`
                                            }}
                                        >
                                            <td className="alert-time">{alert.time}</td>
                                            <td className="alert-level">
                                                <span className={`level-badge level-${alert.level}`}>
                                                    {alert.levelIcon} {alert.levelText}
                                                </span>
                                            </td>
                                            <td className="alert-device">{alert.device}</td>
                                            <td className="alert-message">{alert.message}</td>
                                            <td className="alert-status">
                                                <span className={`status-badge status-${alert.status}`}>
                                                    {alert.status === 'pending' ? '⏳ 待处理' : 
                                                     alert.status === 'processing' ? '🔄 处理中' : 
                                                     '✅ 已处理'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {alertData.length === 0 && (
                            <div className="no-alerts">
                                <span className="no-alerts-icon">✅</span>
                                <p>系统运行正常，暂无告警信息</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 右下 - 交易历史信息 */}
                <div className="dashboard-card custom-area-2 trading-history-card">
                    <div className="card-title trading-history-title">
                        <div className="trading-title-left">
                            <span className="title-icon">💰</span>
                            电力交易历史
                        </div>
                        <div className="trading-status">
                            <span className="trading-count">
                                <span className="buy-count">购电: {tradingData.filter(t => t.type === 'buy').length}</span>
                                <span className="sell-count">售电: {tradingData.filter(t => t.type === 'sell').length}</span>
                                <span className="service-count">辅助: {tradingData.filter(t => ['peak', 'frequency'].includes(t.type)).length}</span>
                            </span>
                            <span className="trading-summary">
                                总计: {tradingData.length}笔
                            </span>
                        </div>
                    </div>
                    <div className="trading-content">
                        <div 
                            className="trading-table-container" 
                            ref={tradingTableRef}
                            onMouseEnter={() => {
                                if (tradingAutoScrollEnabled) {
                                    stopTradingAutoScroll();
                                }
                            }}
                            onMouseLeave={() => {
                                if (tradingAutoScrollEnabled) {
                                    startTradingAutoScroll();
                                }
                            }}
                        >
                            <table className="trading-table">
                                <thead>
                                    <tr>
                                        <th>时间</th>
                                        <th>类型</th>
                                        <th>交易方</th>
                                        <th>电量</th>
                                        <th>价格</th>
                                        <th>状态</th>
                                    </tr>
                                </thead>
                                <tbody className="trading-table-body">
                                    {tradingData.map((trade, index) => (
                                        <tr 
                                            key={trade.id} 
                                            className={`trading-row trading-${trade.type} ${trade.isNew ? 'new-trading' : ''}`}
                                            style={{
                                                animationDelay: `${index * 0.1}s`
                                            }}
                                        >
                                            <td className="trading-time">
                                                <div className="time-container">
                                                    <span className="date">{trade.date}</span>
                                                    <span className="time">{trade.time}</span>
                                                </div>
                                            </td>
                                            <td className="trading-type">
                                                <span 
                                                    className={`type-badge type-${trade.type}`}
                                                    style={{ color: trade.typeColor }}
                                                >
                                                    {trade.typeIcon} {trade.typeText}
                                                </span>
                                            </td>
                                            <td className="trading-counterparty">{trade.counterparty}</td>
                                            <td className="trading-volume">
                                                <span className="volume-value">{trade.volume}</span>
                                                <span className="volume-unit">MWh</span>
                                            </td>
                                            <td className="trading-price">
                                                <div className="price-container">
                                                    <span className="price-value">{trade.price}</span>
                                                    <span className="price-unit">元/MWh</span>
                                                </div>
                                            </td>
                                            <td className="trading-status">
                                                <span className={`status-badge status-${trade.status}`}>
                                                    {trade.status === 'pending' ? '⏳ 进行中' : '✅ 已完成'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {tradingData.length === 0 && (
                            <div className="no-trading">
                                <span className="no-trading-icon">📊</span>
                                <p>暂无交易记录</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* 设备详情弹窗 */}
            {deviceDetailModal.visible && (
                <DeviceDetailModal
                    status={deviceDetailModal.status}
                    devices={deviceDetailModal.devices}
                    loading={deviceDetailModal.loading}
                    onClose={closeDeviceDetailModal}
                />
            )}
        </div>
    );
}



// 设备详情弹窗组件
function DeviceDetailModal({ status, devices, loading, onClose }) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedDevice, setSelectedDevice] = React.useState(null);

    // 过滤设备列表
    const filteredDevices = devices.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (device.type && device.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (device.location && device.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // 获取状态对应的颜色和图标
    const getStatusInfo = (status) => {
        const statusInfo = {
            '在线': { color: '#00ff64', icon: '🟢', bgColor: 'rgba(0, 255, 100, 0.1)' },
            '离线': { color: '#ff6b6b', icon: '🔴', bgColor: 'rgba(255, 107, 107, 0.1)' },
            '故障': { color: '#ff9500', icon: '⚠️', bgColor: 'rgba(255, 149, 0, 0.1)' },
            '维护中': { color: '#70a1ff', icon: '🔧', bgColor: 'rgba(112, 161, 255, 0.1)' }
        };
        return statusInfo[status] || { color: '#999', icon: '❓', bgColor: 'rgba(153, 153, 153, 0.1)' };
    };

    const statusInfo = getStatusInfo(status);

    // 关闭弹窗时清理状态
    const handleClose = () => {
        setSelectedDevice(null);
        setSearchTerm('');
        onClose();
    };

    // 阻止事件冒泡
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="device-detail-modal-overlay" onClick={handleClose}>
            <div className="device-detail-modal" onClick={handleModalClick}>
                {/* 弹窗头部 */}
                <div className="modal-header" style={{ borderBottomColor: statusInfo.color }}>
                    <div className="modal-title">
                        <span className="status-icon">{statusInfo.icon}</span>
                        <h2>{status}设备详情</h2>
                        <span className="device-count">共 {devices.length} 台设备</span>
                    </div>
                    <button className="close-btn" onClick={handleClose}>
                        <span>✕</span>
                    </button>
                </div>

                {/* 搜索栏 */}
                <div className="modal-search">
                    <input
                        type="text"
                        placeholder="搜索设备名称、类型或位置..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>

                {/* 设备列表 */}
                <div className="modal-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>正在加载设备详情...</p>
                        </div>
                    ) : filteredDevices.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📋</span>
                            <p>{searchTerm ? '未找到匹配的设备' : '暂无设备数据'}</p>
                        </div>
                    ) : (
                        <div className="device-grid">
                            {filteredDevices.map((device, index) => (
                                <div
                                    key={device.id || index}
                                    className="device-card"
                                    style={{ borderLeftColor: statusInfo.color }}
                                    onClick={() => setSelectedDevice(device)}
                                >
                                    <div className="device-card-header">
                                        <h3 className="device-name">{device.name}</h3>
                                        <span className="device-type">{device.type}</span>
                                    </div>
                                    
                                    <div className="device-card-content">
                                        <div className="device-info-grid">
                                            <div className="info-item">
                                                <span className="info-label">设备ID</span>
                                                <span className="info-value">{device.deviceId}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">IP地址</span>
                                                <span className="info-value">{device.ipAddress}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">端口</span>
                                                <span className="info-value">
                                                    {device.port ? device.port : '未知'}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">启用状态</span>
                                                <span className="info-value" style={{
                                                    color: device.enabled ? '#00ff64' : '#ff6b6b'
                                                }}>
                                                    {device.enabled ? '✅ 已启用' : '❌ 已禁用'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="device-card-footer">
                                        <span className="last-update">
                                            最后通信: {device.lastCommunicationTime}
                                        </span>
                                        <span className="view-details">点击查看详情 →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 设备详细信息侧边栏 */}
                {selectedDevice && (
                    <div className="device-detail-sidebar">
                        <div className="sidebar-header">
                            <h3>{selectedDevice.name}</h3>
                            <button
                                className="close-sidebar-btn"
                                onClick={() => setSelectedDevice(null)}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="sidebar-content">
                            <div className="detail-section">
                                <h4>基本信息</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">设备名称</span>
                                        <span className="detail-value">{selectedDevice.name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">设备类型</span>
                                        <span className="detail-value">{selectedDevice.type}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">设备ID</span>
                                        <span className="detail-value">{selectedDevice.deviceId}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">设备描述</span>
                                        <span className="detail-value">{selectedDevice.description}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">创建时间</span>
                                        <span className="detail-value">{selectedDevice.createTime}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">更新时间</span>
                                        <span className="detail-value">{selectedDevice.updateTime}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>网络配置</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">IP地址</span>
                                        <span className="detail-value highlight">{selectedDevice.ipAddress}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">端口</span>
                                        <span className="detail-value">
                                            {selectedDevice.port ? selectedDevice.port : '未配置'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">从站ID</span>
                                        <span className="detail-value">
                                            {selectedDevice.slaveId ? selectedDevice.slaveId : '未配置'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">启用状态</span>
                                        <span className="detail-value" style={{
                                            color: selectedDevice.enabled ? '#00ff64' : '#ff6b6b'
                                        }}>
                                            {selectedDevice.enabled ? '✅ 已启用' : '❌ 已禁用'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">设备状态</span>
                                        <span className="detail-value highlight" style={{
                                            color: selectedDevice.status === 'ONLINE' ? '#00ff64' : '#ff6b6b'
                                        }}>
                                            {selectedDevice.status === 'ONLINE' ? '🟢 在线' : '🔴 离线'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">最后通信时间</span>
                                        <span className="detail-value">
                                            {selectedDevice.lastCommunicationTime}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>状态统计</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">连接状态</span>
                                        <span className="detail-value" style={{ color: statusInfo.color }}>
                                            {statusInfo.icon} {status}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">数据状态</span>
                                        <span className="detail-value" style={{
                                            color: selectedDevice.lastCommunicationTime !== '未知' ? '#00ff64' : '#ff6b6b'
                                        }}>
                                            {selectedDevice.lastCommunicationTime !== '未知' ? '📊 数据正常' : '⚠️ 数据异常'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">设备类型</span>
                                        <span className="detail-value">{selectedDevice.type}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">设备用途</span>
                                        <span className="detail-value">{selectedDevice.description}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
