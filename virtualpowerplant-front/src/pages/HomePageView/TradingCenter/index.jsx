import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import * as XLSX from 'xlsx';
import './style.css';

export default function TradingCenter() {
    // 图表引用
    const pricePredictionRef = useRef(null);
    const costAnalysisRef = useRef(null);
    const bidAnalysisRef = useRef(null);
    const quarterlyReviewRef = useRef(null);
    const monthlyReviewRef = useRef(null);
    const yearlyReviewRef = useRef(null);
    const historyTradeRef = useRef(null);


    // 交易中心统计数据
    const [tradingStats, setTradingStats] = useState({
        totalTransactions: 3256,
        averagePrice: 0.85,
        tradingVolume: 12500,
        profitMargin: 22.4,
        totalPenalty: 15420,
        penaltyRate: 2.8
    });

    // 视图模式选择
    const [viewMode, setViewMode] = useState('overview');
    // 时间周期选择
    const [reviewPeriod, setReviewPeriod] = useState('quarterly');
    // 成本分析周期选择（月度、旬度、日度）
    const [costAnalysisPeriod, setCostAnalysisPeriod] = useState('monthly');
    // 展开的交易记录
    const [expandedRows, setExpandedRows] = useState(new Set());
    // 上传的Excel数据
    const [excelData, setExcelData] = useState(null);
    // 成本分析图表实例
    const costAnalysisChartRef = useRef(null);
    
    // 历史交易数据
    const [historyData, setHistoryData] = useState([
        { 
            id: 1, 
            date: '2024-01-15', 
            type: '日前交易', 
            volume: 1500, 
            price: 0.85, 
            status: '成功', 
            penalty: 0,
            penaltyDetails: []
        },
        { 
            id: 2, 
            date: '2024-01-16', 
            type: '实时交易', 
            volume: 800, 
            price: 0.92, 
            status: '失败', 
            penalty: 2400,
            penaltyDetails: [
                { type: '未履约', amount: 1500, reason: '系统故障导致未能及时响应' },
                { type: '偏差电量', amount: 900, reason: '实际发电量与申报偏差25%' }
            ]
        },
        { 
            id: 3, 
            date: '2024-01-17', 
            type: '日前交易', 
            volume: 2200, 
            price: 0.78, 
            status: '成功', 
            penalty: 0,
            penaltyDetails: []
        },
        { 
            id: 4, 
            date: '2024-01-18', 
            type: '调频交易', 
            volume: 500, 
            price: 1.15, 
            status: '部分成功', 
            penalty: 800,
            penaltyDetails: [
                { type: '响应延迟', amount: 800, reason: '调频响应时间超过规定标准5秒' }
            ]
        },
        { 
            id: 5, 
            date: '2024-01-19', 
            type: '备用交易', 
            volume: 1200, 
            price: 0.65, 
            status: '成功', 
            penalty: 0,
            penaltyDetails: []
        },
        { 
            id: 6, 
            date: '2024-01-20', 
            type: '实时交易', 
            volume: 900, 
            price: 0.88, 
            status: '失败', 
            penalty: 1800,
            penaltyDetails: [
                { type: '通信故障', amount: 1200, reason: '通信系统中断15分钟' },
                { type: '数据延迟', amount: 600, reason: '数据上报延迟超过10分钟' }
            ]
        }
    ]);



    // 初始化其他图表（不包含成本分析图表）
    useEffect(() => {
        if (viewMode !== 'overview') {
            if (viewMode === 'history') {
                setTimeout(() => {
                    initHistoryTradeChart();
                }, 100);
            }
            return;
        }

        // 初始化其他图表
        setTimeout(() => {
            initPricePredictionChart();
            initBidAnalysisChart();
            initQuarterlyReviewChart();
            initMonthlyReviewChart();
            initYearlyReviewChart();
        }, 100);

        // 清理函数
        return () => {
            // 清理价格预测图表
            if (pricePredictionRef.current) {
                const chart = echarts.getInstanceByDom(pricePredictionRef.current);
                if (chart) {
                    echarts.dispose(chart);
                }
            }
            // 清理报价分析图表
            if (bidAnalysisRef.current) {
                const chart = echarts.getInstanceByDom(bidAnalysisRef.current);
                if (chart) {
                    echarts.dispose(chart);
                }
            }
            // 清理季度复盘图表
            if (quarterlyReviewRef.current) {
                const chart = echarts.getInstanceByDom(quarterlyReviewRef.current);
                if (chart) {
                    echarts.dispose(chart);
                }
            }
            // 清理月度复盘图表
            if (monthlyReviewRef.current) {
                const chart = echarts.getInstanceByDom(monthlyReviewRef.current);
                if (chart) {
                    echarts.dispose(chart);
                }
            }
            // 清理年度复盘图表
            if (yearlyReviewRef.current) {
                const chart = echarts.getInstanceByDom(yearlyReviewRef.current);
                if (chart) {
                    echarts.dispose(chart);
                }
            }
            // 清理历史交易图表
            if (historyTradeRef.current) {
                const existingChart = echarts.getInstanceByDom(historyTradeRef.current);
                if (existingChart) {
                    if (existingChart._resizeHandler) {
                        window.removeEventListener('resize', existingChart._resizeHandler);
                    }
                    echarts.dispose(existingChart);
                }
            }
        };
    }, [viewMode]);

    // 单独管理成本分析图表，只在周期或Excel数据变化时更新
    useEffect(() => {
        if (viewMode !== 'overview') {
            // 如果不在overview模式，清理成本分析图表
            if (costAnalysisChartRef.current) {
                if (costAnalysisChartRef.current._resizeHandler) {
                    window.removeEventListener('resize', costAnalysisChartRef.current._resizeHandler);
                }
                echarts.dispose(costAnalysisChartRef.current);
                costAnalysisChartRef.current = null;
            }
            return;
        }

        // 延迟初始化，确保DOM已渲染
        const timer = setTimeout(() => {
            initCostAnalysisChart();
        }, 100);

        // 清理函数 - 只在组件卸载或viewMode变化时清理
        return () => {
            clearTimeout(timer);
            // 注意：这里不清理图表实例，因为我们要在周期变化时更新而不是重新创建
        };
    }, [viewMode, costAnalysisPeriod, excelData]);

    // 组件卸载时清理所有图表
    useEffect(() => {
        return () => {
            // 清理成本分析图表
            if (costAnalysisChartRef.current) {
                if (costAnalysisChartRef.current._resizeHandler) {
                    window.removeEventListener('resize', costAnalysisChartRef.current._resizeHandler);
                }
                echarts.dispose(costAnalysisChartRef.current);
                costAnalysisChartRef.current = null;
            }
            
            // 清理所有其他图表
            const refs = [pricePredictionRef, bidAnalysisRef, quarterlyReviewRef, monthlyReviewRef, yearlyReviewRef, historyTradeRef];
            refs.forEach(ref => {
                if (ref.current) {
                    const chart = echarts.getInstanceByDom(ref.current);
                    if (chart) {
                        if (chart._resizeHandler) {
                            window.removeEventListener('resize', chart._resizeHandler);
                        }
                        echarts.dispose(chart);
                    }
                }
            });
        };
    }, []);

    // 价格预测图表
    const initPricePredictionChart = () => {
        if (!pricePredictionRef.current) return;
        // 如果图表已经初始化，先销毁
        const existingChart = echarts.getInstanceByDom(pricePredictionRef.current);
        if (existingChart) {
            echarts.dispose(existingChart);
        }
        const chart = echarts.init(pricePredictionRef.current, 'dark');
        
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
                data: ['历史价格', '预测价格', '预测区间'],
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
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日', '下周一', '下周二', '下周三'],
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
                name: '电价(元/MWh)',
                axisLabel: {
                    color: '#fff',
                    formatter: '{value}'
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
                    name: '历史价格',
                    type: 'line',
                    data: [0.82, 0.85, 0.88, 0.86, 0.85, 0.82, 0.80],
                    lineStyle: {
                        width: 3,
                        color: '#00d4ff'
                    },
                    symbol: 'circle',
                    symbolSize: 8
                },
                {
                    name: '预测价格',
                    type: 'line',
                    data: [null, null, null, null, null, null, 0.80, 0.83, 0.87, 0.89],
                    lineStyle: {
                        width: 3,
                        color: '#FFD23F',
                        type: 'dashed'
                    },
                    symbol: 'circle',
                    symbolSize: 8
                },
                {
                    name: '预测区间',
                    type: 'line',
                    data: [null, null, null, null, null, null, 0.83, 0.86, 0.90, 0.92],
                    lineStyle: {
                        width: 0
                    },
                    areaStyle: {
                        color: 'rgba(255, 210, 63, 0.2)'
                    },
                    stack: 'confidence-band',
                    symbol: 'none'
                },
                {
                    name: '预测区间',
                    type: 'line',
                    data: [null, null, null, null, null, null, 0.77, 0.80, 0.84, 0.86],
                    lineStyle: {
                        width: 0
                    },
                    areaStyle: {
                        color: 'rgba(255, 210, 63, 0.2)'
                    },
                    stack: 'confidence-band',
                    symbol: 'none'
                }
            ]
        };
        
        chart.setOption(option);
        
        // 响应式调整
        window.addEventListener('resize', () => {
            chart.resize();
        });
    };

    // 生成默认数据（根据周期）- 体现真实的电量和报价曲线特征
    const generateDefaultData = (period) => {
        let xAxisData = [];
        let volumeData = [];
        let priceData = [];

        switch (period) {
            case 'daily':
                // 日度：24小时，体现一天内的电量波动规律
                // 白天用电量高（8-20点），夜间低（22-6点），中午和傍晚是峰值
                // 报价在峰时（8-11点，14-17点）较高，谷时（23-7点）较低
                for (let i = 0; i < 24; i++) {
                    xAxisData.push(`${String(i).padStart(2, '0')}:00`);
                    
                    // 电量曲线：体现一天内的用电规律
                    let baseVolume = 1200; // 基础电量
                    let volumeVariation = 0;
                    
                    if (i >= 6 && i <= 8) {
                        // 早晨上升期
                        volumeVariation = (i - 6) * 150;
                    } else if (i >= 9 && i <= 11) {
                        // 上午高峰
                        volumeVariation = 400 + Math.sin((i - 9) * Math.PI / 2) * 200;
                    } else if (i >= 12 && i <= 13) {
                        // 中午略降
                        volumeVariation = 500 - (i - 12) * 50;
                    } else if (i >= 14 && i <= 17) {
                        // 下午高峰
                        volumeVariation = 450 + Math.sin((i - 14) * Math.PI / 3) * 250;
                    } else if (i >= 18 && i <= 20) {
                        // 傍晚高峰（最高）
                        volumeVariation = 700 - (i - 18) * 100;
                    } else if (i >= 21 && i <= 23) {
                        // 夜间下降
                        volumeVariation = 400 - (i - 21) * 100;
                    } else {
                        // 深夜低谷（0-5点）
                        volumeVariation = 100 - i * 10;
                    }
                    
                    volumeData.push(Math.floor(baseVolume + volumeVariation));
                    
                    // 报价曲线：峰时高、谷时低
                    let basePrice = 0.65;
                    let priceVariation = 0;
                    
                    if (i >= 23 || i <= 6) {
                        // 谷时（23-6点，最低价格）
                        if (i >= 23) {
                            priceVariation = -0.20 + (24 - i) * 0.03;
                        } else {
                            priceVariation = -0.20 + i * 0.03;
                        }
                    } else if (i >= 7 && i <= 8) {
                        // 早晨过渡期
                        priceVariation = -0.02 + (i - 7) * 0.10;
                    } else if (i >= 9 && i <= 11) {
                        // 上午峰时
                        priceVariation = 0.18 + (i - 9) * 0.06;
                    } else if (i >= 12 && i <= 13) {
                        // 中午略降
                        priceVariation = 0.30 - (i - 12) * 0.05;
                    } else if (i >= 14 && i <= 17) {
                        // 下午峰时
                        priceVariation = 0.25 + Math.sin((i - 14) * Math.PI / 3) * 0.08;
                    } else if (i >= 18 && i <= 20) {
                        // 傍晚峰时（最高）
                        priceVariation = 0.33 - (i - 18) * 0.06;
                    } else if (i >= 21 && i <= 22) {
                        // 夜间下降
                        priceVariation = 0.15 - (i - 21) * 0.10;
                    }
                    
                    priceData.push(Number(Math.max(0.45, Math.min(1.05, basePrice + priceVariation)).toFixed(2)));
                }
                break;
                
            case 'tenDay':
                // 旬度：一个月分3旬，体现旬度趋势变化
                // 上旬：月初电量适中，报价平稳
                // 中旬：电量增加，报价略有上升
                // 下旬：电量达到峰值，报价较高（月末需求大）
                xAxisData = ['上旬', '中旬', '下旬'];
                
                // 电量：上旬8000，中旬9500，下旬11000（递增趋势）
                volumeData = [
                    8000,
                    9500,
                    11000
                ];
                
                // 报价：上旬0.75，中旬0.82，下旬0.88（递增趋势）
                priceData = [0.75, 0.82, 0.88];
                break;
                
            case 'monthly':
            default:
                // 月度：12个月，体现季节性变化规律
                // 夏季（6-8月）和冬季（12-2月）用电量高，春秋季相对较低
                // 报价在用电高峰季节较高
                const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
                xAxisData = months;
                
                // 电量数据：体现季节性特征
                // 1-2月（冬季）：高电量
                // 3-5月（春季）：中等电量
                // 6-8月（夏季）：最高电量（空调使用）
                // 9-11月（秋季）：中等电量
                // 12月（冬季）：高电量
                const monthlyVolumes = [
                    22000, // 1月-冬季高峰
                    23500, // 2月-冬季高峰
                    18000, // 3月-春季
                    16500, // 4月-春季
                    17500, // 5月-春季
                    24000, // 6月-夏季开始
                    26000, // 7月-夏季高峰（最高）
                    25500, // 8月-夏季高峰
                    20000, // 9月-秋季
                    18500, // 10月-秋季
                    19000, // 11月-秋季
                    22500  // 12月-冬季高峰
                ];
                volumeData = monthlyVolumes;
                
                // 报价数据：在用电高峰季节报价较高
                // 夏季和冬季报价较高，春秋季相对较低
                const monthlyPrices = [
                    0.92, // 1月-冬季高峰
                    0.95, // 2月-冬季高峰
                    0.78, // 3月-春季
                    0.72, // 4月-春季
                    0.75, // 5月-春季
                    0.88, // 6月-夏季开始
                    0.95, // 7月-夏季高峰（最高）
                    0.93, // 8月-夏季高峰
                    0.80, // 9月-秋季
                    0.76, // 10月-秋季
                    0.78, // 11月-秋季
                    0.90  // 12月-冬季高峰
                ];
                priceData = monthlyPrices;
                break;
        }

        return { xAxisData, volumeData, priceData };
    };

    // 解析Excel数据
    const parseExcelData = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    // 解析Excel数据，假设格式为：日期/时间、电量、报价
                    const parsedData = {
                        xAxisData: [],
                        volumeData: [],
                        priceData: []
                    };

                    jsonData.forEach((row, index) => {
                        // 假设Excel第一列是日期/时间，第二列是电量，第三列是报价
                        const keys = Object.keys(row);
                        if (keys.length >= 3) {
                            parsedData.xAxisData.push(String(row[keys[0]] || `数据${index + 1}`));
                            parsedData.volumeData.push(Number(row[keys[1]]) || 0);
                            parsedData.priceData.push(Number(row[keys[2]]) || 0);
                        }
                    });

                    if (parsedData.xAxisData.length > 0) {
                        resolve(parsedData);
                    } else {
                        reject(new Error('Excel文件格式不正确，请确保包含日期、电量和报价三列数据'));
                    }
                } catch (error) {
                    reject(new Error('解析Excel文件失败：' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('读取文件失败'));
            reader.readAsArrayBuffer(file);
        });
    };

    // 处理Excel文件上传
    const handleExcelUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // 检查文件类型
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ];
        
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            alert('请上传Excel文件（.xlsx, .xls, .csv格式）');
            return;
        }

        try {
            const parsedData = await parseExcelData(file);
            setExcelData(parsedData);
        } catch (error) {
            alert(error.message);
        }
    };

    // 成本分析图表（电量和报价曲线）
    const initCostAnalysisChart = () => {
        if (!costAnalysisRef.current) return;
        
        let chart = costAnalysisChartRef.current;
        
        // 如果图表实例不存在或已被销毁，则创建新的
        if (!chart || (chart.isDisposed && chart.isDisposed())) {
            // 如果之前的实例存在但已销毁，先清理
            if (chart && chart._resizeHandler) {
                window.removeEventListener('resize', chart._resizeHandler);
            }
            chart = echarts.init(costAnalysisRef.current, 'dark');
            costAnalysisChartRef.current = chart;
        }

        // 使用上传的Excel数据或默认数据
        const data = excelData || generateDefaultData(costAnalysisPeriod);
        // 判断是否需要旋转标签（数据点较多或使用Excel数据时）
        const shouldRotateLabel = excelData ? data.xAxisData.length > 12 : costAnalysisPeriod === 'daily';
        const labelFontSize = excelData ? (data.xAxisData.length > 24 ? 9 : 11) : (costAnalysisPeriod === 'daily' ? 10 : 12);
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                formatter: function (params) {
                    let result = params[0].name + '<br/>';
                    params.forEach(param => {
                        if (param.seriesName === '电量') {
                            result += `${param.marker}${param.seriesName}: ${param.value} MWh<br/>`;
                        } else {
                            result += `${param.marker}${param.seriesName}: ${param.value} 元/MWh<br/>`;
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['电量 (MWh)', '报价 (元/MWh)'],
                textStyle: {
                    color: '#fff',
                    fontSize: 12
                },
                top: 10,
                itemGap: 20
            },
            grid: {
                left: '8%',
                right: '8%',
                bottom: shouldRotateLabel ? '12%' : '8%',
                top: '18%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.xAxisData,
                axisLabel: {
                    color: '#fff',
                    rotate: shouldRotateLabel ? 45 : 0,
                    fontSize: labelFontSize,
                    interval: excelData && data.xAxisData.length > 30 ? 'auto' : 0
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
                    name: '电量(MWh)',
                    position: 'left',
                    axisLabel: {
                        color: '#fff',
                        formatter: '{value}'
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
                    name: '报价(元/MWh)',
                    position: 'right',
                    axisLabel: {
                        color: '#fff',
                        formatter: '{value}'
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 210, 63, 0.5)'
                        }
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name: '电量 (MWh)',
                    type: 'line',
                    yAxisIndex: 0,
                    data: data.volumeData,
                    smooth: costAnalysisPeriod === 'monthly' || costAnalysisPeriod === 'tenDay',
                    lineStyle: {
                        width: 3,
                        color: '#00d4ff'
                    },
                    itemStyle: {
                        color: '#00d4ff',
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
                            { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
                        ])
                    },
                    symbol: 'circle',
                    symbolSize: costAnalysisPeriod === 'daily' ? 5 : 8,
                    emphasis: {
                        focus: 'series',
                        itemStyle: {
                            borderWidth: 3,
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 212, 255, 0.8)'
                        }
                    }
                },
                {
                    name: '报价 (元/MWh)',
                    type: 'line',
                    yAxisIndex: 1,
                    data: data.priceData,
                    smooth: costAnalysisPeriod === 'monthly' || costAnalysisPeriod === 'tenDay',
                    lineStyle: {
                        width: 3,
                        color: '#FFD23F',
                        type: costAnalysisPeriod === 'daily' ? 'solid' : 'solid'
                    },
                    itemStyle: {
                        color: '#FFD23F',
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    symbol: 'circle',
                    symbolSize: costAnalysisPeriod === 'daily' ? 5 : 8,
                    emphasis: {
                        focus: 'series',
                        itemStyle: {
                            borderWidth: 3,
                            shadowBlur: 10,
                            shadowColor: 'rgba(255, 210, 63, 0.8)'
                        }
                    }
                }
            ]
        };
        
        // 使用setOption更新图表，notMerge: true 表示不合并选项（完全替换）
        // 因为xAxis数据和series数据都完全改变了，所以需要完全替换
        chart.setOption(option, true);
        
        // 确保图表大小正确
        if (chart && !chart.isDisposed()) {
            chart.resize();
        }
        
        // 响应式调整 - 只在首次创建时添加监听器
        if (!chart._resizeHandler) {
            chart._resizeHandler = () => {
                if (chart && !chart.isDisposed()) {
                    chart.resize();
                }
            };
            window.addEventListener('resize', chart._resizeHandler);
        }
    };

    // 报价分析图表
    const initBidAnalysisChart = () => {
        if (!bidAnalysisRef.current) return;
        // 如果图表已经初始化，先销毁
        const existingChart = echarts.getInstanceByDom(bidAnalysisRef.current);
        if (existingChart) {
            echarts.dispose(existingChart);
        }
        const chart = echarts.init(bidAnalysisRef.current, 'dark');
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['成功报价', '失败报价', '平均成交价'],
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
                data: ['峰时', '平时', '谷时', '尖峰', '低谷'],
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
                    name: '报价次数',
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
                    name: '价格(元/MWh)',
                    axisLabel: {
                        color: '#fff',
                        formatter: '{value}'
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.5)'
                        }
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name: '成功报价',
                    type: 'bar',
                    stack: 'total',
                    data: [120, 132, 101, 134, 90],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#06FFA5' },
                            { offset: 1, color: '#06FFA540' }
                        ])
                    }
                },
                {
                    name: '失败报价',
                    type: 'bar',
                    stack: 'total',
                    data: [20, 32, 21, 34, 10],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#FF6B35' },
                            { offset: 1, color: '#FF6B3540' }
                        ])
                    }
                },
                {
                    name: '平均成交价',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [0.92, 0.85, 0.75, 1.05, 0.68],
                    lineStyle: {
                        color: '#FFD23F',
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                }
            ]
        };
        
        chart.setOption(option);
        
        // 响应式调整
        window.addEventListener('resize', () => {
            chart.resize();
        });
    };

    // 季度复盘图表
    const initQuarterlyReviewChart = () => {
        if (!quarterlyReviewRef.current) return;
        // 如果图表已经初始化，先销毁
        const existingChart = echarts.getInstanceByDom(quarterlyReviewRef.current);
        if (existingChart) {
            echarts.dispose(existingChart);
        }
        const chart = echarts.init(quarterlyReviewRef.current, 'dark');
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['交易量', '交易额', '利润率'],
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
                data: ['第一季度', '第二季度', '第三季度', '第四季度'],
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
                    name: '交易量(MWh)',
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
                    name: '利润率(%)',
                    max: 50,
                    axisLabel: {
                        color: '#fff',
                        formatter: '{value}%'
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.5)'
                        }
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name: '交易量',
                    type: 'bar',
                    data: [3200, 3500, 4100, 3800],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#00d4ff' },
                            { offset: 1, color: '#00d4ff40' }
                        ])
                    }
                },
                {
                    name: '交易额',
                    type: 'bar',
                    data: [2800, 3100, 3600, 3300],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#4D9DE0' },
                            { offset: 1, color: '#4D9DE040' }
                        ])
                    }
                },
                {
                    name: '利润率',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [20.5, 22.8, 25.3, 23.6],
                    lineStyle: {
                        color: '#FFD23F',
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                }
            ]
        };
        
        chart.setOption(option);
        
        // 响应式调整
        window.addEventListener('resize', () => {
            chart.resize();
        });
    };

    // 月度复盘图表
    const initMonthlyReviewChart = () => {
        if (!monthlyReviewRef.current) return;
        // 如果图表已经初始化，先销毁
        const existingChart = echarts.getInstanceByDom(monthlyReviewRef.current);
        if (existingChart) {
            echarts.dispose(existingChart);
        }
        const chart = echarts.init(monthlyReviewRef.current, 'dark');
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: '#FF4500',
                borderWidth: 1,
                textStyle: {
                    color: '#fff'
                }
            },
            animation: true,
            animationDuration: 1500,
            animationEasing: 'elasticOut',
            legend: {
                data: ['交易量', '交易额', '利润率'],
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
                data: ['1月', '2月', '3月', '4月', '5月', '6月'],
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
                    name: '交易量(MWh)',
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
                    name: '利润率(%)',
                    max: 50,
                    axisLabel: {
                        color: '#fff',
                        formatter: '{value}%'
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.5)'
                        }
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name: '交易量',
                    type: 'bar',
                    data: [1050, 1080, 1070, 1150, 1180, 1170],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#00d4ff' },
                            { offset: 1, color: '#00d4ff40' }
                        ])
                    }
                },
                {
                    name: '交易额',
                    type: 'bar',
                    data: [920, 950, 930, 1020, 1050, 1030],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#4D9DE0' },
                            { offset: 1, color: '#4D9DE040' }
                        ])
                    }
                },
                {
                    name: '利润率',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [19.5, 20.2, 21.8, 22.3, 23.1, 22.8],
                    lineStyle: {
                        color: '#FFD23F',
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                }
            ]
        };
        
        chart.setOption(option);
        
        // 响应式调整
        window.addEventListener('resize', () => {
            chart.resize();
        });
    };

    // 年度复盘图表
    const initYearlyReviewChart = () => {
        if (!yearlyReviewRef.current) return;
        // 如果图表已经初始化，先销毁
        const existingChart = echarts.getInstanceByDom(yearlyReviewRef.current);
        if (existingChart) {
            echarts.dispose(existingChart);
        }
        const chart = echarts.init(yearlyReviewRef.current, 'dark');
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['交易量', '交易额', '利润率'],
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
                data: ['2018年', '2019年', '2020年', '2021年', '2022年', '2023年'],
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
                    name: '交易量(MWh)',
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
                    name: '利润率(%)',
                    max: 50,
                    axisLabel: {
                        color: '#fff',
                        formatter: '{value}%'
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.5)'
                        }
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name: '交易量',
                    type: 'bar',
                    data: [8500, 9800, 11200, 12500, 14000, 15500],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#00d4ff' },
                            { offset: 1, color: '#00d4ff40' }
                        ])
                    }
                },
                {
                    name: '交易额',
                    type: 'bar',
                    data: [7200, 8500, 9800, 11000, 12500, 13800],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#4D9DE0' },
                            { offset: 1, color: '#4D9DE040' }
                        ])
                    }
                },
                {
                    name: '利润率',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [15.2, 17.5, 19.3, 20.8, 22.1, 22.4],
                    lineStyle: {
                        color: '#FFD23F',
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                }
            ]
        };
        
        chart.setOption(option);
        
        // 响应式调整
        window.addEventListener('resize', () => {
            chart.resize();
        });
    };

    // 历史交易图表
    const initHistoryTradeChart = () => {
        if (!historyTradeRef.current) return;
        // 如果图表已经初始化，先销毁
        const existingChart = echarts.getInstanceByDom(historyTradeRef.current);
        if (existingChart) {
            echarts.dispose(existingChart);
        }
        const chart = echarts.init(historyTradeRef.current, 'dark');
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                data: ['交易量', '成交价格', '罚款金额'],
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
                data: ['01-15', '01-16', '01-17', '01-18', '01-19', '01-20', '01-21', '01-22'],
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
                    name: '交易量(MWh)',
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
                    name: '金额(元)',
                    axisLabel: {
                        color: '#fff'
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(0, 212, 255, 0.5)'
                        }
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name: '交易量',
                    type: 'bar',
                    data: [1500, 800, 2200, 500, 1200, 900, 1800, 1600],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#00d4ff' },
                            { offset: 1, color: '#00d4ff40' }
                        ])
                    }
                },
                {
                    name: '成交价格',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [0.85, 0.92, 0.78, 1.15, 0.65, 0.88, 0.82, 0.86],
                    lineStyle: {
                        color: '#FFD23F',
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                },
                {
                    name: '罚款金额',
                    type: 'line',
                    yAxisIndex: 1,
                    data: [0, 2400, 0, 800, 0, 1800, 1200, 0],
                    lineStyle: {
                        color: '#FF6B35',
                        width: 3
                    },
                    symbol: 'triangle',
                    symbolSize: 10
                }
            ]
        };
        
        chart.setOption(option);
        
        window.addEventListener('resize', () => {
            chart.resize();
        });
    };



    // 历史交易趋势图表


    // 处理视图模式切换
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
    };

    // 处理时间周期选择
    const handlePeriodChange = (period) => {
        setReviewPeriod(period);
    };

    // 新增：下载Excel模板
    const handleDownloadTemplate = () => {
        const headers = ['开始时间','结束时间','阶梯段1电力','阶梯段1电价','阶梯段2电力','阶梯段2电价','阶梯段3电力','阶梯段3电价','阶梯段4电力','阶梯段4电价','阶梯段5电力','阶梯段5电价'];
        const templateRows = [
            ['00:15','24:00','','','','','','','','','','']
        ];
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...templateRows]);
        worksheet['!cols'] = headers.map(h => ({ wch: Math.max(10, h.length + 2) }));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '模板');
        XLSX.writeFile(workbook, '电量和报价分析模板文件.xlsx');
    };

    // 切换行展开状态
    const toggleRowExpansion = (id) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(id)) {
            newExpandedRows.delete(id);
        } else {
            newExpandedRows.add(id);
        }
        setExpandedRows(newExpandedRows);
    };

    // 渲染交易复盘图表
    const renderReviewChart = () => {
        switch (reviewPeriod) {
            case 'quarterly':
                return (
                    <div className="chart-card" style={{ gridArea: 'review' }}>
                        <div className="card-title">
                            <span className="title-icon">📊</span>
                            季度交易复盘
                        </div>
                        <div className="chart-container" ref={quarterlyReviewRef}></div>
                    </div>
                );
            case 'monthly':
                return (
                    <div className="chart-card" style={{ gridArea: 'review' }}>
                        <div className="card-title">
                            <span className="title-icon">📊</span>
                            月度交易复盘
                        </div>
                        <div className="chart-container" ref={monthlyReviewRef}></div>
                    </div>
                );
            case 'yearly':
                return (
                    <div className="chart-card" style={{ gridArea: 'review' }}>
                        <div className="card-title">
                            <span className="title-icon">📊</span>
                            年度交易复盘
                        </div>
                        <div className="chart-container" ref={yearlyReviewRef}></div>
                    </div>
                );
            default:
                return (
                    <div className="chart-card" style={{ gridArea: 'review' }}>
                        <div className="card-title">
                            <span className="title-icon">📊</span>
                            季度交易复盘
                        </div>
                        <div className="chart-container" ref={quarterlyReviewRef}></div>
                    </div>
                );
        }
    };

    return (
        <div className="trading-center-container">
            {/* 页面标题区域 */}
            <div className="page-header">
                <div className="title-section">
                    <div className="title-icon-wrapper">
                        <div className="title-icon">💰</div>
                    </div>
                    <div className="title-content">
                        <h1 className="page-title">交易中心</h1>
                        <p className="page-subtitle">需求响应 · 辅助服务</p>
                    </div>
                </div>
             
            </div>

            {/* 视图模式选择器 */}
            <div className="view-mode-selector">
                <div className="selector-label">查看模式:</div>
                <div className="selector-options">
                    <button 
                        className={`mode-option ${viewMode === 'overview' ? 'active' : ''}`}
                        onClick={() => handleViewModeChange('overview')}
                    >
                        🔄 交易面板
                    </button>
                    <button 
                        className={`mode-option ${viewMode === 'history' ? 'active' : ''}`}
                        onClick={() => handleViewModeChange('history')}
                    >
                        📊 历史交易
                    </button>
                </div>
            </div>

            {viewMode === 'overview' && (
                <>
                    {/* 时间周期选择器 */}
                    <div className="period-selector">
                        <div className="selector-label">交易复盘周期:</div>
                        <div className="selector-options">
                            <button 
                                className={`period-option ${reviewPeriod === 'quarterly' ? 'active' : ''}`}
                                onClick={() => handlePeriodChange('quarterly')}
                            >
                                季度
                            </button>
                            <button 
                                className={`period-option ${reviewPeriod === 'monthly' ? 'active' : ''}`}
                                onClick={() => handlePeriodChange('monthly')}
                            >
                                月度
                            </button>
                            <button 
                                className={`period-option ${reviewPeriod === 'yearly' ? 'active' : ''}`}
                                onClick={() => handlePeriodChange('yearly')}
                            >
                                年度
                            </button>
                        </div>
                    </div>

                    {/* 图表网格 */}
                    <div className="trading-charts-grid">
                        <div className="chart-card" style={{ gridArea: 'price' }}>
                            <div className="card-title">
                                <span className="title-icon">🔮</span>
                                价格预测
                            </div>
                            <div className="chart-container" ref={pricePredictionRef}></div>
                        </div>

                        <div className="chart-card" style={{ gridArea: 'bid' }}>
                            <div className="card-title">
                                <span className="title-icon">📝</span>
                                报价分析
                            </div>
                            <div className="chart-container" ref={bidAnalysisRef}></div>
                        </div>
                        {renderReviewChart()}
                        <div className="chart-card" style={{ gridArea: 'cost' }}>
                            <div className="card-title">
                                <span className="title-icon">💹</span>
                                电量和报价分析
                                <span className="period-indicator">
                                    {costAnalysisPeriod === 'daily' ? '（日度）' : 
                                     costAnalysisPeriod === 'tenDay' ? '（旬度）' : '（月度）'}
                                </span>
                            </div>
                            <div className="cost-analysis-controls">
                                <div className="cost-period-selector">
                                    <button 
                                        className={`cost-period-option ${costAnalysisPeriod === 'daily' ? 'active' : ''}`}
                                        onClick={() => setCostAnalysisPeriod('daily')}
                                    >
                                        日度
                                    </button>
                                    <button 
                                        className={`cost-period-option ${costAnalysisPeriod === 'tenDay' ? 'active' : ''}`}
                                        onClick={() => setCostAnalysisPeriod('tenDay')}
                                    >
                                        旬度
                                    </button>
                                    <button 
                                        className={`cost-period-option ${costAnalysisPeriod === 'monthly' ? 'active' : ''}`}
                                        onClick={() => setCostAnalysisPeriod('monthly')}
                                    >
                                        月度
                                    </button>
                                </div>
                                <div className="excel-upload-section">
                                    <button className="excel-download-btn" onClick={handleDownloadTemplate}>⬇️ 下载模板</button>
                                    <input 
                                        type="file" 
                                        id="excel-upload-input"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleExcelUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="excel-upload-input" className="excel-upload-btn">
                                        📁 上传Excel
                                    </label>
                                    {excelData && (
                                        <span className="excel-upload-status" onClick={() => setExcelData(null)}>
                                            ✓ 已加载数据 (点击清除)
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="chart-container" ref={costAnalysisRef}></div>
                        </div>
                    </div>
                </>
            )}

            {viewMode === 'history' && (
                <div className="history-view">
                    <div className="history-charts">
                        <div className="chart-card">
                            <div className="card-title">
                                <span className="title-icon">📈</span>
                                历史交易趋势
                            </div>
                            <div className="chart-container" ref={historyTradeRef}></div>
                        </div>
                    </div>
                    
                    <div className="history-table-card">
                        <div className="card-title">
                            <span className="title-icon">📋</span>
                            交易记录详情
                        </div>
                        <div className="history-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>操作</th>
                                        <th>日期</th>
                                        <th>交易类型</th>
                                        <th>交易量(MWh)</th>
                                        <th>价格(元/MWh)</th>
                                        <th>状态</th>
                                        <th>罚款(元)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyData.map(item => (
                                        <>
                                            <tr key={item.id} className="main-row">
                                                <td>
                                                    {item.penalty > 0 && (
                                                        <button 
                                                            className="expand-btn"
                                                            onClick={() => toggleRowExpansion(item.id)}
                                                        >
                                                            {expandedRows.has(item.id) ? '▼' : '▶'}
                                                        </button>
                                                    )}
                                                </td>
                                                <td>{item.date}</td>
                                                <td>{item.type}</td>
                                                <td>{item.volume}</td>
                                                <td>{item.price}</td>
                                                <td>
                                                    <span className={`status ${item.status === '成功' ? 'success' : 
                                                        item.status === '失败' ? 'failed' : 'partial'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className={item.penalty > 0 ? 'penalty-amount' : ''}>
                                                    {item.penalty || '-'}
                                                    {item.penalty > 0 && (
                                                        <span className="penalty-detail-hint">
                                                            {expandedRows.has(item.id) ? ' 收起详情' : ' 查看详情'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedRows.has(item.id) && item.penaltyDetails.length > 0 && (
                                                <tr key={`${item.id}-details`} className="detail-row">
                                                    <td colSpan="7">
                                                        <div className="penalty-details">
                                                            <div className="penalty-details-header">
                                                                <span className="details-icon">💸</span>
                                                                罚款详情分析
                                                            </div>
                                                            <div className="penalty-details-content">
                                                                {item.penaltyDetails.map((detail, index) => (
                                                                    <div key={index} className="penalty-item">
                                                                        <div className="penalty-item-header">
                                                                            <span className="penalty-type">{detail.type}</span>
                                                                            <span className="penalty-amount-detail">
                                                                                {detail.amount} 元
                                                                            </span>
                                                                        </div>
                                                                        <div className="penalty-reason">
                                                                            原因: {detail.reason}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <div className="penalty-summary">
                                                                    <div className="summary-line">
                                                                        <span>罚款总计:</span>
                                                                        <span className="total-penalty">{item.penalty} 元</span>
                                                                    </div>
                                                                    <div className="summary-line">
                                                                        <span>罚款项目:</span>
                                                                        <span>{item.penaltyDetails.length} 项</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
