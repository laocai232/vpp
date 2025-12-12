import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import './style.css';

export default function ResourceMonitoring() {
    const realTimeMonitorRef = useRef(null);
    const deviceHealthRef = useRef(null);
    const powerFlowRef = useRef(null);
    const alertTrendRef = useRef(null);
    const performanceMetricsRef = useRef(null);
    const energyQualityRef = useRef(null);

    const [monitoringStats, setMonitoringStats] = useState({
        totalDevices: 245,
        onlineDevices: 238,
        alertCount: 7,
        systemHealth: 96.7
    });

    // 用户用电信息相关状态
    const [userElectricityData, setUserElectricityData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDetail, setShowUserDetail] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 模拟用户用电数据
    const mockUserData = [
        {
            id: 1,
            name: '张三',
            userType: '工业用户',
            address: '邢台市桥东区',
            totalConsumption: 15420.5,
            monthlyConsumption: 1285.4,
            status: '正常',
            contractCapacity: 2000,
            powerStations: [
                {
                    id: 101,
                    name: '张三光伏电站A',
                    type: '光伏发电',
                    address: '邢台市桥东区经济开发区东兴大街88号',
                    capacity: 500,
                    currentPower: 420.5,
                    dailyGeneration: 2100.8,
                    monthlyGeneration: 65420.3,
                    efficiency: 84.1,
                    status: '运行中'
                },
                {
                    id: 102,
                    name: '张三风力电站B',
                    type: '风力发电',
                    address: '邢台市临城县太行山风电场12号',
                    capacity: 800,
                    currentPower: 650.2,
                    dailyGeneration: 3850.6,
                    monthlyGeneration: 118560.2,
                    efficiency: 81.3,
                    status: '运行中'
                },
                {
                    id: 103,
                    name: '张三储能电站C',
                    type: '储能系统',
                    address: '邢台市桥东区经济开发区南兴路66号',
                    capacity: 300,
                    currentPower: -150.8,
                    dailyGeneration: 720.4,
                    monthlyGeneration: 22314.5,
                    efficiency: 92.5,
                    status: '充电中'
                }
            ]
        },
        {
            id: 2,
            name: '李四',
            userType: '商业用户',
            address: '邢台市桥西区',
            totalConsumption: 8950.2,
            monthlyConsumption: 745.8,
            status: '正常',
            contractCapacity: 1200,
            powerStations: [
                {
                    id: 201,
                    name: '李四屋顶光伏',
                    type: '光伏发电',
                    address: '邢台市桥西区万达广场商业大厦顶层',
                    capacity: 200,
                    currentPower: 165.3,
                    dailyGeneration: 850.2,
                    monthlyGeneration: 26356.8,
                    efficiency: 82.7,
                    status: '运行中'
                },
                {
                    id: 202,
                    name: '李四小型风机',
                    type: '风力发电',
                    address: '邢台市内丘县太行山小型风电区',
                    capacity: 100,
                    currentPower: 78.5,
                    dailyGeneration: 420.6,
                    monthlyGeneration: 13038.4,
                    efficiency: 78.5,
                    status: '运行中'
                }
            ]
        },
        {
            id: 3,
            name: '王五',
            userType: '居民用户',
            address: '邢台市襄都区',
            totalConsumption: 2340.8,
            monthlyConsumption: 195.1,
            status: '正常',
            contractCapacity: 300,
            powerStations: [
                {
                    id: 301,
                    name: '王五家庭光伏',
                    type: '光伏发电',
                    address: '邢台市襄都区邢州大道阳光花园小区15栋',
                    capacity: 50,
                    currentPower: 42.1,
                    dailyGeneration: 210.5,
                    monthlyGeneration: 6525.6,
                    efficiency: 84.2,
                    status: '运行中'
                }
            ]
        },
        {
            id: 4,
            name: '赵六',
            userType: '工业用户',
            address: '邢台市南和区',
            totalConsumption: 22150.6,
            monthlyConsumption: 1845.9,
            status: '告警',
            contractCapacity: 3000,
            powerStations: [
                {
                    id: 401,
                    name: '赵六工业园光伏',
                    type: '光伏发电',
                    address: '邢台市南和区经济开发区科技大道168号',
                    capacity: 1000,
                    currentPower: 850.4,
                    dailyGeneration: 4250.8,
                    monthlyGeneration: 131774.8,
                    efficiency: 85.0,
                    status: '运行中'
                },
                {
                    id: 402,
                    name: '赵六大型风场',
                    type: '风力发电',
                    address: '邢台市巨鹿县太行山东麓风电基地',
                    capacity: 1500,
                    currentPower: 1200.6,
                    dailyGeneration: 7200.4,
                    monthlyGeneration: 223212.4,
                    efficiency: 80.0,
                    status: '维护中'
                }
            ]
        },
        {
            id: 5,
            name: '孙七',
            userType: '商业用户',
            address: '邢台市信都区',
            totalConsumption: 12680.3,
            monthlyConsumption: 1056.7,
            status: '正常',
            contractCapacity: 1500,
            powerStations: [
                {
                    id: 501,
                    name: '孙七商场光伏',
                    type: '光伏发电',
                    address: '邢台市信都区中兴大街邢台商业广场屋顶',
                    capacity: 400,
                    currentPower: 335.2,
                    dailyGeneration: 1680.6,
                    monthlyGeneration: 52098.6,
                    efficiency: 83.8,
                    status: '运行中'
                }
            ]
        },
        {
            id: 6,
            name: '周八',
            userType: '工业用户',
            address: '邢台市宁晋县',
            totalConsumption: 28950.8,
            monthlyConsumption: 2412.6,
            status: '正常',
            contractCapacity: 4000,
            powerStations: [
                {
                    id: 601,
                    name: '周八工厂光伏',
                    type: '光伏发电',
                    address: '邢台市宁晋县经济开发区工业路288号',
                    capacity: 800,
                    currentPower: 720.5,
                    dailyGeneration: 3600.2,
                    monthlyGeneration: 111606.2,
                    efficiency: 90.1,
                    status: '运行中'
                },
                {
                    id: 602,
                    name: '周八储能站',
                    type: '储能系统',
                    address: '邢台市宁晋县经济开发区储能中心',
                    capacity: 500,
                    currentPower: -200.3,
                    dailyGeneration: 1200.8,
                    monthlyGeneration: 37224.8,
                    efficiency: 94.2,
                    status: '充电中'
                }
            ]
        },
        {
            id: 7,
            name: '吴九',
            userType: '居民用户',
            address: '邢台市任泽区',
            totalConsumption: 3680.5,
            monthlyConsumption: 306.7,
            status: '正常',
            contractCapacity: 400,
            powerStations: [
                {
                    id: 701,
                    name: '吴九家庭光伏',
                    type: '光伏发电',
                    address: '邢台市任泽区邢湾镇新农村别墅区9号',
                    capacity: 80,
                    currentPower: 68.3,
                    dailyGeneration: 340.5,
                    monthlyGeneration: 10555.5,
                    efficiency: 85.4,
                    status: '运行中'
                },
                {
                    id: 702,
                    name: '吴九小型储能',
                    type: '储能系统',
                    address: '邢台市任泽区邢湾镇储能站',
                    capacity: 50,
                    currentPower: -25.2,
                    dailyGeneration: 120.8,
                    monthlyGeneration: 3744.8,
                    efficiency: 88.6,
                    status: '充电中'
                }
            ]
        },
        {
            id: 8,
            name: '郑十',
            userType: '商业用户',
            address: '邢台市清河县',
            totalConsumption: 18750.9,
            monthlyConsumption: 1562.6,
            status: '告警',
            contractCapacity: 2500,
            powerStations: [
                {
                    id: 801,
                    name: '郑十酒店光伏',
                    type: '光伏发电',
                    address: '邢台市清河县羊绒小镇酒店大厦',
                    capacity: 600,
                    currentPower: 480.8,
                    dailyGeneration: 2400.3,
                    monthlyGeneration: 74409.3,
                    efficiency: 80.1,
                    status: '运行中'
                },
                {
                    id: 802,
                    name: '郑十风力发电',
                    type: '风力发电',
                    address: '邢台市威县太行山风电场18号',
                    capacity: 300,
                    currentPower: 210.5,
                    dailyGeneration: 1260.8,
                    monthlyGeneration: 39084.8,
                    efficiency: 70.2,
                    status: '维护中'
                }
            ]
        }
    ];

    useEffect(() => {
        // 初始化用户数据
        setUserElectricityData(mockUserData);
        setTimeout(() => {
            initRealTimeMonitorChart();
            initDeviceHealthChart();
            initPowerFlowChart();
            initAlertTrendChart();
            initPerformanceMetricsChart();
            initEnergyQualityChart();
        }, 100);

        // 实时数据更新
        const interval = setInterval(() => {
            setMonitoringStats(prev => ({
                ...prev,
                onlineDevices: Math.max(235, Math.min(245, prev.onlineDevices + (Math.random() - 0.5) * 2)),
                alertCount: Math.max(0, Math.min(15, prev.alertCount + (Math.random() - 0.5))),
                systemHealth: Math.max(90, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 0.5))
            }));
        }, 3000);

        return () => {
            clearInterval(interval);
            if (realTimeMonitorRef.current) echarts.dispose(realTimeMonitorRef.current);
            if (deviceHealthRef.current) echarts.dispose(deviceHealthRef.current);
            if (powerFlowRef.current) echarts.dispose(powerFlowRef.current);
            if (alertTrendRef.current) echarts.dispose(alertTrendRef.current);
            if (performanceMetricsRef.current) echarts.dispose(performanceMetricsRef.current);
            if (energyQualityRef.current) echarts.dispose(energyQualityRef.current);
        };
    }, []);

    // 用户相关处理函数
    const handleUserClick = (user) => {
        setSelectedUser(user);
        setShowUserDetail(true);
    };

    const handleCloseUserDetail = () => {
        setShowUserDetail(false);
        setSelectedUser(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case '正常': return '#4ECDC4';
            case '告警': return '#FFE66D';
            case '故障': return '#FF6B6B';
            case '维护中': return '#A8A8A8';
            case '运行中': return '#4ECDC4';
            case '充电中': return '#6C5CE7';
            default: return '#A8A8A8';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case '光伏发电': return '☀️';
            case '风力发电': return '💨';
            case '储能系统': return '🔋';
            case '水力发电': return '💧';
            default: return '⚡';
        }
    };

    // 过滤逻辑
    const filteredUsers = userElectricityData.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 实时监控仪表盘
    const initRealTimeMonitorChart = () => {
        if (!realTimeMonitorRef.current) return;
        const chart = echarts.init(realTimeMonitorRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            series: [
                {
                    type: 'gauge',
                    center: ['25%', '50%'],
                    radius: '80%',
                    min: 0,
                    max: 100,
                    splitNumber: 10,
                    axisLine: {
                        lineStyle: {
                            width: 15,
                            color: [
                                [0.3, '#FF6B6B'],
                                [0.7, '#FFE66D'],
                                [1, '#4ECDC4']
                            ]
                        }
                    },
                    pointer: {
                        itemStyle: {
                            color: 'auto'
                        }
                    },
                    axisTick: {
                        distance: -30,
                        length: 8,
                        lineStyle: {
                            color: '#fff',
                            width: 2
                        }
                    },
                    splitLine: {
                        distance: -30,
                        length: 30,
                        lineStyle: {
                            color: '#fff',
                            width: 4
                        }
                    },
                    axisLabel: {
                        color: 'auto',
                        distance: 40,
                        fontSize: 14
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}%',
                        color: 'auto',
                        fontSize: 20,
                        offsetCenter: [0, '70%']
                    },
                    data: [
                        {
                            value: monitoringStats.systemHealth,
                            name: '系统健康度'
                        }
                    ]
                },
                {
                    type: 'gauge',
                    center: ['75%', '50%'],
                    radius: '80%',
                    min: 0,
                    max: 250,
                    splitNumber: 5,
                    axisLine: {
                        lineStyle: {
                            width: 15,
                            color: [
                                [0.8, '#4ECDC4'],
                                [0.9, '#FFE66D'],
                                [1, '#FF6B6B']
                            ]
                        }
                    },
                    pointer: {
                        itemStyle: {
                            color: 'auto'
                        }
                    },
                    axisTick: {
                        distance: -30,
                        length: 8,
                        lineStyle: {
                            color: '#fff',
                            width: 2
                        }
                    },
                    splitLine: {
                        distance: -30,
                        length: 30,
                        lineStyle: {
                            color: '#fff',
                            width: 4
                        }
                    },
                    axisLabel: {
                        color: 'auto',
                        distance: 40,
                        fontSize: 14
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}台',
                        color: 'auto',
                        fontSize: 20,
                        offsetCenter: [0, '70%']
                    },
                    data: [
                        {
                            value: monitoringStats.onlineDevices,
                            name: '在线设备'
                        }
                    ]
                }
            ]
        };
        chart.setOption(option);
    };

    // 设备健康状态饼图
    const initDeviceHealthChart = () => {
        if (!deviceHealthRef.current) return;
        const chart = echarts.init(deviceHealthRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 10,
                textStyle: {
                    color: '#fff'
                }
            },
            series: [
                {
                    name: '设备状态',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['65%', '50%'],
                    data: [
                        { value: 238, name: '正常运行', itemStyle: { color: '#4ECDC4' } },
                        { value: 5, name: '轻微异常', itemStyle: { color: '#FFE66D' } },
                        { value: 2, name: '严重故障', itemStyle: { color: '#FF6B6B' } }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        color: '#fff'
                    }
                }
            ]
        };
        chart.setOption(option);
    };

    // 功率流向图
    const initPowerFlowChart = () => {
        if (!powerFlowRef.current) return;
        const chart = echarts.init(powerFlowRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['输入功率', '输出功率', '储能功率'],
                textStyle: {
                    color: '#fff'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                axisLabel: {
                    color: '#fff'
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.5)'
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: '功率(MW)',
                axisLabel: {
                    color: '#fff'
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.5)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    }
                }
            },
            series: [
                {
                    name: '输入功率',
                    type: 'line',
                    smooth: true,
                    data: [1200, 1100, 1350, 1800, 2200, 1900, 1400],
                    lineStyle: {
                        color: '#4ECDC4',
                        width: 3
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(78, 205, 196, 0.6)' },
                            { offset: 1, color: 'rgba(78, 205, 196, 0.1)' }
                        ])
                    }
                },
                {
                    name: '输出功率',
                    type: 'line',
                    smooth: true,
                    data: [1150, 1050, 1280, 1750, 2150, 1850, 1350],
                    lineStyle: {
                        color: '#FFE66D',
                        width: 3
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(255, 230, 109, 0.6)' },
                            { offset: 1, color: 'rgba(255, 230, 109, 0.1)' }
                        ])
                    }
                },
                {
                    name: '储能功率',
                    type: 'line',
                    smooth: true,
                    data: [50, 50, 70, 50, 50, 50, 50],
                    lineStyle: {
                        color: '#A8E6CF',
                        width: 3
                    }
                }
            ]
        };
        chart.setOption(option);
    };

    // 告警趋势图
    const initAlertTrendChart = () => {
        if (!alertTrendRef.current) return;
        const chart = echarts.init(alertTrendRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['严重告警', '一般告警', '轻微告警'],
                textStyle: {
                    color: '#fff'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                axisLabel: {
                    color: '#fff'
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.5)'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#fff'
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.5)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    }
                }
            },
            series: [
                {
                    name: '严重告警',
                    type: 'bar',
                    stack: 'total',
                    data: [2, 1, 0, 3, 1, 0, 2],
                    itemStyle: {
                        color: '#FF6B6B'
                    }
                },
                {
                    name: '一般告警',
                    type: 'bar',
                    stack: 'total',
                    data: [3, 2, 4, 2, 3, 1, 2],
                    itemStyle: {
                        color: '#FFE66D'
                    }
                },
                {
                    name: '轻微告警',
                    type: 'bar',
                    stack: 'total',
                    data: [5, 3, 2, 4, 3, 2, 4],
                    itemStyle: {
                        color: '#A8E6CF'
                    }
                }
            ]
        };
        chart.setOption(option);
    };

    // 负荷预测模型
    const initPerformanceMetricsChart = () => {
        if (!performanceMetricsRef.current) return;
        const chart = echarts.init(performanceMetricsRef.current, 'dark');
        
        // 生成时间轴数据 (12:00 - 21:00)
        const timeData = [];
        for (let hour = 12; hour <= 21; hour++) {
            timeData.push(`${hour}:00`);
        }
        
        // 模拟历史负荷数据 (MW)
        const historicalLoad = [95, 98, 105, 110, 115, 112, 118, 125, 123, 107];
        
        // 模拟预测负荷数据 (MW)
        const predictedLoad = [95, 98, 105, 110, 115, 112, 118, 125, 123, 107];
        
        // 模拟置信区间数据 (MW)
        const upperConfidence = [115, 118, 125, 130, 135, 132, 138, 145, 143, 127];
        const lowerConfidence = [75, 78, 85, 90, 95, 92, 98, 105, 103, 87];
        
        const option = {
            backgroundColor: 'transparent',
            title: {
                text: '',
                left: 20,
                top: 20,
                textStyle: {
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: '#4ECDC4',
                textStyle: {
                    color: '#fff'
                },
                formatter: function (params) {
                    let result = `<div style="margin-bottom: 5px; font-weight: bold;">${params[0].axisValue}</div>`;
                    params.forEach(item => {
                        if (item.seriesName !== '置信区间填充') {
                            result += `<div style="margin: 2px 0;">
                                <span style="display: inline-block; width: 10px; height: 10px; background: ${item.color}; margin-right: 5px; border-radius: 50%;"></span>
                                ${item.seriesName}: ${item.value} MW
                            </div>`;
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['历史负荷', '预测负荷', '置信区间上限', '置信区间下限'],
                top: 20,
                right: 20,
                textStyle: {
                    color: '#fff',
                    fontSize: 12
                },
                itemGap: 20
            },
            grid: {
                left: 60,
                right: 60,
                top: 60,
                bottom: 60,
                containLabel: false
            },
            xAxis: {
                type: 'category',
                data: timeData,
                axisLabel: {
                    color: '#fff',
                    fontSize: 11
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.5)'
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.5)'
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: '负荷(MW)',
                nameTextStyle: {
                    color: '#fff',
                    fontSize: 11
                },
                axisLabel: {
                    color: '#fff',
                    fontSize: 11
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.5)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.2)',
                        type: 'dashed'
                    }
                }
            },
            series: [
                // 置信区间填充（放在最下层）
                {
                    name: '置信区间填充',
                    type: 'line',
                    data: upperConfidence.map((upper, index) => [timeData[index], upper]),
                    lineStyle: {
                        opacity: 0
                    },
                    areaStyle: {
                        color: 'rgba(255, 182, 193, 0.2)'
                    },
                    stack: 'confidence',
                    symbol: 'none',
                    smooth: true,
                    silent: true
                },
                {
                    name: '置信区间填充下',
                    type: 'line',
                    data: lowerConfidence.map((lower, index) => [timeData[index], lower]),
                    lineStyle: {
                        opacity: 0
                    },
                    areaStyle: {
                        color: 'rgba(255, 182, 193, 0.2)'
                    },
                    stack: 'confidence',
                    symbol: 'none',
                    smooth: true,
                    silent: true
                },
                {
                    name: '历史负荷',
                    type: 'line',
                    data: historicalLoad,
                    lineStyle: {
                        color: '#4ECDC4',
                        width: 2
                    },
                    itemStyle: {
                        color: '#4ECDC4',
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    symbol: 'circle',
                    symbolSize: 5,
                    smooth: true
                },
                {
                    name: '预测负荷',
                    type: 'line',
                    data: predictedLoad,
                    lineStyle: {
                        color: '#4ECDC4',
                        width: 2,
                        type: 'dashed'
                    },
                    itemStyle: {
                        color: '#4ECDC4',
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    symbol: 'diamond',
                    symbolSize: 5,
                    smooth: true
                },
                {
                    name: '置信区间上限',
                    type: 'line',
                    data: upperConfidence,
                    lineStyle: {
                        color: '#FFE66D',
                        width: 2,
                        type: 'dashed'
                    },
                    itemStyle: {
                        color: '#FFE66D'
                    },
                    symbol: 'circle',
                    symbolSize: 4,
                    smooth: true
                },
                {
                    name: '置信区间下限',
                    type: 'line',
                    data: lowerConfidence,
                    lineStyle: {
                        color: '#FF6B6B',
                        width: 2,
                        type: 'dashed'
                    },
                    itemStyle: {
                        color: '#FF6B6B'
                    },
                    symbol: 'circle',
                    symbolSize: 4,
                    smooth: true
                }
            ]
        };
        
        chart.setOption(option);
    };

    // 电能质量监测
    const initEnergyQualityChart = () => {
        if (!energyQualityRef.current) return;
        const chart = echarts.init(energyQualityRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['电压', '频率', '功率因数'],
                textStyle: {
                    color: '#fff'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'],
                axisLabel: {
                    color: '#fff'
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.5)'
                    }
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '电压(V)/频率(Hz)',
                    position: 'left',
                    axisLabel: {
                        color: '#fff'
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.5)'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.2)'
                        }
                    }
                },
                {
                    type: 'value',
                    name: '功率因数',
                    position: 'right',
                    min: 0.8,
                    max: 1.0,
                    axisLabel: {
                        color: '#fff',
                        formatter: '{value}'
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.5)'
                        }
                    }
                }
            ],
            series: [
                {
                    name: '电压',
                    type: 'line',
                    data: [380, 382, 378, 381, 379, 383, 380],
                    lineStyle: {
                        color: '#4ECDC4',
                        width: 2
                    }
                },
                {
                    name: '频率',
                    type: 'line',
                    data: [50.02, 49.98, 50.01, 49.99, 50.00, 50.02, 49.97],
                    lineStyle: {
                        color: '#FFE66D',
                        width: 2
                    }
                },
                {
                    name: '功率因数',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [0.95, 0.96, 0.94, 0.97, 0.95, 0.96, 0.94],
                    lineStyle: {
                        color: '#A8E6CF',
                        width: 2
                    }
                }
            ]
        };
        chart.setOption(option);
    };

    return (
        <div className="resource-monitoring-container">
            {/* 页面标题 */}
            <div className="page-header">
                <div className="title-section">
                    <div className="title-icon-wrapper">
                        <div className="title-icon">📊</div>
                    </div>
                    <div className="title-content">
                        <h1 className="page-title">资源监视中心</h1>
                        {/* <p className="page-subtitle">Resource Monitoring Center</p> */}
                    </div>
                </div>
                {/* <div className="header-stats">
                    <div className="stat-item">
                        <div className="stat-icon">🖥️</div>
                        <div className="stat-content">
                            <span className="stat-value">{monitoringStats.totalDevices}</span>
                            <span className="stat-label">监控设备</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">🟢</div>
                        <div className="stat-content">
                            <span className="stat-value">{Math.round(monitoringStats.onlineDevices)}</span>
                            <span className="stat-label">在线设备</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <span className="stat-value">{Math.round(monitoringStats.alertCount)}</span>
                            <span className="stat-label">活跃告警</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">💚</div>
                        <div className="stat-content">
                            <span className="stat-value">{monitoringStats.systemHealth.toFixed(1)}%</span>
                            <span className="stat-label">系统健康</span>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* 图表区域 */}
            <div className="charts-grid">
                {/* 实时监控 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">⚡</span>
                        实时监控仪表盘
                    </div>
                    <div ref={realTimeMonitorRef} style={{ width: '100%', height: '300px' }}></div>
                </div>

                {/* 用户用电信息 */}
                <div className="chart-card user-electricity-card">
                    <div className="card-title">
                        <span className="title-icon">�</span>
                        用户用电信息
                        <div className="user-search-controls">
                            <input
                                type="text"
                                placeholder="搜索用户名、类型或地区..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="user-search-input"
                            />
                            <span className="user-count">共 {filteredUsers.length} 个用户</span>
                        </div>
                    </div>
                    <div className="user-electricity-content">
                        <div className="user-table-container">
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>用户名</th>
                                        <th>用户类型</th>
                                        <th>所在地区</th>
                                        <th>月用电量(MWh)</th>
                                        <th>合同容量(kW)</th>
                                        <th>状态</th>
                                        <th>电站数量</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="user-row">
                                            <td className="user-name">{user.name}</td>
                                            <td className="user-type">{user.userType}</td>
                                            <td className="user-address">{user.address}</td>
                                            <td className="consumption">{user.monthlyConsumption.toLocaleString()}</td>
                                            <td className="capacity">{user.contractCapacity.toLocaleString()}</td>
                                            <td>
                                                <span
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(user.status) }}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="station-count">{user.powerStations.length}</td>
                                            <td>
                                                <button
                                                    className="detail-btn"
                                                    onClick={() => handleUserClick(user)}
                                                >
                                                    查看详情
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 滚动提示 */}
                        {filteredUsers.length > 6 && (
                            <div className="scroll-hint">
                                <span className="hint-text">
                                    📜 共 {filteredUsers.length} 个用户，可滚动查看更多
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 功率流向 */}
                {/* <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">🔄</span>
                        功率流向监测
                    </div>
                    <div ref={powerFlowRef} style={{ width: '100%', height: '300px' }}></div>
                </div> */}

                {/* 告警趋势 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">⚠️</span>
                        告警趋势分析
                    </div>
                    <div ref={alertTrendRef} style={{ width: '100%', height: '300px' }}></div>
                </div>

                {/* 负荷预测模型 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">🎯</span>
                        负荷预测模型
                    </div>
                    <div ref={performanceMetricsRef} style={{ width: '100%', height: '300px' }}></div>
                </div>

                {/* 电能质量 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">⚡</span>
                        电能质量监测
                    </div>
                    <div ref={energyQualityRef} style={{ width: '100%', height: '300px' }}></div>
                </div>
            </div>

            {/* 用户详情弹窗 */}
            {showUserDetail && selectedUser && (
                <div className="user-detail-modal" onClick={handleCloseUserDetail}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <span className="user-icon">👤</span>
                                {selectedUser.name} - 电站详情
                            </h2>
                            <button className="close-btn" onClick={handleCloseUserDetail}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* 用户基本信息 */}
                            <div className="user-basic-info">
                                <div className="info-card">
                                    <h3>基本信息</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">用户类型:</span>
                                            <span className="info-value">{selectedUser.userType}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">所在地区:</span>
                                            <span className="info-value">{selectedUser.address}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">合同容量:</span>
                                            <span className="info-value">{selectedUser.contractCapacity.toLocaleString()} kW</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">月用电量:</span>
                                            <span className="info-value">{selectedUser.monthlyConsumption.toLocaleString()} MWh</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">总用电量:</span>
                                            <span className="info-value">{selectedUser.totalConsumption.toLocaleString()} MWh</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">状态:</span>
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(selectedUser.status) }}
                                            >
                                                {selectedUser.status}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">电站数量:</span>
                                            <span className="info-value">{selectedUser.powerStations.length} 个</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 电站列表 */}
                            <div className="power-stations-section">
                                <h3>电站信息</h3>
                                <div className="stations-grid">
                                    {selectedUser.powerStations.map(station => (
                                        <div key={station.id} className="station-card">
                                            <div className="station-header">
                                                <div className="station-title">
                                                    <span className="station-icon">{getTypeIcon(station.type)}</span>
                                                    <span className="station-name">{station.name}</span>
                                                </div>
                                                <span
                                                    className="station-status"
                                                    style={{ backgroundColor: getStatusColor(station.status) }}
                                                >
                                                    {station.status}
                                                </span>
                                            </div>

                                            <div className="station-info">
                                                <div className="station-type">{station.type}</div>

                                                {/* 电站地址信息 */}
                                                <div className="station-address">
                                                    <span className="address-icon">📍</span>
                                                    <span className="address-text">{station.address}</span>
                                                </div>

                                                <div className="station-metrics">
                                                    <div className="metric-row">
                                                        <div className="metric-item">
                                                            <span className="metric-label">装机容量</span>
                                                            <span className="metric-value">{station.capacity} kW</span>
                                                        </div>
                                                        <div className="metric-item">
                                                            <span className="metric-label">当前功率</span>
                                                            <span className="metric-value power-value">
                                                                {station.currentPower > 0 ? '+' : ''}{station.currentPower} kW
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="metric-row">
                                                        <div className="metric-item">
                                                            <span className="metric-label">日发电量</span>
                                                            <span className="metric-value">{station.dailyGeneration.toLocaleString()} MWh</span>
                                                        </div>
                                                        <div className="metric-item">
                                                            <span className="metric-label">月发电量</span>
                                                            <span className="metric-value">{station.monthlyGeneration.toLocaleString()} MWh</span>
                                                        </div>
                                                    </div>

                                                    <div className="metric-row">
                                                        <div className="metric-item">
                                                            <span className="metric-label">运行效率</span>
                                                            <span className="metric-value efficiency-value">{station.efficiency}%</span>
                                                        </div>
                                                        <div className="metric-item">
                                                            <span className="metric-label">容量因子</span>
                                                            <span className="metric-value">
                                                                {((station.currentPower / station.capacity) * 100).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 效率进度条 */}
                                                <div className="efficiency-bar">
                                                    <div className="efficiency-label">运行效率</div>
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-fill"
                                                            style={{
                                                                width: `${station.efficiency}%`,
                                                                backgroundColor: station.efficiency >= 85 ? '#4ECDC4' :
                                                                                station.efficiency >= 75 ? '#FFE66D' : '#FF6B6B'
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <div className="efficiency-text">{station.efficiency}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}