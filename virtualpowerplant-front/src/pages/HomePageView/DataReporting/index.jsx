import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import './style.css';

export default function DataReporting() {
    const reportingStatusRef = useRef(null);
    const dataVolumeRef = useRef(null);
    const transmissionQualityRef = useRef(null);
    const protocolDistributionRef = useRef(null);
    const systemReliabilityRef = useRef(null);
    const reportingTrendRef = useRef(null);

    const [reportingStats, setReportingStats] = useState({
        totalReports: 15847,
        successRate: 99.2,
        dataVolume: 2.8, // GB
        avgLatency: 45 // ms
    });

    useEffect(() => {
        setTimeout(() => {
            initReportingStatusChart();
            initDataVolumeChart();
            initTransmissionQualityChart();
            initProtocolDistributionChart();
            initSystemReliabilityChart();
            initReportingTrendChart();
        }, 100);

        // 实时数据更新
        const interval = setInterval(() => {
            setReportingStats(prev => ({
                ...prev,
                totalReports: prev.totalReports + Math.floor(Math.random() * 10),
                successRate: Math.max(95, Math.min(100, prev.successRate + (Math.random() - 0.5) * 0.2)),
                dataVolume: Math.max(1, Math.min(5, prev.dataVolume + (Math.random() - 0.5) * 0.1)),
                avgLatency: Math.max(20, Math.min(100, prev.avgLatency + (Math.random() - 0.5) * 5))
            }));
        }, 3000);

        return () => {
            clearInterval(interval);
            if (reportingStatusRef.current) echarts.dispose(reportingStatusRef.current);
            if (dataVolumeRef.current) echarts.dispose(dataVolumeRef.current);
            if (transmissionQualityRef.current) echarts.dispose(transmissionQualityRef.current);
            if (protocolDistributionRef.current) echarts.dispose(protocolDistributionRef.current);
            if (systemReliabilityRef.current) echarts.dispose(systemReliabilityRef.current);
            if (reportingTrendRef.current) echarts.dispose(reportingTrendRef.current);
        };
    }, []);

    // 上报状态仪表盘
    const initReportingStatusChart = () => {
        if (!reportingStatusRef.current) return;
        const chart = echarts.init(reportingStatusRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            series: [
                {
                    type: 'gauge',
                    center: ['25%', '50%'],
                    radius: '80%',
                    min: 95,
                    max: 100,
                    splitNumber: 5,
                    axisLine: {
                        lineStyle: {
                            width: 12,
                            color: [
                                [0.6, '#FF6B6B'],
                                [0.8, '#FFE66D'],
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
                        distance: -20,
                        length: 8,
                        lineStyle: {
                            color: '#fff',
                            width: 2
                        }
                    },
                    splitLine: {
                        distance: -20,
                        length: 20,
                        lineStyle: {
                            color: '#fff',
                            width: 3
                        }
                    },
                    axisLabel: {
                        color: 'auto',
                        distance: 30,
                        fontSize: 12
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}%',
                        color: 'auto',
                        fontSize: 18,
                        offsetCenter: [0, '70%']
                    },
                    data: [
                        {
                            value: reportingStats.successRate,
                            name: '成功率'
                        }
                    ]
                },
                {
                    type: 'gauge',
                    center: ['75%', '50%'],
                    radius: '80%',
                    min: 0,
                    max: 100,
                    splitNumber: 10,
                    axisLine: {
                        lineStyle: {
                            width: 12,
                            color: [
                                [0.3, '#4ECDC4'],
                                [0.7, '#FFE66D'],
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
                        distance: -20,
                        length: 8,
                        lineStyle: {
                            color: '#fff',
                            width: 2
                        }
                    },
                    splitLine: {
                        distance: -20,
                        length: 20,
                        lineStyle: {
                            color: '#fff',
                            width: 3
                        }
                    },
                    axisLabel: {
                        color: 'auto',
                        distance: 30,
                        fontSize: 12
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}ms',
                        color: 'auto',
                        fontSize: 18,
                        offsetCenter: [0, '70%']
                    },
                    data: [
                        {
                            value: reportingStats.avgLatency,
                            name: '平均延迟'
                        }
                    ]
                }
            ]
        };
        chart.setOption(option);
    };

    // 数据传输量趋势
    const initDataVolumeChart = () => {
        if (!dataVolumeRef.current) return;
        const chart = echarts.init(dataVolumeRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                data: ['数据上传', '数据下载', '实时传输'],
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
                name: '传输量(GB)',
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
                    name: '数据上传',
                    type: 'line',
                    smooth: true,
                    data: [2.1, 1.8, 2.3, 3.2, 4.1, 3.5, 2.8],
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
                    name: '数据下载',
                    type: 'line',
                    smooth: true,
                    data: [0.5, 0.4, 0.6, 0.8, 1.2, 0.9, 0.7],
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
                    name: '实时传输',
                    type: 'line',
                    smooth: true,
                    data: [1.2, 1.1, 1.3, 1.8, 2.2, 1.9, 1.5],
                    lineStyle: {
                        color: '#A8E6CF',
                        width: 3
                    }
                }
            ]
        };
        chart.setOption(option);
    };

    // 传输质量分析
    const initTransmissionQualityChart = () => {
        if (!transmissionQualityRef.current) return;
        const chart = echarts.init(transmissionQualityRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['成功', '重传', '失败', '延迟'],
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
                data: ['调度数据', '监测数据', '状态数据', '告警数据', '配置数据', '历史数据'],
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
                name: '传输量(次)',
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
                    name: '成功',
                    type: 'bar',
                    stack: 'total',
                    data: [2850, 3200, 2100, 450, 680, 1250],
                    itemStyle: {
                        color: '#4ECDC4'
                    }
                },
                {
                    name: '重传',
                    type: 'bar',
                    stack: 'total',
                    data: [85, 120, 75, 15, 20, 45],
                    itemStyle: {
                        color: '#FFE66D'
                    }
                },
                {
                    name: '失败',
                    type: 'bar',
                    stack: 'total',
                    data: [15, 25, 10, 5, 8, 12],
                    itemStyle: {
                        color: '#FF6B6B'
                    }
                },
                {
                    name: '延迟',
                    type: 'line',
                    data: [32, 45, 28, 18, 25, 38],
                    lineStyle: {
                        color: '#A8E6CF',
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                }
            ]
        };
        chart.setOption(option);
    };

    // 协议分布饼图
    const initProtocolDistributionChart = () => {
        if (!protocolDistributionRef.current) return;
        const chart = echarts.init(protocolDistributionRef.current, 'dark');
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
                    name: '传输协议',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['65%', '50%'],
                    data: [
                        { value: 45, name: 'IEC 61850', itemStyle: { color: '#4ECDC4' } },
                        { value: 25, name: 'Modbus TCP', itemStyle: { color: '#FFE66D' } },
                        { value: 15, name: 'DNP3', itemStyle: { color: '#A8E6CF' } },
                        { value: 10, name: 'OPC UA', itemStyle: { color: '#FF9999' } },
                        { value: 5, name: '其他协议', itemStyle: { color: '#C4A5FF' } }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        formatter: '{b}\n{c}%',
                        color: '#fff'
                    },
                    labelLine: {
                        lineStyle: {
                            color: '#fff'
                        }
                    }
                }
            ]
        };
        chart.setOption(option);
    };

    // 系统可靠性雷达图
    const initSystemReliabilityChart = () => {
        if (!systemReliabilityRef.current) return;
        const chart = echarts.init(systemReliabilityRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            radar: {
                indicator: [
                    { name: '数据完整性', max: 100 },
                    { name: '传输稳定性', max: 100 },
                    { name: '响应时间', max: 100 },
                    { name: '安全性', max: 100 },
                    { name: '容错能力', max: 100 },
                    { name: '扩展性', max: 100 }
                ],
                center: ['50%', '50%'],
                radius: 100,
                axisName: {
                    color: '#fff',
                    fontSize: 12
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
                    name: '系统指标',
                    type: 'radar',
                    data: [
                        {
                            value: [95, 92, 88, 94, 90, 87],
                            name: '当前状态',
                            itemStyle: {
                                color: '#4ECDC4'
                            },
                            areaStyle: {
                                color: 'rgba(78, 205, 196, 0.3)'
                            }
                        },
                        {
                            value: [88, 85, 82, 89, 85, 83],
                            name: '平均水平',
                            itemStyle: {
                                color: '#FFE66D'
                            },
                            areaStyle: {
                                color: 'rgba(255, 230, 109, 0.2)'
                            }
                        }
                    ]
                }
            ]
        };
        chart.setOption(option);
    };

    // 上报趋势分析
    const initReportingTrendChart = () => {
        if (!reportingTrendRef.current) return;
        const chart = echarts.init(reportingTrendRef.current, 'dark');
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['成功次数', '失败次数', '成功率'],
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
            yAxis: [
                {
                    type: 'value',
                    name: '次数',
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
                    name: '成功率(%)',
                    position: 'right',
                    min: 95,
                    max: 100,
                    axisLabel: {
                        color: '#fff',
                        formatter: '{value}%'
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
                    name: '成功次数',
                    type: 'bar',
                    data: [2856, 3124, 2987, 3256, 3456, 2234, 1987],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(78, 205, 196, 0.8)' },
                            { offset: 1, color: 'rgba(78, 205, 196, 0.3)' }
                        ])
                    }
                },
                {
                    name: '失败次数',
                    type: 'bar',
                    data: [45, 58, 32, 67, 78, 23, 18],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(255, 107, 107, 0.8)' },
                            { offset: 1, color: 'rgba(255, 107, 107, 0.3)' }
                        ])
                    }
                },
                {
                    name: '成功率',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [98.4, 98.2, 98.9, 98.0, 97.8, 99.0, 99.1],
                    lineStyle: {
                        color: '#A8E6CF',
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                }
            ]
        };
        chart.setOption(option);
    };

    return (
        <div className="data-reporting-container">
            {/* 页面标题 */}
            <div className="page-header">
                <div className="title-section">
                    <div className="title-icon-wrapper">
                        <div className="title-icon">📤</div>
                    </div>
                    <div className="title-content">
                        <h1 className="page-title">数据上报中心</h1>
                        {/* <p className="page-subtitle">Data Reporting Center</p> */}
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-item">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <span className="stat-value">{reportingStats.totalReports.toLocaleString()}</span>
                            <span className="stat-label">总上报数</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <span className="stat-value">{reportingStats.successRate.toFixed(1)}%</span>
                            <span className="stat-label">成功率</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">💾</div>
                        <div className="stat-content">
                            <span className="stat-value">{reportingStats.dataVolume.toFixed(1)}GB</span>
                            <span className="stat-label">数据量</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">⏱️</div>
                        <div className="stat-content">
                            <span className="stat-value">{Math.round(reportingStats.avgLatency)}ms</span>
                            <span className="stat-label">平均延迟</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 图表区域 */}
            <div className="charts-grid">
                {/* 上报状态 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">⚡</span>
                        上报状态监控
                    </div>
                    <div ref={reportingStatusRef} style={{ width: '100%', height: '300px' }}></div>
                </div>

                {/* 数据传输量 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">📊</span>
                        数据传输量趋势
                    </div>
                    <div ref={dataVolumeRef} style={{ width: '100%', height: '300px' }}></div>
                </div>

                {/* 传输质量 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">🎯</span>
                        传输质量分析
                    </div>
                    <div ref={transmissionQualityRef} style={{ width: '100%', height: '300px' }}></div>
                </div>

                {/* 协议分布 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">🔗</span>
                        传输协议分布
                    </div>
                    <div ref={protocolDistributionRef} style={{ width: '100%', height: '300px' }}></div>
                </div>

                {/* 系统可靠性 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">🛡️</span>
                        系统可靠性评估
                    </div>
                    <div ref={systemReliabilityRef} style={{ width: '100%', height: '300px' }}></div>
                </div>

                {/* 上报趋势 */}
                <div className="chart-card">
                    <div className="card-title">
                        <span className="title-icon">📈</span>
                        上报趋势分析
                    </div>
                    <div ref={reportingTrendRef} style={{ width: '100%', height: '300px' }}></div>
                </div>
            </div>
        </div>
    );
} 