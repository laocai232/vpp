import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import './style.css';

export default function ResourceAccess() {
    const resourceDistributionRef = useRef(null);
    const capacityTrendRef = useRef(null);
    const connectionStatusRef = useRef(null);
    const performanceRadarRef = useRef(null);
    const realTimeDataRef = useRef(null);
    const geographicRef = useRef(null);

    const [realTimeStats, setRealTimeStats] = useState({
        totalResources: 156,
        onlineResources: 152,
        totalCapacity: 2856,
        currentOutput: 2234
    });

    useEffect(() => {
        setTimeout(() => {
            initResourceDistributionChart();
            initCapacityTrendChart();
            initConnectionStatusChart();
            initPerformanceRadarChart();
            initRealTimeDataChart();
            initGeographicChart();
        }, 100);

        return () => {
            if (resourceDistributionRef.current) echarts.dispose(resourceDistributionRef.current);
            if (capacityTrendRef.current) echarts.dispose(capacityTrendRef.current);
            if (connectionStatusRef.current) echarts.dispose(connectionStatusRef.current);
            if (performanceRadarRef.current) echarts.dispose(performanceRadarRef.current);
            if (realTimeDataRef.current) echarts.dispose(realTimeDataRef.current);
            if (geographicRef.current) echarts.dispose(geographicRef.current);
        };
    }, []);

    // 资源分布饼图
    const initResourceDistributionChart = () => {
        if (!resourceDistributionRef.current) return;
        const chart = echarts.init(resourceDistributionRef.current, 'dark');
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
                    name: '资源类型',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    center: ['65%', '50%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '30',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { value: 45, name: '光伏发电', itemStyle: { color: '#FFD700' } },
                        { value: 38, name: '风力发电', itemStyle: { color: '#00CED1' } },
                        { value: 28, name: '储能设备', itemStyle: { color: '#FF6347' } },
                        { value: 25, name: '充电桩', itemStyle: { color: '#32CD32' } },
                        { value: 20, name: '其他设备', itemStyle: { color: '#FF69B4' } }
                    ]
                }
            ]
        };
        chart.setOption(option);
    };

    // 容量趋势折线图
    const initCapacityTrendChart = () => {
        if (!capacityTrendRef.current) return;
        const chart = echarts.init(capacityTrendRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['装机容量', '实际出力'],
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
                data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
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
                    name: '装机容量',
                    type: 'line',
                    smooth: true,
                    data: [1200, 1320, 1450, 1580, 1720, 1850, 1980, 2120, 2250, 2380, 2520, 2650],
                    lineStyle: {
                        color: '#FFD700',
                        width: 3
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(255, 215, 0, 0.6)' },
                            { offset: 1, color: 'rgba(255, 215, 0, 0.1)' }
                        ])
                    }
                },
                {
                    name: '实际出力',
                    type: 'line',
                    smooth: true,
                    data: [980, 1080, 1150, 1280, 1420, 1560, 1680, 1820, 1950, 2080, 2200, 2320],
                    lineStyle: {
                        color: '#00CED1',
                        width: 3
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 206, 209, 0.6)' },
                            { offset: 1, color: 'rgba(0, 206, 209, 0.1)' }
                        ])
                    }
                }
            ]
        };
        chart.setOption(option);
    };

    // 其他图表初始化函数...
    const initConnectionStatusChart = () => {
        if (!connectionStatusRef.current) return;
        const chart = echarts.init(connectionStatusRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
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
                data: ['光伏', '风电', '储能', '充电桩', '工商业', '居民'],
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
                    name: '设备数量',
                    type: 'bar',
                    data: [45, 38, 28, 25, 32, 28],
                    itemStyle: {
                        color: function(params) {
                            const colors = ['#FFD700', '#00CED1', '#FF6347', '#32CD32', '#FF69B4', '#9370DB'];
                            return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: colors[params.dataIndex] },
                                { offset: 1, color: colors[params.dataIndex] + '40' }
                            ]);
                        }
                    }
                }
            ]
        };
        chart.setOption(option);
    };

    const initPerformanceRadarChart = () => {
        if (!performanceRadarRef.current) return;
        const chart = echarts.init(performanceRadarRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            radar: {
                indicator: [
                    { name: '连接稳定性', max: 100 },
                    { name: '响应速度', max: 100 },
                    { name: '数据质量', max: 100 },
                    { name: '功率因素', max: 100 },
                    { name: '可用性', max: 100 },
                    { name: '安全性', max: 100 }
                ],
                center: ['50%', '50%'],
                radius: 100,
                axisName: {
                    color: '#fff',
                    fontSize: 14
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
                    name: '性能指标',
                    type: 'radar',
                    data: [
                        {
                            value: [95, 88, 92, 90, 94, 96],
                            name: '平均水平',
                            itemStyle: {
                                color: '#00CED1'
                            },
                            areaStyle: {
                                color: 'rgba(0, 206, 209, 0.3)'
                            }
                        }
                    ]
                }
            ]
        };
        chart.setOption(option);
    };

    const initRealTimeDataChart = () => {
        if (!realTimeDataRef.current) return;
        const chart = echarts.init(realTimeDataRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            series: [
                {
                    type: 'gauge',
                    center: ['25%', '50%'],
                    radius: '60%',
                    min: 0,
                    max: 100,
                    splitNumber: 10,
                    axisLine: {
                        lineStyle: {
                            width: 10,
                            color: [
                                [0.3, '#FF6347'],
                                [0.7, '#FFD700'],
                                [1, '#32CD32']
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
                        fontSize: 20
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
                            value: 97.4,
                            name: '在线率'
                        }
                    ]
                },
                {
                    type: 'gauge',
                    center: ['75%', '50%'],
                    radius: '60%',
                    min: 0,
                    max: 3000,
                    splitNumber: 10,
                    axisLine: {
                        lineStyle: {
                            width: 10,
                            color: [
                                [0.3, '#FF6347'],
                                [0.7, '#FFD700'],
                                [1, '#00CED1']
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
                        fontSize: 20
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}MW',
                        color: 'auto',
                        fontSize: 20,
                        offsetCenter: [0, '70%']
                    },
                    data: [
                        {
                            value: 2234,
                            name: '当前出力'
                        }
                    ]
                }
            ]
        };
        chart.setOption(option);
    };

    const initGeographicChart = () => {
        if (!geographicRef.current) return;
        const chart = echarts.init(geographicRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['华北', '华东', '华南', '华中', '西北', '东北', '西南'],
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
                name: '装机容量(MW)',
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
                    name: '光伏',
                    type: 'bar',
                    stack: 'total',
                    data: [320, 280, 260, 200, 180, 150, 140],
                    itemStyle: {
                        color: '#FFD700'
                    }
                },
                {
                    name: '风电',
                    type: 'bar',
                    stack: 'total',
                    data: [280, 240, 220, 180, 160, 130, 120],
                    itemStyle: {
                        color: '#00CED1'
                    }
                },
                {
                    name: '储能',
                    type: 'bar',
                    stack: 'total',
                    data: [150, 120, 100, 80, 70, 60, 50],
                    itemStyle: {
                        color: '#FF6347'
                    }
                }
            ]
        };
        chart.setOption(option);
    };

    return (
        <div className="resource-access-container">
            {/* 页面标题 */}
            <div className="page-header">
                <div className="title-section">
                    <div className="title-icon-wrapper">
                        <div className="title-icon">⚡</div>
                    </div>
                    <div className="title-content">
                        <h1 className="page-title">资源接入管理</h1>
                        {/* <p className="page-subtitle">Virtual Power Plant Resource Access Management</p> */}
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-item">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <span className="stat-value">{realTimeStats.totalResources}</span>
                            <span className="stat-label">总资源数</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">🟢</div>
                        <div className="stat-content">
                            <span className="stat-value">{realTimeStats.onlineResources}</span>
                            <span className="stat-label">在线资源</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-content">
                            <span className="stat-value">{realTimeStats.totalCapacity}MW</span>
                            <span className="stat-label">总容量</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">🔋</div>
                        <div className="stat-content">
                            <span className="stat-value">{realTimeStats.currentOutput}MW</span>
                            <span className="stat-label">当前出力</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* 图表区域 */}
            <div className="charts-grid">
                {/* 资源分布 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">📊</span>
                        资源类型分布
                    </div>
                    <div ref={resourceDistributionRef} className="chart-container"></div>
                </div>

                {/* 容量趋势 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">📈</span>
                        容量增长趋势
                    </div>
                    <div ref={capacityTrendRef} className="chart-container"></div>
                </div>

                {/* 连接状态 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">🔗</span>
                        连接状态统计
                    </div>
                    <div ref={connectionStatusRef} className="chart-container"></div>
                </div>

                {/* 性能雷达 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">🎯</span>
                        性能评估
                    </div>
                    <div ref={performanceRadarRef} className="chart-container"></div>
                </div>

                {/* 实时数据 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">⚡</span>
                        实时监控
                    </div>
                    <div ref={realTimeDataRef} className="chart-container"></div>
                </div>

                {/* 地理分布 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">🗺️</span>
                        区域分布
                    </div>
                    <div ref={geographicRef} className="chart-container"></div>
                </div>
            </div>
        </div>
    );
} 