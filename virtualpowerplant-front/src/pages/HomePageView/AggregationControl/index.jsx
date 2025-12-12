import React, { useState, useEffect, useRef } from "react";
import * as echarts from "echarts";
import "./style.css";

// 生成当前月份的天数标签
const generateCurrentMonthDays = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(`${i}日`);
  }
  return days;
};

// 生成当前月份的每日收益数据
const generateCurrentMonthData = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = currentDate.getDate();

  // 生成各服务类型的每日收益数据（模拟真实波动）
  const generateDailyData = (baseValue, variation = 2) => {
    const data = [];
    for (let i = 0; i < daysInMonth; i++) {
      const dayNumber = i + 1;
      // 使用日期作为种子，确保数据一致性
      const seed = (year + month + i) * 0.01;
      const weekday = new Date(year, month, i + 1).getDay();

      // 工作日和周末的收益差异
      const weekdayFactor = weekday === 0 || weekday === 6 ? 0.8 : 1.0;

      // 月初月末的收益波动
      const monthPositionFactor =
        1 + Math.sin((i / daysInMonth) * Math.PI) * 0.1;

      // 随机波动（基于日期的伪随机数）
      const randomFactor = 1 + (Math.sin(seed * 100) * variation) / baseValue;

      let value =
        baseValue * weekdayFactor * monthPositionFactor * randomFactor;

      // 如果是未来日期，应用预测因子（稍微降低一些确定性）
      if (dayNumber > today) {
        value *= 0.9 + Math.random() * 0.2; // 90%-110%的预测范围
      }

      data.push(Number(value.toFixed(1)));
    }
    return data;
  };

  return {
    调频服务: generateDailyData(1.1, 0.3), // 平均1.1万/天，波动±0.3万
    调峰服务: generateDailyData(1.3, 0.4), // 平均1.3万/天，波动±0.4万
    无功补偿: generateDailyData(0.5, 0.15), // 平均0.5万/天，波动±0.15万
    电压调节: generateDailyData(0.4, 0.12), // 平均0.4万/天，波动±0.12万、
  };
};

const AggregationControl = () => {
  const [currentView, setCurrentView] = useState("overview"); // 'overview' 或 具体服务ID
  const [selectedSubModule, setSelectedSubModule] = useState(null); // 子模块: 'pointsAccount' 或 null
  const [selectedTimeRange, setSelectedTimeRange] = useState("6months"); // 选中的时间范围
  const [chartType, setChartType] = useState("trend"); // 图表类型: 'trend' 或 'compare'
  const [isChartLoading, setIsChartLoading] = useState(false); // 图表加载状态

  // 调峰服务图表引用
  const peakLoadChartRef = useRef(null);
  const peakPredictionChartRef = useRef(null);
  const peakDeviceChartRef = useRef(null);
  const peakRevenueChartRef = useRef(null);
  const peakEfficiencyChartRef = useRef(null);
  const [realTimeData, setRealTimeData] = useState({
    totalCapacity: 2850,
    activeCapacity: 2120,
    responseTime: 1.2,
    efficiency: 96.8,
    revenue: 856400,
  });

  // 服务数据
  const [services] = useState([
    {
      id: "frequency",
      name: "调频服务",
      icon: "📈",
      color: "#667eea",
      status: "运行中",
      capacity: 1000,
      active: 750,
      revenue: 285600,
      description: "通过快速调节发电功率维持电网频率稳定",
    },
    {
      id: "peak",
      name: "调峰服务",
      icon: "⛰️",
      color: "#764ba2",
      status: "运行中",
      capacity: 800,
      active: 550,
      revenue: 325800,
      description: "在用电高峰期提供额外发电容量",
    },
    {
      id: "reactive",
      name: "无功补偿",
      icon: "⚡",
      color: "#11998e",
      status: "运行中",
      capacity: 600,
      active: 480,
      revenue: 125600,
      description: "提供无功功率改善电网功率因数",
    },
    {
      id: "voltage",
      name: "电压调节",
      icon: "🔋",
      color: "#fa709a",
      status: "运行中",
      capacity: 450,
      active: 340,
      revenue: 119400,
      description: "维持电网电压水平在合理范围内",
    },
  ]);

  // 实时统计数据
  const [statistics] = useState({
    totalDevices: 156,
    onlineDevices: 148,
    totalRevenue: 856400,
    monthlyRevenue: 125600,
    responseRate: 98.5,
    efficiency: 96.8,
  });

  // 新增：积分账户数据（针对多个虚拟电厂）
  const [pointsAccount, setPointsAccount] = useState({
    selectedPlantId: "vpp-north",
    plants: [
      {
        id: "vpp-north",
        name: "华北虚拟电厂",
        totalPoints: 24800,
        availablePoints: 21800,
        tier: "黄金会员",
        nextTierThreshold: 80000,
        monthlyGained: 1200,
        recentTransactions: [
          { date: "2025-11-01", description: "参与调峰奖励（华北）", points: 800, type: "income" },
          { date: "2025-10-30", description: "设备维护扣减（华北）", points: -120, type: "expense" },
          { date: "2025-10-28", description: "响应调度奖励（华北）", points: 500, type: "income" }
        ]
      },
      {
        id: "vpp-east",
        name: "华东虚拟电厂",
        totalPoints: 19800,
        availablePoints: 18200,
        tier: "白金会员",
        nextTierThreshold: 120000,
        monthlyGained: 1500,
        recentTransactions: [
          { date: "2025-11-02", description: "绿色日电力参与（华东）", points: 1000, type: "income" },
          { date: "2025-10-25", description: "兑换礼品（华东）", points: -600, type: "expense" }
        ]
      },
      {
        id: "vpp-southwest",
        name: "西南虚拟电厂",
        totalPoints: 13630,
        availablePoints: 13210,
        tier: "黄金会员",
        nextTierThreshold: 80000,
        monthlyGained: 500,
        recentTransactions: [
          { date: "2025-10-29", description: "快速响应奖励（西南）", points: 300, type: "income" },
          { date: "2025-10-24", description: "设备维护扣减（西南）", points: -170, type: "expense" }
        ]
      }
    ],
    // 聚合字段：用于概览入口卡片兼容旧引用
    totalPoints: 58230,
    availablePoints: 53210,
    tier: "黄金会员",
    nextTierThreshold: 80000,
    monthlyGained: 3200,
    recentTransactions: [
      { date: "2025-11-01", description: "参与调峰奖励（总览）", points: 800, type: "income" },
      { date: "2025-10-30", description: "设备维护扣减（总览）", points: -120, type: "expense" },
      { date: "2025-10-28", description: "响应调度奖励（总览）", points: 500, type: "income" },
      { date: "2025-10-26", description: "兑换礼品（总览）", points: -2000, type: "expense" }
    ]
  });

  // 图表引用
  const overviewChartRef = useRef(null);
  const serviceDistributionRef = useRef(null);
  const revenueChartRef = useRef(null);
  const performanceChartRef = useRef(null);

  // 频率服务详细数据
  const [frequencyDetail] = useState({
    currentFrequency: 50.02,
    targetFrequency: 50.0,
    deviation: 0.02,
    responseTime: 1.2,
    accuracy: 98.5,
    availability: 99.2,
    regulation: {
      primary: {
        status: "正常",
        capacity: 500,
        current: 120,
        efficiency: 95.2,
      },
      secondary: {
        status: "正常",
        capacity: 300,
        current: 85,
        efficiency: 97.1,
      },
      tertiary: {
        status: "正常",
        capacity: 200,
        current: 45,
        efficiency: 93.8,
      },
    },
    hourlyData: [
      { time: "00:00", frequency: 50.01, response: 120 },
      { time: "04:00", frequency: 49.99, response: 85 },
      { time: "08:00", frequency: 50.03, response: 150 },
      { time: "12:00", frequency: 49.98, response: 95 },
      { time: "16:00", frequency: 50.01, response: 110 },
      { time: "20:00", frequency: 49.99, response: 75 },
      { time: "24:00", frequency: 50.02, response: 130 },
    ],
  });

  // 调峰服务详细数据
  const [peakDetail] = useState({
    currentLoad: 1850,
    peakLoad: 2200,
    valleyLoad: 800,
    peakShaving: {
      available: 800,
      dispatched: 350,
      reserved: 450,
      efficiency: 92.5,
      responseTime: 3.2,
      utilizationRate: 43.8,
    },
    loadFillRate: 85.2,
    economicBenefit: 325800,
    dailyRevenue: 12500,
    monthlyTarget: 980000,
    participation: [
      {
        device: "储能系统1",
        capacity: 200,
        dispatched: 180,
        revenue: 45600,
        status: "运行",
        efficiency: 95.2,
        responseTime: 0.5,
        location: "邢台经济开发区",
        type: "battery",
        health: 98.5,
        temperature: 25.3,
        soc: 78.5,
      },
      {
        device: "燃气机组2",
        capacity: 300,
        dispatched: 120,
        revenue: 78900,
        status: "运行",
        efficiency: 88.7,
        responseTime: 5.2,
        location: "桥东区工业园",
        type: "gas",
        health: 94.2,
        fuelLevel: 85.6,
        emissions: 2.3,
      },
      {
        device: "负荷聚合器1",
        capacity: 150,
        dispatched: 50,
        revenue: 25200,
        status: "待机",
        efficiency: 91.3,
        responseTime: 2.1,
        location: "襄都区商业中心",
        type: "load",
        health: 96.8,
        participants: 45,
        compliance: 98.2,
      },
      {
        device: "工业用户群",
        capacity: 250,
        dispatched: 0,
        revenue: 55900,
        status: "待机",
        efficiency: 89.4,
        responseTime: 8.5,
        location: "宁晋县工业区",
        type: "industrial",
        health: 92.1,
        participants: 12,
        compliance: 95.7,
      },
    ],
    hourlyLoad: [
      800, 750, 720, 700, 680, 720, 800, 1200, 1500, 1800, 1900, 2000, 2100,
      2200, 2000, 1900, 1800, 1600, 1400, 1200, 1000, 900, 850, 800,
    ],
    hourlyPrediction: [
      820, 780, 740, 720, 700, 750, 850, 1250, 1550, 1850, 1950, 2050, 2150,
      2250, 2050, 1950, 1850, 1650, 1450, 1250, 1050, 950, 880, 820,
    ],
    peakEvents: [
      {
        id: 1,
        time: "14:30",
        type: "负荷高峰",
        severity: "high",
        duration: 45,
        response: "调用储能系统180MW",
        result: "成功削峰15%",
        savings: 8500,
      },
      {
        id: 2,
        time: "19:15",
        type: "晚高峰",
        severity: "medium",
        duration: 30,
        response: "调用燃气机组120MW",
        result: "成功削峰12%",
        savings: 6200,
      },
      {
        id: 3,
        time: "10:45",
        type: "工业负荷",
        severity: "low",
        duration: 20,
        response: "负荷转移50MW",
        result: "成功优化8%",
        savings: 3100,
      },
    ],
    marketPrices: {
      current: 0.68,
      peak: 0.95,
      valley: 0.32,
      forecast: [
        0.68, 0.72, 0.78, 0.85, 0.92, 0.95, 0.88, 0.75, 0.65, 0.58, 0.45, 0.35,
      ],
    },
    recommendations: [
      {
        id: 1,
        type: "optimization",
        priority: "high",
        title: "储能系统充电策略优化",
        description: "建议在23:00-06:00低谷时段增加储能充电功率至150MW",
        expectedBenefit: "预计增加收益15%",
        implementation: "立即执行",
        risk: "low",
      },
      {
        id: 2,
        type: "maintenance",
        priority: "medium",
        title: "燃气机组效率提升",
        description: "燃气机组2效率偏低，建议安排维护检查",
        expectedBenefit: "预计提升效率3-5%",
        implementation: "计划维护",
        risk: "medium",
      },
      {
        id: 3,
        type: "expansion",
        priority: "low",
        title: "负荷聚合器扩容",
        description: "当前负荷聚合器利用率较低，建议增加参与用户",
        expectedBenefit: "预计增加容量20%",
        implementation: "长期规划",
        risk: "low",
      },
    ],
  });

  // 实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData((prev) => ({
        ...prev,
        activeCapacity: prev.activeCapacity + (Math.random() - 0.5) * 50,
        efficiency: prev.efficiency + (Math.random() - 0.5) * 2,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 初始化图表
  useEffect(() => {
    if (currentView === "overview") {
      setTimeout(() => {
        initOverviewCharts();
      }, 100);
    } else if (currentView === "peak") {
      setTimeout(() => {
        initPeakCharts();
      }, 100);
    } else if (currentView === "voltage") {
      setTimeout(() => {
        initVoltageCharts();
      }, 100);
    }
  }, [currentView, selectedTimeRange, chartType]); // 添加时间范围和图表类型依赖

  // 根据时间范围获取数据
  const getTimeRangeData = (timeRange) => {
    const dataConfigs = {
      "6months": {
        labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
        data: {
          调频服务: [25.2, 28.6, 31.2, 29.8, 32.5, 28.5],
          调峰服务: [30.1, 33.5, 28.9, 35.8, 31.2, 32.6],
          无功补偿: [11.8, 12.9, 13.2, 12.1, 13.8, 12.6],
          电压调节: [10.5, 11.8, 12.3, 11.9, 12.8, 11.9],
        },
      },
      year: {
        labels: [
          "1月",
          "2月",
          "3月",
          "4月",
          "5月",
          "6月",
          "7月",
          "8月",
          "9月",
          "10月",
          "11月",
          "12月",
        ],
        data: {
          调频服务: [
            22.1, 25.2, 28.6, 31.2, 29.8, 32.5, 28.5, 30.2, 33.1, 29.7, 31.8,
            34.2,
          ],
          调峰服务: [
            28.3, 30.1, 33.5, 28.9, 35.8, 31.2, 32.6, 34.9, 29.8, 33.4, 35.1,
            37.2,
          ],
          无功补偿: [
            10.5, 11.8, 12.9, 13.2, 12.1, 13.8, 12.6, 13.9, 12.4, 13.1, 14.2,
            13.7,
          ],
          电压调节: [
            9.8, 10.5, 11.8, 12.3, 11.9, 12.8, 11.9, 12.5, 11.3, 12.1, 12.9,
            13.4,
          ],
        },
      },
      quarter: {
        labels: ["10月", "11月", "12月"],
        data: {
          调频服务: [29.7, 31.8, 34.2],
          调峰服务: [33.4, 35.1, 37.2],
          无功补偿: [13.1, 14.2, 13.7],
          电压调节: [12.1, 12.9, 13.4],
        },
      },
      month: {
        labels: generateCurrentMonthDays(),
        data: generateCurrentMonthData(),
      },
    };
    return dataConfigs[timeRange] || dataConfigs["6months"];
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (event) => {
    const newTimeRange = event.target.value;
    if (newTimeRange !== selectedTimeRange) {
      setSelectedTimeRange(newTimeRange);

      // 添加图表切换动画效果
      if (revenueChartRef.current) {
        const chart = echarts.getInstanceByDom(revenueChartRef.current);
        if (chart) {
          // 显示加载动画
          chart.showLoading("default", {
            text: "数据加载中...",
            color: "#00c6ff",
            textColor: "#fff",
            maskColor: "rgba(0, 0, 0, 0.8)",
            zlevel: 0,
          });

          // 延迟一点时间模拟数据加载，然后重新渲染
          setTimeout(() => {
            chart.hideLoading();
          }, 300);
        }
      }
    }
  };

  // 处理图表类型变化
  const handleChartTypeChange = (type) => {
    if (type !== chartType) {
      setChartType(type);

      // 添加图表切换动画效果
      if (revenueChartRef.current) {
        const chart = echarts.getInstanceByDom(revenueChartRef.current);
        if (chart) {
          chart.showLoading("default", {
            text: "切换图表类型...",
            color: "#00c6ff",
            textColor: "#fff",
            maskColor: "rgba(0, 0, 0, 0.8)",
            zlevel: 0,
          });

          setTimeout(() => {
            chart.hideLoading();
          }, 300);
        }
      }
    }
  };

  // 初始化概览图表
  const initOverviewCharts = () => {
    // 服务容量分布图表
    if (serviceDistributionRef.current) {
      const chart = echarts.init(serviceDistributionRef.current);
      const option = {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#00c6ff",
          textStyle: { color: "#fff" },
        },
        legend: {
          orient: "vertical",
          right: "10%",
          top: "center",
          textStyle: { color: "#fff", fontSize: 12 },
        },
        series: [
          {
            name: "服务容量分布",
            type: "pie",
            radius: ["30%", "70%"],
            center: ["40%", "50%"],
            data: services.map((service) => ({
              value: service.capacity,
              name: service.name,
              itemStyle: { color: service.color },
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
            label: {
              show: true,
              formatter: "{b}\n{c} MW",
              color: "#fff",
            },
          },
        ],
      };
      chart.setOption(option);
    }

    // 收益趋势图表
    if (revenueChartRef.current) {
      const chart = echarts.init(revenueChartRef.current);

      // 根据选中的时间范围获取数据
      const timeRangeData = getTimeRangeData(selectedTimeRange);
      const months = timeRangeData.labels;
      const revenueData = timeRangeData.data;

      const option = {
        backgroundColor: "transparent",
        grid: {
          top: 60,
          left: 70,
          right: 40,
          bottom: 60,
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          borderColor: "#00c6ff",
          borderWidth: 1,
          textStyle: {
            color: "#fff",
            fontSize: 12,
          },
          formatter: function (params) {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            // 根据时间范围调整标题显示
            let title = params[0].axisValue;
            if (selectedTimeRange === "month") {
              const dayNumber = parseInt(params[0].axisValue.replace("日", ""));
              const date = new Date(year, month - 1, dayNumber);
              const weekdays = [
                "周日",
                "周一",
                "周二",
                "周三",
                "周四",
                "周五",
                "周六",
              ];
              title = `${year}年${month}月${dayNumber}日 (${
                weekdays[date.getDay()]
              })`;
            }

            let result = `<div style="font-weight: bold; margin-bottom: 8px; color: #00c6ff;">${title}</div>`;
            let total = 0;
            params.forEach((param) => {
              total += param.value;
              result += `<div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
                <span style="flex: 1;">${param.seriesName}:</span>
                <span style="font-weight: bold; color: #00c6ff;">¥${param.value}万</span>
              </div>`;
            });
            result += `<div style="border-top: 1px solid #333; margin-top: 8px; padding-top: 4px; font-weight: bold; color: #00ff88;">总计: ¥${total.toFixed(
              1
            )}万</div>`;

            // 在本月模式下添加额外信息
            if (selectedTimeRange === "month") {
              const currentDay = currentDate.getDate();
              const selectedDay = parseInt(
                params[0].axisValue.replace("日", "")
              );
              if (selectedDay === currentDay) {
                result += `<div style="margin-top: 4px; color: #ff6b6b; font-size: 11px;">● 今日收益</div>`;
              } else if (selectedDay > currentDay) {
                result += `<div style="margin-top: 4px; color: #95a5a6; font-size: 11px;">○ 预测收益</div>`;
              }
            }

            return result;
          },
        },
        legend: {
          data: Object.keys(revenueData),
          top: 10,
          right: 20,
          orient: "horizontal",
          textStyle: {
            color: "#e0e0e0",
            fontSize: 12,
            fontWeight: "500",
          },
          itemWidth: 16,
          itemHeight: 12,
          icon: "roundRect",
          itemGap: 25,
        },
        xAxis: {
          type: "category",
          data: months,
          axisLine: {
            lineStyle: { color: "rgba(102, 126, 234, 0.6)" },
          },
          axisLabel: {
            color: "#e0e0e0",
            fontSize: 11,
            interval:
              selectedTimeRange === "month"
                ? months.length > 20
                  ? Math.ceil(months.length / 15)
                  : 1
                : "auto",
            rotate:
              selectedTimeRange === "month" && months.length > 20 ? 45 : 0,
          },
          axisTick: {
            lineStyle: { color: "rgba(102, 126, 234, 0.4)" },
          },
        },
        yAxis: {
          type: "value",
          name: "收益(万元)",
          nameTextStyle: {
            color: "#a0a0a0",
            fontSize: 11,
          },
          axisLine: {
            lineStyle: { color: "rgba(102, 126, 234, 0.6)" },
          },
          axisLabel: {
            color: "#e0e0e0",
            fontSize: 11,
            formatter: "{value}",
          },
          splitLine: {
            lineStyle: {
              color: "rgba(255,255,255,0.08)",
              type: "dashed",
            },
          },
          axisTick: {
            lineStyle: { color: "rgba(102, 126, 234, 0.4)" },
          },
        },
        series: Object.keys(revenueData).map((serviceName, index) => {
          const colors = ["#667eea", "#764ba2", "#11998e", "#fa709a"];

          // 根据图表类型配置不同的样式
          const baseConfig = {
            name: serviceName,
            data: revenueData[serviceName],
            itemStyle: {
              color: colors[index],
              borderWidth: 3,
              borderColor: "#fff",
              shadowColor: colors[index],
              shadowBlur: 8,
            },
            emphasis: {
              itemStyle: {
                borderWidth: 4,
                shadowBlur: 12,
                shadowColor: colors[index],
              },
            },
          };

          if (chartType === "trend") {
            const seriesConfig = {
              ...baseConfig,
              type: "line",
              lineStyle: {
                color: colors[index],
                width: 3,
                shadowColor: colors[index],
                shadowBlur: 6,
                shadowOffsetY: 3,
              },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: colors[index] + "40" },
                    { offset: 1, color: colors[index] + "10" },
                  ],
                },
              },
              smooth: 0.4,
              symbol: "circle",
              symbolSize: 8,
            };

            // 如果是本月模式且是第一个系列，添加分隔线
            if (selectedTimeRange === "month" && index === 0) {
              const currentDay = new Date().getDate();
              seriesConfig.markLine = {
                silent: true,
                lineStyle: {
                  color: "#ff6b6b",
                  type: "dashed",
                  width: 2,
                  opacity: 0.8,
                },
                label: {
                  show: true,
                  position: "insideEndTop",
                  formatter: "今日",
                  color: "#ff6b6b",
                  fontSize: 12,
                  fontWeight: "bold",
                },
                data: [
                  {
                    xAxis: `${currentDay}日`,
                  },
                ],
              };
            }

            return seriesConfig;
          } else {
            // 对比图配置（柱状图）
            return {
              ...baseConfig,
              type: "bar",
              barWidth: "60%",
              itemStyle: {
                ...baseConfig.itemStyle,
                borderRadius: [4, 4, 0, 0],
                shadowBlur: 6,
                shadowOffsetY: 3,
                shadowColor: colors[index] + "50",
              },
            };
          }
        }),
      };

      chart.setOption(option);

      // 添加窗口大小改变时的图表自适应
      const handleResize = () => chart.resize();
      window.addEventListener("resize", handleResize);

      // 清理函数
      return () => {
        window.removeEventListener("resize", handleResize);
        chart.dispose();
      };
    }

    // 性能监控图表
    if (performanceChartRef.current) {
      const chart = echarts.init(performanceChartRef.current);
      const option = {
        backgroundColor: "transparent",
        grid: { top: 30, left: 50, right: 30, bottom: 30 },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#00c6ff",
          textStyle: { color: "#fff" },
        },
        legend: {
          data: ["响应率", "效率"],
          textStyle: { color: "#fff" },
          top: 5,
        },
        xAxis: {
          type: "category",
          data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
          axisLine: { lineStyle: { color: "#667eea" } },
          axisLabel: { color: "#fff" },
        },
        yAxis: {
          type: "value",
          name: "百分比(%)",
          min: 90,
          max: 100,
          axisLine: { lineStyle: { color: "#667eea" } },
          axisLabel: { color: "#fff" },
          splitLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
        },
        series: [
          {
            name: "响应率",
            type: "line",
            data: [98.2, 98.5, 97.8, 99.1, 98.8, 98.3, 98.5],
            lineStyle: { color: "#11998e", width: 3 },
            itemStyle: { color: "#11998e" },
            areaStyle: { color: "rgba(17, 153, 142, 0.2)" },
          },
          {
            name: "效率",
            type: "line",
            data: [96.5, 96.8, 95.9, 97.2, 96.1, 96.4, 96.8],
            lineStyle: { color: "#fa709a", width: 3 },
            itemStyle: { color: "#fa709a" },
            areaStyle: { color: "rgba(247, 112, 154, 0.2)" },
          },
        ],
      };
      chart.setOption(option);
    }
  };

  // 渲染概览页面
  const renderOverview = () => (
    <div className="overview-container">
      {/* 顶部统计卡片 */}
      <div className="top-stats">
        <div className="stat-card total-capacity">
          <div className="stat-icon">🏭</div>
          <div className="stat-content">
            <div className="stat-value">{realTimeData.totalCapacity} MW</div>
            <div className="stat-label">总装机容量</div>
            <div className="stat-change">+2.5%</div>
          </div>
        </div>
        <div className="stat-card active-capacity">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">
              {realTimeData.activeCapacity.toFixed(0)} MW
            </div>
            <div className="stat-label">活跃容量</div>
            <div className="stat-change">+1.8%</div>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">
              ¥{(realTimeData.revenue / 10000).toFixed(1)}万
            </div>
            <div className="stat-label">总收益</div>
            <div className="stat-change">+12.3%</div>
          </div>
        </div>
        <div className="stat-card efficiency">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">
              {realTimeData.efficiency.toFixed(1)}%
            </div>
            <div className="stat-label">运行效率</div>
            <div className="stat-change">+0.5%</div>
          </div>
        </div>
      </div>

      {/* 服务状态网格 */}
      <div className="services-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className="service-card"
            style={{ "--service-color": service.color }}
            onClick={() => {
              setCurrentView(service.id);
              setSelectedSubModule(null);
            }}
          >
            <div className="service-header">
              <div className="service-icon">{service.icon}</div>
              <div className="service-status">
                <span
                  className={`status-dot ${
                    service.status === "运行中" ? "active" : "inactive"
                  }`}
                ></span>
                <span className="status-text">{service.status}</span>
              </div>
            </div>
            <div className="service-content">
              <h3 className="service-title">{service.name}</h3>
              <p className="service-description">{service.description}</p>
              <div className="service-metrics">
                <div className="metric">
                  <span className="metric-label">容量</span>
                  <span className="metric-value">{service.capacity} MW</span>
                </div>
                <div className="metric">
                  <span className="metric-label">活跃</span>
                  <span className="metric-value">{service.active} MW</span>
                </div>
                <div className="metric">
                  <span className="metric-label">收益</span>
                  <span className="metric-value">
                    ¥{(service.revenue / 10000).toFixed(1)}万
                  </span>
                </div>
              </div>
              <div className="capacity-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(service.active / service.capacity) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {((service.active / service.capacity) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="service-action">
              <button className="detail-btn">
                查看详情 <span className="arrow">→</span>
              </button>
            </div>
          </div>
        ))}
        {/* 新增：积分账户入口卡片，显示在服务图片卡片后面 */}
        <div
          className="service-card"
          style={{ "--service-color": "#00b894" }}
          onClick={() => setSelectedSubModule("pointsAccount")}
        >
          <div className="service-header">
            <div className="service-icon">💳</div>
            <div className="service-status">
              <span className="status-dot active"></span>
              <span className="status-text">可用</span>
            </div>
          </div>
          <div className="service-content">
            <h3 className="service-title">积分账户</h3>
            <p className="service-description">查看与管理账户积分、兑换和记录</p>
            <div className="service-metrics">
              <div className="metric">
                <span className="metric-label">总积分</span>
                <span className="metric-value">{pointsAccount.totalPoints}</span>
              </div>
              <div className="metric">
                <span className="metric-label">可用积分</span>
                <span className="metric-value">{pointsAccount.availablePoints}</span>
              </div>
              <div className="metric">
                <span className="metric-label">等级</span>
                <span className="metric-value">{pointsAccount.tier}</span>
              </div>
            </div>
            <div className="capacity-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      (pointsAccount.totalPoints / pointsAccount.nextTierThreshold) * 100,
                      100
                    ).toFixed(1)}%`,
                  }}
                ></div>
              </div>
              <span className="progress-text">
                {Math.min(
                  (pointsAccount.totalPoints / pointsAccount.nextTierThreshold) * 100,
                  100
                ).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="service-action">
            <button className="detail-btn">
              查看积分 <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="charts-section">
        {/* <div className="chart-card">
          <h3>服务容量分布</h3>
          <div ref={serviceDistributionRef} className="chart-container"></div>
        </div> */}
        <div className="revenue-chart-section">
          <div className="chart-main-header">
            <div className="chart-title-group">
              <h2>📊 收益趋势分析</h2>
              <p className="chart-subtitle">
                各项辅助服务收益走势与占比分析 -
                {selectedTimeRange === "6months" && "近6个月数据展示"}
                {selectedTimeRange === "year" && "全年数据展示"}
                {selectedTimeRange === "quarter" && "本季度数据展示"}
                {selectedTimeRange === "month" &&
                  "本月每日收益详情 (红线后为预测数据)"}
                {chartType === "trend" ? " (趋势图)" : " (对比图)"}
              </p>
            </div>
            <div className="chart-controls">
              <div className="time-selector-group">
                <label>时间范围：</label>
                <select
                  className="time-range-selector"
                  value={selectedTimeRange}
                  onChange={handleTimeRangeChange}
                >
                  <option value="6months">近6个月</option>
                  <option value="year">近一年</option>
                  {/* <option value="quarter">本季度</option> */}
                  <option value="month">本月</option>
                </select>
              </div>
              <div className="chart-type-selector">
                <button
                  className={`chart-type-btn ${
                    chartType === "trend" ? "active" : ""
                  }`}
                  onClick={() => setChartType("trend")}
                >
                  趋势图
                </button>
                <button
                  className={`chart-type-btn ${
                    chartType === "compare" ? "active" : ""
                  }`}
                  onClick={() => setChartType("compare")}
                >
                  对比图
                </button>
              </div>
            </div>
          </div>

          <div className="chart-main-container">
            <div
              ref={revenueChartRef}
              className="chart-container enhanced"
            ></div>
          </div>

          <div className="chart-summary">
            {/* <div className="summary-insights">
              <h4>📈 关键洞察</h4>
              <ul className="insights-list">
                <li><span className="insight-point">调峰服务</span>表现优异，收益占比最高达38.0%</li>
                <li><span className="insight-point">调频服务</span>稳定增长，月增长率达12.3%</li>
                <li><span className="insight-point">无功补偿</span>潜力较大，可进一步优化</li>
                <li><span className="insight-point">整体趋势</span>向好，预计下月收益将突破90万</li>
              </ul>
            </div> */}
            {/* <div className="service-performance">
              <h4>🏆 服务排名</h4>
              <div className="performance-ranking">
                <div className="rank-item rank-1">
                  <span className="rank-number">1</span>
                  <div className="rank-info">
                    <span className="service-name">调峰服务</span>
                    <span className="service-revenue">¥32.6万</span>
                  </div>
                  <span className="rank-change up">↗</span>
                </div>
                <div className="rank-item rank-2">
                  <span className="rank-number">2</span>
                  <div className="rank-info">
                    <span className="service-name">调频服务</span>
                    <span className="service-revenue">¥28.5万</span>
                  </div>
                  <span className="rank-change up">↗</span>
                </div>
                <div className="rank-item rank-3">
                  <span className="rank-number">3</span>
                  <div className="rank-info">
                    <span className="service-name">无功补偿</span>
                    <span className="service-revenue">¥12.6万</span>
                  </div>
                  <span className="rank-change stable">→</span>
                </div>
                <div className="rank-item rank-4">
                  <span className="rank-number">4</span>
                  <div className="rank-info">
                    <span className="service-name">电压调节</span>
                    <span className="service-revenue">¥11.9万</span>
                  </div>
                  <span className="rank-change up">↗</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
        {/* <div className="chart-card full-width">
          <h3>系统性能监控</h3>
          <div ref={performanceChartRef} className="chart-container"></div>
        </div> */}
      </div>
    </div>
  );

  // 渲染调频服务详情
  const renderFrequencyDetail = () => (
    <div className="service-detail frequency-compact">
      <div className="detail-header compact">
        <button className="back-btn" onClick={() => {
          setCurrentView("overview");
          setSelectedSubModule(null);
        }}>
          ← 返回概览
        </button>
        <div className="detail-title-section compact">
          <h2>📈 调频服务详情</h2>
          <div className="detail-subtitle">
            <span className="frequency-badge">电网频率稳定性维护</span>
            <span className="update-time">
              实时更新 • {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="header-controls">
          {/* 已移除积分账户入口，不在调频服务子模块显示 */}
        </div>
      </div>

      <div className="detail-content compact">
        {/* 主体布局 - 左右分栏 */}
        <div className="frequency-main-layout">
          {/* 左侧区域 */}
          <div className="frequency-left-section">
            {/* 核心指标概览 - 紧凑版 */}
            <div className="detail-overview compact">
              <div className="overview-section-title compact">
                <h3>📊 核心监控指标</h3>
                <div className="section-status">
                  <span className="status-light active"></span>
                  <span>实时监控中</span>
                </div>
              </div>
              <div className="overview-cards compact">
                <div className="overview-card primary enhanced compact">
                  <div className="card-background-glow"></div>
                  <div className="card-header compact">
                    <span className="card-icon pulsing">⚡</span>
                    <div className="card-info">
                      <span className="card-title">当前频率</span>
                      <div className="card-value">
                        {frequencyDetail.currentFrequency.toFixed(3)} Hz
                      </div>
                    </div>
                    <div className="trend-indicator up">↗</div>
                  </div>
                  <div className="card-status-section compact">
                    <div
                      className={`card-status ${
                        Math.abs(frequencyDetail.deviation) <= 0.05
                          ? "normal"
                          : "warning"
                      }`}
                    >
                      偏差: {frequencyDetail.deviation > 0 ? "+" : ""}
                      {frequencyDetail.deviation.toFixed(3)} Hz
                    </div>
                  </div>
                </div>

                <div className="overview-card enhanced compact">
                  <div className="card-header compact">
                    <span className="card-icon">⚡</span>
                    <div className="card-info">
                      <span className="card-title">响应时间</span>
                      <div className="card-value">
                        {frequencyDetail.responseTime} s
                      </div>
                    </div>
                    <div className="performance-badge excellent">优秀</div>
                  </div>
                  <div className="progress-mini">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          100 - (frequencyDetail.responseTime / 2) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="overview-card enhanced compact">
                  <div className="card-header compact">
                    <span className="card-icon">🎯</span>
                    <div className="card-info">
                      <span className="card-title">调频精度</span>
                      <div className="card-value">
                        {frequencyDetail.accuracy}%
                      </div>
                    </div>
                    <div className="achievement-star">⭐</div>
                  </div>
                  <div className="accuracy-bar">
                    <div
                      className="accuracy-fill"
                      style={{ width: `${frequencyDetail.accuracy}%` }}
                    ></div>
                  </div>
                </div>

                <div className="overview-card enhanced compact">
                  <div className="card-header compact">
                    <span className="card-icon">⏰</span>
                    <div className="card-info">
                      <span className="card-title">系统可用率</span>
                      <div className="card-value">
                        {frequencyDetail.availability}%
                      </div>
                    </div>
                    <div className="uptime-indicator online"></div>
                  </div>
                  <div className="uptime-chart compact">
                    {[...Array(15)].map((_, i) => (
                      <div
                        key={i}
                        className={`uptime-bar ${
                          Math.random() > 0.05 ? "up" : "down"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 24小时频率波动趋势 - 压缩版 */}
            <div className="frequency-trend-section compact">
              <div className="section-header compact">
                <h3>📈 24小时频率趋势</h3>
                <div className="trend-legend compact">
                  <span className="legend-item">
                    <span className="legend-dot frequency"></span>频率
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot response"></span>响应
                  </span>
                </div>
              </div>
              <div className="frequency-chart-container compact">
                <div className="chart-grid-lines">
                  {[50.05, 50.0, 49.95].map((value) => (
                    <div
                      key={value}
                      className="grid-line"
                      style={{ bottom: `${((value - 49.9) / 0.2) * 100}%` }}
                    >
                      <span className="grid-label">{value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="frequency-chart compact">
                  {frequencyDetail.hourlyData
                    .slice(0, 12)
                    .map((data, index) => {
                      const freqHeight = ((data.frequency - 49.9) / 0.2) * 100;
                      const responseHeight = (data.response / 200) * 100;
                      return (
                        <div key={index} className="chart-point-group">
                          <div className="chart-time-label">{data.time}</div>
                          <div className="chart-bars">
                            <div
                              className="frequency-bar"
                              style={{ height: `${freqHeight}%` }}
                              title={`${data.time}: ${data.frequency} Hz`}
                            ></div>
                            <div
                              className="response-bar"
                              style={{ height: `${responseHeight}%` }}
                              title={`${data.time}: ${data.response} MW`}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧区域 */}
          <div className="frequency-right-section">
            {/* 调频资源状态 - 紧凑版 */}
            <div className="regulation-resources compact">
              <div className="section-header compact">
                <h3>🔧 三级调频资源</h3>
                <div className="resource-summary compact">
                  <span className="total-capacity">
                    总容量:{" "}
                    {Object.values(frequencyDetail.regulation).reduce(
                      (sum, item) => sum + item.capacity,
                      0
                    )}{" "}
                    MW
                  </span>
                </div>
              </div>
              <div className="regulation-grid compact">
                {Object.entries(frequencyDetail.regulation).map(
                  ([key, data], index) => {
                    const utilizationRate =
                      (data.current / data.capacity) * 100;
                    const regulationTypes = {
                      primary: {
                        name: "一次调频",
                        icon: "🚀",
                        description: "机组自动响应",
                        color: "#667eea",
                      },
                      secondary: {
                        name: "二次调频",
                        icon: "🎛️",
                        description: "AGC控制",
                        color: "#764ba2",
                      },
                      tertiary: {
                        name: "三次调频",
                        icon: "👨‍💼",
                        description: "人工调度",
                        color: "#11998e",
                      },
                    };
                    const typeInfo = regulationTypes[key];

                    return (
                      <div
                        key={key}
                        className="regulation-card enhanced compact"
                      >
                        <div className="regulation-header compact">
                          <div className="regulation-title-group">
                            <span className="regulation-icon">
                              {typeInfo.icon}
                            </span>
                            <div className="regulation-title-text">
                              <span className="regulation-type">
                                {typeInfo.name}
                              </span>
                              <span className="regulation-description">
                                {typeInfo.description}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`regulation-status compact ${
                              data.status === "正常" ? "normal" : "error"
                            }`}
                          >
                            <span className="status-dot"></span>
                            {data.status}
                          </span>
                        </div>

                        <div className="regulation-metrics compact">
                          <div className="metrics-row">
                            <div className="metric-item compact">
                              <span className="metric-label">总容量</span>
                              <span className="metric-value">
                                {data.capacity} MW
                              </span>
                            </div>
                            <div className="metric-item compact">
                              <span className="metric-label">当前出力</span>
                              <span className="metric-value">
                                {data.current} MW
                              </span>
                            </div>
                            <div className="metric-item compact">
                              <span className="metric-label">效率</span>
                              <span className="metric-value">
                                {data.efficiency}%
                              </span>
                            </div>
                          </div>

                          <div className="capacity-visualization compact">
                            <div className="capacity-header">
                              <span>利用率: {utilizationRate.toFixed(1)}%</span>
                            </div>
                            <div className="capacity-bar-container">
                              <div className="capacity-bar">
                                <div
                                  className="capacity-fill"
                                  style={{
                                    width: `${utilizationRate}%`,
                                    backgroundColor: typeInfo.color,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          <div className="regulation-stats compact">
                            <div className="stat-pill compact">
                              <span className="stat-label">响应</span>
                              <span className="stat-value">
                                {key === "primary"
                                  ? "<1s"
                                  : key === "secondary"
                                  ? "<15s"
                                  : "<5min"}
                              </span>
                            </div>
                            <div className="stat-pill compact">
                              <span className="stat-label">精度</span>
                              <span className="stat-value">
                                ±
                                {key === "primary"
                                  ? "0.1"
                                  : key === "secondary"
                                  ? "0.05"
                                  : "0.01"}
                                Hz
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* 运行状态统计 - 紧凑版 */}
            <div className="operation-statistics compact">
              <div className="section-header compact">
                <h3>📋 运行统计</h3>
                <span className="statistics-period">本月数据</span>
              </div>
              <div className="statistics-grid compact">
                <div className="stat-card compact">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <div className="stat-value">1,247</div>
                    <div className="stat-label">调频指令次数</div>
                    <div className="stat-trend positive">+8.5%</div>
                  </div>
                </div>
                <div className="stat-card compact">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-content">
                    <div className="stat-value">0.85s</div>
                    <div className="stat-label">平均响应时间</div>
                    <div className="stat-trend positive">-12.3%</div>
                  </div>
                </div>
                <div className="stat-card compact">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-value">¥28.5万</div>
                    <div className="stat-label">调频收益</div>
                    <div className="stat-trend positive">+15.8%</div>
                  </div>
                </div>
                <div className="stat-card compact">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-content">
                    <div className="stat-value">98.7%</div>
                    <div className="stat-label">考核通过率</div>
                    <div className="stat-trend positive">+2.1%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 初始化调峰服务图表
  const initPeakCharts = () => {
    // 负荷曲线图表
    if (peakLoadChartRef.current) {
      const chart = echarts.init(peakLoadChartRef.current, "dark");
      const option = {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#667eea",
          textStyle: { color: "#fff" },
        },
        legend: {
          data: ["实际负荷", "预测负荷", "调峰目标"],
          textStyle: { color: "#fff" },
        },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category",
          data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
          axisLabel: { color: "#fff" },
          axisLine: { lineStyle: { color: "#667eea" } },
        },
        yAxis: {
          type: "value",
          name: "负荷(MW)",
          axisLabel: { color: "#fff" },
          axisLine: { lineStyle: { color: "#667eea" } },
          splitLine: { lineStyle: { color: "rgba(102, 126, 234, 0.2)" } },
        },
        series: [
          {
            name: "实际负荷",
            type: "line",
            data: peakDetail.hourlyLoad,
            smooth: true,
            lineStyle: { color: "#ff6b6b", width: 3 },
            areaStyle: { color: "rgba(255, 107, 107, 0.1)" },
          },
          {
            name: "预测负荷",
            type: "line",
            data: peakDetail.hourlyPrediction,
            smooth: true,
            lineStyle: { color: "#4ecdc4", width: 2, type: "dashed" },
          },
          {
            name: "调峰目标",
            type: "line",
            data: Array(24).fill(1800),
            lineStyle: { color: "#ffd93d", width: 2 },
          },
        ],
      };
      chart.setOption(option);
    }

    // 设备效率雷达图
    if (peakEfficiencyChartRef.current) {
      const chart = echarts.init(peakEfficiencyChartRef.current, "dark");
      const option = {
        backgroundColor: "transparent",
        tooltip: { trigger: "item" },
        radar: {
          indicator: [
            { name: "响应速度", max: 100 },
            { name: "运行效率", max: 100 },
            { name: "设备健康", max: 100 },
            { name: "经济性", max: 100 },
            { name: "可靠性", max: 100 },
            { name: "环保性", max: 100 },
          ],
          center: ["50%", "50%"],
          radius: "70%",
          axisLine: { lineStyle: { color: "#667eea" } },
          splitLine: { lineStyle: { color: "rgba(102, 126, 234, 0.3)" } },
          axisLabel: { color: "#fff" },
        },
        series: [
          {
            type: "radar",
            data: peakDetail.participation.map((device) => ({
              value: [
                100 - device.responseTime * 10,
                device.efficiency,
                device.health,
                85,
                90,
                device.type === "battery"
                  ? 95
                  : device.type === "gas"
                  ? 70
                  : 85,
              ],
              name: device.device,
              areaStyle: { opacity: 0.2 },
            })),
          },
        ],
      };
      chart.setOption(option);
    }

    // 收益分析图表
    if (peakRevenueChartRef.current) {
      const chart = echarts.init(peakRevenueChartRef.current, "dark");
      const option = {
        backgroundColor: "transparent",
        tooltip: { trigger: "axis" },
        legend: {
          data: ["日收益", "累计收益", "目标收益"],
          textStyle: { color: "#fff" },
        },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category",
          data: ["1日", "5日", "10日", "15日", "20日", "25日", "30日"],
          axisLabel: { color: "#fff" },
          axisLine: { lineStyle: { color: "#667eea" } },
        },
        yAxis: [
          {
            type: "value",
            name: "收益(万元)",
            axisLabel: { color: "#fff" },
            axisLine: { lineStyle: { color: "#667eea" } },
            splitLine: { lineStyle: { color: "rgba(102, 126, 234, 0.2)" } },
          },
        ],
        series: [
          {
            name: "日收益",
            type: "bar",
            data: [1.2, 1.5, 1.8, 1.3, 1.6, 1.4, 1.7],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#667eea" },
                { offset: 1, color: "#764ba2" },
              ]),
            },
          },
          {
            name: "累计收益",
            type: "line",
            data: [1.2, 2.7, 4.5, 5.8, 7.4, 8.8, 10.5],
            smooth: true,
            lineStyle: { color: "#4ecdc4", width: 3 },
          },
          {
            name: "目标收益",
            type: "line",
            data: [1.0, 2.5, 4.2, 5.5, 7.0, 8.5, 10.0],
            lineStyle: { color: "#ffd93d", width: 2, type: "dashed" },
          },
        ],
      };
      chart.setOption(option);
    }
  };

  // 渲染调峰服务详情
  const renderPeakDetail = () => (
    <div className="service-detail peak-shaving advanced">
      {/* 高级头部 */}
      <div className="detail-header advanced">
        <div className="header-left">
          <button
            className="back-btn modern"
            onClick={() => {
              setCurrentView("overview");
              setSelectedSubModule(null);
            }}
          >
            <span className="back-icon">←</span>
            <span>返回概览</span>
          </button>
          <div className="header-title">
            <h2>⛰️ 智能调峰服务中心</h2>
            <div className="header-subtitle">
              <span className="status-badge active">实时运行</span>
              <span className="update-time">
                最后更新: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        <div className="header-controls">
          <button className="control-btn">
            <span className="btn-icon">📊</span>
            <span>导出报告</span>
          </button>
          <button className="control-btn">
            <span className="btn-icon">⚙️</span>
            <span>调度设置</span>
          </button>
          <button 
            className="control-btn primary"
            onClick={() => setSelectedSubModule("pointsAccount")}
          >
            <span className="btn-icon">💰</span>
            <span>积分账户</span>
          </button>
        </div>
      </div>

      <div className="detail-content advanced">
        {/* 核心指标卡片 */}
        {/* <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-header">
              <span className="metric-icon">📈</span>
              <div className="metric-info">
                <span className="metric-title">当前负荷</span>
                <span className="metric-subtitle">实时监控</span>
              </div>
            </div>
            <div className="metric-value">{peakDetail.currentLoad} MW</div>
            <div className="metric-trend positive">
              <span className="trend-icon">↗</span>
              <span>+2.3% vs 昨日</span>
            </div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{width: `${(peakDetail.currentLoad / peakDetail.peakLoad) * 100}%`}}
                ></div>
              </div>
              <span className="progress-text">峰值负荷: {peakDetail.peakLoad} MW</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🔧</span>
              <div className="metric-info">
                <span className="metric-title">调峰容量</span>
                <span className="metric-subtitle">可调用资源</span>
              </div>
            </div>
            <div className="metric-value">{peakDetail.peakShaving.available} MW</div>
            <div className="metric-details">
              <div className="detail-item">
                <span className="detail-label">已调用:</span>
                <span className="detail-value">{peakDetail.peakShaving.dispatched} MW</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">预留:</span>
                <span className="detail-value">{peakDetail.peakShaving.reserved} MW</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">利用率:</span>
                <span className="detail-value">{peakDetail.peakShaving.utilizationRate}%</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">⚡</span>
              <div className="metric-info">
                <span className="metric-title">系统效率</span>
                <span className="metric-subtitle">综合性能</span>
              </div>
            </div>
            <div className="metric-value">{peakDetail.peakShaving.efficiency}%</div>
            <div className="metric-details">
              <div className="detail-item">
                <span className="detail-label">响应时间:</span>
                <span className="detail-value">{peakDetail.peakShaving.responseTime}s</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">填谷率:</span>
                <span className="detail-value">{peakDetail.loadFillRate}%</span>
              </div>
            </div>
          </div>

          <div className="metric-card revenue">
            <div className="metric-header">
              <span className="metric-icon">💰</span>
              <div className="metric-info">
                <span className="metric-title">经济效益</span>
                <span className="metric-subtitle">收益分析</span>
              </div>
            </div>
            <div className="metric-value">¥{(peakDetail.economicBenefit / 10000).toFixed(1)}万</div>
            <div className="metric-details">
              <div className="detail-item">
                <span className="detail-label">日收益:</span>
                <span className="detail-value">¥{(peakDetail.dailyRevenue / 1000).toFixed(1)}K</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">月目标:</span>
                <span className="detail-value">¥{(peakDetail.monthlyTarget / 10000).toFixed(0)}万</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">完成率:</span>
                <span className="detail-value">{((peakDetail.economicBenefit / peakDetail.monthlyTarget) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* 图表区域 */}
        {/* <div className="charts-section">
          <div className="chart-row">
            <div className="chart-card large">
              <div className="chart-header">
                <h3>📈 24小时负荷曲线</h3>
                <div className="chart-controls">
                  <button className="chart-btn active">实时</button>
                  <button className="chart-btn">预测</button>
                  <button className="chart-btn">历史</button>
                </div>
              </div>
              <div className="chart-container" ref={peakLoadChartRef}></div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>🎯 设备性能雷达</h3>
              </div>
              <div className="chart-container" ref={peakEfficiencyChartRef}></div>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3>💰 收益分析</h3>
              </div>
              <div className="chart-container" ref={peakRevenueChartRef}></div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>📊 市场价格</h3>
              </div>
              <div className="price-display">
                <div className="current-price">
                  <span className="price-label">当前电价</span>
                  <span className="price-value">¥{peakDetail.marketPrices.current}/MWh</span>
                </div>
                <div className="price-range">
                  <div className="price-item peak">
                    <span className="price-type">峰时</span>
                    <span className="price-val">¥{peakDetail.marketPrices.peak}</span>
                  </div>
                  <div className="price-item valley">
                    <span className="price-type">谷时</span>
                    <span className="price-val">¥{peakDetail.marketPrices.valley}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* 设备详情表格 */}
        <div className="devices-section">
          <div className="section-header">
            <h3>🔧 参与调峰设备</h3>
            <div className="section-controls">
              <button className="filter-btn active">全部</button>
              <button className="filter-btn">运行中</button>
              <button className="filter-btn">待机</button>
            </div>
          </div>

          <div className="devices-grid">
            {peakDetail.participation.map((device, index) => (
              <div key={index} className={`device-card ${device.type}`}>
                <div className="device-header">
                  <div className="device-info">
                    <span className="device-name">{device.device}</span>
                    <span className="device-location">{device.location}</span>
                  </div>
                  <div
                    className={`device-status ${
                      device.status === "运行" ? "active" : "standby"
                    }`}
                  >
                    {device.status}
                  </div>
                </div>

                <div className="device-metrics">
                  <div className="metric-row">
                    <div className="metric">
                      <span className="metric-label">容量</span>
                      <span className="metric-value">{device.capacity} MW</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">已调用</span>
                      <span className="metric-value">
                        {device.dispatched} MW
                      </span>
                    </div>
                  </div>

                  <div className="metric-row">
                    <div className="metric">
                      <span className="metric-label">效率</span>
                      <span className="metric-value">{device.efficiency}%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">健康度</span>
                      <span className="metric-value">{device.health}%</span>
                    </div>
                  </div>

                  <div className="metric-row">
                    <div className="metric">
                      <span className="metric-label">响应时间</span>
                      <span className="metric-value">
                        {device.responseTime}s
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">收益</span>
                      <span className="metric-value">
                        ¥{(device.revenue / 10000).toFixed(1)}万
                      </span>
                    </div>
                  </div>
                </div>

                {/* 设备特定信息 */}
                <div className="device-specific">
                  {device.type === "battery" && (
                    <div className="battery-info">
                      <div className="info-item">
                        <span className="info-label">SOC:</span>
                        <span className="info-value">{device.soc}%</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">温度:</span>
                        <span className="info-value">
                          {device.temperature}°C
                        </span>
                      </div>
                    </div>
                  )}

                  {device.type === "gas" && (
                    <div className="gas-info">
                      <div className="info-item">
                        <span className="info-label">燃料:</span>
                        <span className="info-value">{device.fuelLevel}%</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">排放:</span>
                        <span className="info-value">
                          {device.emissions} t/h
                        </span>
                      </div>
                    </div>
                  )}

                  {(device.type === "load" || device.type === "industrial") && (
                    <div className="load-info">
                      <div className="info-item">
                        <span className="info-label">参与用户:</span>
                        <span className="info-value">
                          {device.participants}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">合规率:</span>
                        <span className="info-value">{device.compliance}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 调峰事件记录 */}
        <div className="events-section">
          <div className="section-header">
            <h3>📋 今日调峰事件</h3>
            <div className="event-summary">
              <span className="event-count">
                共 {peakDetail.peakEvents.length} 次调峰
              </span>
              <span className="total-savings">
                节省成本 ¥
                {peakDetail.peakEvents
                  .reduce((sum, event) => sum + event.savings, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>

          <div className="events-timeline">
            {peakDetail.peakEvents.map((event, index) => (
              <div key={event.id} className={`event-item ${event.severity}`}>
                <div className="event-time">{event.time}</div>
                <div className="event-content">
                  <div className="event-header">
                    <span className="event-type">{event.type}</span>
                    <span className={`event-severity ${event.severity}`}>
                      {event.severity === "high"
                        ? "高"
                        : event.severity === "medium"
                        ? "中"
                        : "低"}
                    </span>
                  </div>
                  <div className="event-details">
                    <div className="event-response">{event.response}</div>
                    <div className="event-result">{event.result}</div>
                  </div>
                  <div className="event-savings">
                    节省: ¥{event.savings.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 智能建议 */}
        <div className="recommendations-section">
          <div className="section-header">
            <h3>💡 智能优化建议</h3>
            <div className="recommendations-filter">
              <button className="filter-btn active">全部</button>
              <button className="filter-btn">高优先级</button>
              <button className="filter-btn">可立即执行</button>
            </div>
          </div>

          <div className="recommendations-grid">
            {peakDetail.recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className={`recommendation-card ${rec.priority}`}
              >
                <div className="rec-header">
                  <div className="rec-type">
                    <span className={`type-icon ${rec.type}`}>
                      {rec.type === "optimization"
                        ? "⚡"
                        : rec.type === "maintenance"
                        ? "🔧"
                        : "📈"}
                    </span>
                    <span className="type-name">
                      {rec.type === "optimization"
                        ? "优化建议"
                        : rec.type === "maintenance"
                        ? "维护建议"
                        : "扩容建议"}
                    </span>
                  </div>
                  <span className={`priority-badge ${rec.priority}`}>
                    {rec.priority === "high"
                      ? "高优先级"
                      : rec.priority === "medium"
                      ? "中优先级"
                      : "低优先级"}
                  </span>
                </div>

                <div className="rec-content">
                  <h4 className="rec-title">{rec.title}</h4>
                  <p className="rec-description">{rec.description}</p>
                  <div className="rec-benefit">{rec.expectedBenefit}</div>
                </div>

                <div className="rec-footer">
                  <div className="rec-meta">
                    <span className="implementation">{rec.implementation}</span>
                    <span className={`risk-level ${rec.risk}`}>
                      风险:{" "}
                      {rec.risk === "low"
                        ? "低"
                        : rec.risk === "medium"
                        ? "中"
                        : "高"}
                    </span>
                  </div>
                  <button className="execute-btn">
                    {rec.implementation === "立即执行"
                      ? "立即执行"
                      : "制定计划"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染积分账户详情
  const renderPointsAccount = () => (
    <div className="service-detail points-account advanced">
      {/* 头部 */}
      <div className="detail-header advanced">
        <div className="header-left">
          <button
            className="back-btn modern"
            onClick={() => setSelectedSubModule(null)}
          >
            <span className="back-icon">←</span>
            <span>返回</span>
          </button>
          <div className="header-title">
            <h2>💳 积分账户中心</h2>
            <div className="header-subtitle">
              <span className="status-badge active">运行良好</span>
              <span className="update-time">最后更新: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        <div className="header-controls">
          {/* 虚拟电厂选择器 */}
          <select
            className="control-select"
            value={pointsAccount.selectedPlantId}
            onChange={(e) => {
              const pid = e.target.value;
              const plant = pointsAccount.plants.find(p => p.id === pid);
              if (plant) {
                setPointsAccount(prev => ({
                  ...prev,
                  selectedPlantId: pid,
                }));
              }
            }}
          >
            {pointsAccount.plants.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button className="control-btn">
            <span className="btn-icon">📊</span>
            <span>导出报告</span>
          </button>
          <button className="control-btn primary">
            <span className="btn-icon">⚙️</span>
            <span>账户设置</span>
          </button>
        </div>
      </div>

      <div className="detail-content advanced">
        <div className="detail-grid">
          {/* 账户概览 + 能碳账户建设 */}
          <div className="detail-card large">
            <h4>账户概览</h4>
            <div className="overview-stats">
              <div className="stat-item">
                <span className="stat-label">总积分</span>
                <span className="stat-value">{(pointsAccount.plants.find(p=>p.id===pointsAccount.selectedPlantId)?.totalPoints||0).toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">可用积分</span>
                <span className="stat-value">{(pointsAccount.plants.find(p=>p.id===pointsAccount.selectedPlantId)?.availablePoints||0).toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">本月获得</span>
                <span className="stat-value">{(pointsAccount.plants.find(p=>p.id===pointsAccount.selectedPlantId)?.monthlyGained||0).toLocaleString()}</span>
              </div>
            </div>

            <div className="level-section">
              <h5>会员等级</h5>
              <div className="level-row">
                <div className="level-badge">{(pointsAccount.plants.find(p=>p.id===pointsAccount.selectedPlantId)?.tier)||"-"}</div>
                <div className="level-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(() => {
                          const p = pointsAccount.plants.find(p=>p.id===pointsAccount.selectedPlantId);
                          if (!p) return 0;
                          return Math.min((p.totalPoints / p.nextTierThreshold) * 100, 100).toFixed(1);
                        })()}%`,
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {(() => {
                      const p = pointsAccount.plants.find(p=>p.id===pointsAccount.selectedPlantId);
                      if (!p) return "距离下一等级：0% / -";
                      const pct = Math.min((p.totalPoints / p.nextTierThreshold) * 100, 100).toFixed(1);
                      return `距离下一等级：${pct}% / ${p.nextTierThreshold}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <div className="devices-section">
              <h5>能碳账户建设</h5>
              <div className="devices-list">
                <div className="device-pill">碳减排累计：1,280 tCO₂e</div>
                <div className="device-pill">绿色电力参与：8,650 MWh</div>
                <div className="device-pill">能效提升指数：+12.5%</div>
                <div className="device-pill">绿色认证：能源之星 ★★</div>
              </div>
            </div>
          </div>

          {/* 激励机制设置 */}
          <div className="detail-card">
            <h4>激励机制设置</h4>
            <ul className="event-list">
              <li className="event-item">
                <div className="event-icon">🎯</div>
                <div className="event-content">
                  <div className="event-title">参与调峰奖励（基础×1.0）</div>
                  <div className="event-meta">每成功参与一场活动：+800 积分</div>
                </div>
                <div className="event-actions"><button className="control-btn">配置</button></div>
              </li>
              <li className="event-item">
                <div className="event-icon">⚡</div>
                <div className="event-content">
                  <div className="event-title">快速响应奖励（系数×1.2）</div>
                  <div className="event-meta">响应时间≤1s：+200 积分</div>
                </div>
                <div className="event-actions"><button className="control-btn">配置</button></div>
              </li>
              <li className="event-item">
                <div className="event-icon">🌱</div>
                <div className="event-content">
                  <div className="event-title">绿色日双倍积分（活动）</div>
                  <div className="event-meta">指定日期内积分收益×2</div>
                </div>
                <div className="event-actions"><button className="control-btn">配置</button></div>
              </li>
            </ul>
          </div>

          {/* 数据分析与策略优化 */}
          <div className="detail-card">
            <h4>数据分析与策略优化</h4>
            <div className="overview-stats">
              <div className="stat-item">
                <span className="stat-label">响应合规率</span>
                <span className="stat-value">98.2%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">积分增长率</span>
                <span className="stat-value">+6.4% / 月</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">活跃活动数</span>
                <span className="stat-value">12 场/月</span>
              </div>
            </div>
            <ul className="recommend-list">
              <li>下周参与 2 场削峰活动，预计新增积分 ≈ 1,600</li>
              <li>提高储能参与比例至 60%，预计积分增长 +8%</li>
              <li>每周至少 1 次绿色电力日参与，维持双倍收益</li>
            </ul>
            <div className="actions">
              <button className="control-btn primary">
                <span className="btn-icon">↗</span>
                <span>执行优化策略</span>
              </button>
            </div>
          </div>

          {/* 积分规则 */}
          <div className="detail-card">
            <h4>积分规则</h4>
            <ul className="recommend-list">
              <li>常规负荷调节：按调节量与合规率给予基础积分</li>
              <li>新能源消纳配合：按消纳电量与波动抑制效果给予积分加成</li>
              <li>专项响应任务：按任务类型、响应速度与完成度给予阶梯积分</li>
              <li>附加系数：响应速度、合规率、能效指标作为加成（×0.8~×1.5）</li>
            </ul>
          </div>

          {/* 积分列表 */}
          <div className="detail-card">
            <h4>积分列表</h4>
            <div className="table compact">
              <div className="table-header">
                <span>日期</span>
                <span>描述</span>
                <span>类型</span>
                <span>积分</span>
              </div>
              <div className="table-body">
                {(pointsAccount.plants.find(p=>p.id===pointsAccount.selectedPlantId)?.recentTransactions||[]).map((tx, idx) => (
                  <div key={idx} className="table-row">
                    <span>{tx.date}</span>
                    <span>{tx.description}</span>
                    <span>{tx.type === "income" ? "获得" : "兑换/扣减"}</span>
                    <span style={{ color: tx.points >= 0 ? "#00ff88" : "#ff6b6b" }}>
                      {tx.points > 0 ? `+${tx.points.toLocaleString()}` : tx.points.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="actions">
              <button className="control-btn primary">
                <span className="btn-icon">💱</span>
                <span>积分兑换</span>
              </button>
              <button className="control-btn">
                <span className="btn-icon">➕</span>
                <span>去赚积分</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染无功补偿详情
  const renderReactiveDetail = () => (
    <div className="service-detail reactive-compensation compact">
      <div className="detail-header compact">
        <button className="back-btn" onClick={() => setCurrentView("overview")}>
          ← 返回概览
        </button>
        <div className="detail-title-section compact">
          <h2>⚡ 无功补偿详情</h2>
          <div className="detail-subtitle compact">
            <span className="reactive-badge">电网功率因数优化</span>
            <span className="update-time">
              实时更新 • {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-content compact">
        {/* 核心指标概览 - 紧凑版 */}
        <div className="compensation-overview compact">
          <div className="overview-cards compact">
            <div className="overview-card primary compact">
              <div className="card-header compact">
                <span className="card-icon pulsing">⚡</span>
                <div className="card-info">
                  <span className="card-title">功率因数</span>
                  <div className="card-value">0.952</div>
                </div>
                <div className="trend-indicator up">↗</div>
              </div>
              <div className="card-status-section compact">
                <div className="card-status warning">偏差: -0.028</div>
                <div className="progress-mini">
                  <div
                    className="progress-fill"
                    style={{ width: "97.3%", backgroundColor: "#ff9800" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="overview-card compact">
              <div className="card-header compact">
                <span className="card-icon">🔄</span>
                <div className="card-info">
                  <span className="card-title">无功功率</span>
                  <div className="card-value">245 Mvar</div>
                </div>
                <div className="performance-badge">补偿中</div>
              </div>
              <div className="power-flow-compact">容性补偿→注入</div>
            </div>

            <div className="overview-card compact">
              <div className="card-header compact">
                <span className="card-icon">📊</span>
                <div className="card-info">
                  <span className="card-title">电压稳定性</span>
                  <div className="card-value">99.1%</div>
                </div>
                <div className="achievement-star">⭐</div>
              </div>
              <div className="stability-meter compact">
                <div className="meter-fill" style={{ width: "99.1%" }}></div>
              </div>
            </div>

            <div className="overview-card compact">
              <div className="card-header compact">
                <span className="card-icon">⚙️</span>
                <div className="card-info">
                  <span className="card-title">设备可用率</span>
                  <div className="card-value">95.8%</div>
                </div>
                <div className="uptime-indicator online"></div>
              </div>
              <div className="device-status-chart compact">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`device-dot ${i < 11 ? "online" : "offline"}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 主体布局 - 紧凑三栏设计 */}
        <div className="reactive-main-layout compact">
          {/* 左侧区域 - 实时趋势 */}
          <div className="reactive-left-section compact">
            {/* 功率因数趋势 - 压缩版 */}
            <div className="power-waveform-section compact">
              <div className="section-header compact">
                <h3>📈 实时趋势</h3>
                <div className="time-range">2h</div>
              </div>
              <div className="waveform-container compact">
                <div className="waveform-chart compact">
                  {[
                    { time: "14:00", pf: 0.945 },
                    { time: "14:30", pf: 0.951 },
                    { time: "15:00", pf: 0.948 },
                    { time: "15:30", pf: 0.952 },
                    { time: "16:00", pf: 0.955 },
                  ].map((point, index) => {
                    const height = ((point.pf - 0.92) / 0.08) * 100;
                    return (
                      <div key={index} className="waveform-point compact">
                        <div
                          className="pf-bar compact"
                          style={{ height: `${height}%` }}
                          title={`${point.time}: ${point.pf}`}
                        ></div>
                        <div className="time-label compact">
                          {point.time.slice(-2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="target-line compact">目标0.98</div>
              </div>
            </div>

            {/* 智能策略 - 紧凑版 */}
            <div className="compensation-strategy compact">
              <div className="section-header compact">
                <h3>🎯 智能策略</h3>
                <div className="auto-mode-indicator compact">
                  <span className="mode-dot active"></span>
                  <span>自动</span>
                </div>
              </div>
              <div className="strategy-content compact">
                <div className="load-analysis compact">
                  <div className="load-item">
                    <span>感性: 78%</span>
                    <div className="load-bar compact">
                      <div
                        className="load-fill inductive"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="load-item">
                    <span>容性: 22%</span>
                    <div className="load-bar compact">
                      <div
                        className="load-fill capacitive"
                        style={{ width: "22%" }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="adjustment-queue compact">
                  <div className="adjustment-item compact">
                    <span className="adj-device">电容器组2</span>
                    <span className="adj-action">+50</span>
                    <span className="adj-status executing">执行中</span>
                  </div>
                  <div className="adjustment-item compact">
                    <span className="adj-device">SVC装置</span>
                    <span className="adj-action">+30</span>
                    <span className="adj-status queued">队列中</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 中间区域 - 设备监控 */}
          <div className="reactive-middle-section compact">
            <div className="compensation-devices compact">
              <div className="section-header compact">
                <h3>🔧 设备监控</h3>
                <div className="device-summary compact">
                  <span>530/425 Mvar</span>
                </div>
              </div>
              <div className="devices-grid compact">
                {[
                  {
                    name: "电容器组1",
                    type: "固定",
                    capacity: 100,
                    current: 100,
                    status: "运行",
                    temp: 45,
                    efficiency: 98.5,
                  },
                  {
                    name: "电容器组2",
                    type: "投切",
                    capacity: 150,
                    current: 125,
                    status: "运行",
                    temp: 42,
                    efficiency: 97.8,
                  },
                  {
                    name: "电抗器组",
                    type: "限流",
                    capacity: 80,
                    current: 0,
                    status: "待机",
                    temp: 38,
                    efficiency: 96.2,
                  },
                  {
                    name: "SVC补偿器",
                    type: "动态",
                    capacity: 200,
                    current: 180,
                    status: "运行",
                    temp: 48,
                    efficiency: 99.1,
                  },
                  {
                    name: "SVG发生器",
                    type: "无功",
                    capacity: 120,
                    current: 20,
                    status: "运行",
                    temp: 35,
                    efficiency: 98.9,
                  },
                  {
                    name: "TSC投切",
                    type: "快速",
                    capacity: 80,
                    current: 0,
                    status: "故障",
                    temp: 25,
                    efficiency: 0,
                  },
                ].map((device, index) => {
                  const utilizationRate =
                    device.capacity > 0
                      ? (device.current / device.capacity) * 100
                      : 0;
                  return (
                    <div key={index} className="device-card compact">
                      <div className="device-header compact">
                        <div className="device-info compact">
                          <span className="device-name compact">
                            {device.name}
                          </span>
                          <span className="device-type compact">
                            {device.type}
                          </span>
                        </div>
                        <span
                          className={`device-status compact ${
                            device.status === "运行"
                              ? "running"
                              : device.status === "待机"
                              ? "standby"
                              : "fault"
                          }`}
                        >
                          {device.status}
                        </span>
                      </div>

                      <div className="device-metrics compact">
                        <div className="metric-row compact">
                          <span className="metric-compact">
                            ⚡{device.capacity}
                          </span>
                          <span className="metric-compact">
                            🔄{device.current}
                          </span>
                          <span
                            className={`temp-compact ${
                              device.temp < 50
                                ? "normal"
                                : device.temp < 70
                                ? "warning"
                                : "danger"
                            }`}
                          >
                            🌡️{device.temp}°
                          </span>
                        </div>

                        <div className="utilization-compact">
                          <span>
                            利用率: {utilizationRate.toFixed(1)}% | 效率:{" "}
                            {device.efficiency}%
                          </span>
                          <div className="util-bar compact">
                            <div
                              className="util-fill"
                              style={{
                                width: `${utilizationRate}%`,
                                backgroundColor:
                                  device.status === "运行"
                                    ? "#00c6ff"
                                    : device.status === "待机"
                                    ? "#95a5a6"
                                    : "#e74c3c",
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 右侧区域 - 经济分析 */}
          <div className="reactive-right-section compact">
            <div className="economic-analysis compact">
              <div className="section-header compact">
                <h3>💰 经济分析</h3>
                <div className="analysis-period compact">本月</div>
              </div>

              {/* 收益指标 */}
              <div className="economic-metrics compact">
                <div className="economic-card compact">
                  <div className="eco-icon compact">💡</div>
                  <div className="eco-content compact">
                    <div className="eco-value">¥12.6万</div>
                    <div className="eco-label">补偿收益</div>
                    <div className="eco-trend positive">+8.3%</div>
                  </div>
                </div>
                <div className="economic-card compact">
                  <div className="eco-icon compact">📉</div>
                  <div className="eco-content compact">
                    <div className="eco-value">¥3.8万</div>
                    <div className="eco-label">损耗减少</div>
                    <div className="eco-trend positive">+12.1%</div>
                  </div>
                </div>
                <div className="economic-card compact">
                  <div className="eco-icon compact">⚡</div>
                  <div className="eco-content compact">
                    <div className="eco-value">156 MWh</div>
                    <div className="eco-label">减少网损</div>
                    <div className="eco-trend positive">+5.7%</div>
                  </div>
                </div>
                <div className="economic-card compact">
                  <div className="eco-icon compact">🏆</div>
                  <div className="eco-content compact">
                    <div className="eco-value">98.3%</div>
                    <div className="eco-label">考核达标</div>
                    <div className="eco-trend positive">+2.1%</div>
                  </div>
                </div>
              </div>

              {/* 投资回报 */}
              <div className="roi-analysis compact">
                <h4>投资回报</h4>
                <div className="roi-metrics compact">
                  <div className="roi-item compact">
                    <span className="roi-label">投资成本:</span>
                    <span className="roi-value">¥285万</span>
                  </div>
                  <div className="roi-item compact">
                    <span className="roi-label">年化收益:</span>
                    <span className="roi-value">¥156万</span>
                  </div>
                  <div className="roi-item compact">
                    <span className="roi-label">回收期:</span>
                    <span className="roi-value highlight">1.8年</span>
                  </div>
                  <div className="roi-item compact">
                    <span className="roi-label">回报率:</span>
                    <span className="roi-value highlight">54.7%</span>
                  </div>
                </div>
              </div>

              {/* 运行统计 */}
              <div className="operation-stats compact">
                <h4>运行统计</h4>
                <div className="stats-grid compact">
                  <div className="stat-item compact">
                    <div className="stat-icon compact">🎯</div>
                    <div className="stat-content compact">
                      <div className="stat-value compact">1,247次</div>
                      <div className="stat-label compact">调节指令</div>
                    </div>
                  </div>
                  <div className="stat-item compact">
                    <div className="stat-icon compact">⚡</div>
                    <div className="stat-content compact">
                      <div className="stat-value compact">0.85s</div>
                      <div className="stat-label compact">响应时间</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 电压调节详细数据
  const [voltageDetail] = useState({
    systemVoltage: {
      current: 220.5,
      target: 220.0,
      deviation: 0.23,
      quality: 98.8,
      efficiency: 95.2,
      stability: 99.1,
    },
    voltageNodes: [
      {
        id: "N001",
        name: "邢台主变站",
        voltage: 220.3,
        target: 220.0,
        status: "normal",
        load: 85.6,
        location: "桥东区",
        type: "main",
        equipment: ["主变压器1", "主变压器2", "无功补偿器"],
      },
      {
        id: "N002",
        name: "经开区变电站",
        voltage: 219.8,
        target: 220.0,
        status: "warning",
        load: 92.3,
        location: "经济开发区",
        type: "sub",
        equipment: ["配电变压器", "电容器组"],
      },
      {
        id: "N003",
        name: "宁晋工业站",
        voltage: 220.7,
        target: 220.0,
        status: "normal",
        load: 78.9,
        location: "宁晋县",
        type: "industrial",
        equipment: ["工业变压器", "SVC装置"],
      },
      {
        id: "N004",
        name: "清河分布站",
        voltage: 219.5,
        target: 220.0,
        status: "alert",
        load: 95.1,
        location: "清河县",
        type: "distributed",
        equipment: ["分布式变压器", "智能调压器"],
      },
    ],
    regulationMethods: [
      {
        id: 1,
        name: "有载调压变压器",
        icon: "🔄",
        capacity: 500,
        current: 220,
        efficiency: 95.2,
        unit: "MVA",
        status: "active",
        responseTime: 2.5,
        adjustmentRange: "±10%",
        location: "邢台主变站",
        health: 96.8,
        lastMaintenance: "2024-01-15",
        operationCount: 1250,
      },
      {
        id: 2,
        name: "静止无功补偿器",
        icon: "⚡",
        capacity: 300,
        current: 180,
        efficiency: 97.8,
        unit: "Mvar",
        status: "active",
        responseTime: 0.1,
        adjustmentRange: "±150Mvar",
        location: "经开区变电站",
        health: 98.5,
        lastMaintenance: "2024-02-20",
        operationCount: 8960,
      },
      {
        id: 3,
        name: "同步发电机调压",
        icon: "🔋",
        capacity: 400,
        current: 350,
        efficiency: 92.6,
        unit: "MW",
        status: "standby",
        responseTime: 5.0,
        adjustmentRange: "±50MW",
        location: "宁晋工业站",
        health: 94.2,
        lastMaintenance: "2024-01-28",
        operationCount: 560,
      },
      {
        id: 4,
        name: "智能电容器组",
        icon: "🔌",
        capacity: 150,
        current: 120,
        efficiency: 96.5,
        unit: "Mvar",
        status: "active",
        responseTime: 1.0,
        adjustmentRange: "±75Mvar",
        location: "清河分布站",
        health: 97.3,
        lastMaintenance: "2024-02-10",
        operationCount: 3420,
      },
    ],
    voltageHistory: {
      hourly: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        voltage:
          220 +
          Math.sin((i * Math.PI) / 12) * 0.5 +
          (Math.random() - 0.5) * 0.3,
        target: 220,
        quality: 98 + Math.random() * 2,
      })),
      realtime: Array.from({ length: 60 }, (_, i) => ({
        time: i,
        voltage:
          220.5 +
          Math.sin((i * Math.PI) / 30) * 0.2 +
          (Math.random() - 0.5) * 0.1,
      })),
    },
    alarms: [
      {
        id: 1,
        time: "14:25",
        type: "电压偏差",
        severity: "warning",
        node: "经开区变电站",
        message: "电压偏差超过±1%阈值",
        action: "自动投入无功补偿",
        status: "resolved",
      },
      {
        id: 2,
        time: "12:10",
        type: "设备异常",
        severity: "info",
        node: "清河分布站",
        message: "智能调压器响应时间延长",
        action: "切换备用设备",
        status: "monitoring",
      },
    ],
    recommendations: [
      {
        id: 1,
        type: "optimization",
        priority: "high",
        title: "无功补偿器容量优化",
        description: "建议在经开区变电站增加50Mvar无功补偿容量",
        expectedBenefit: "提升电压稳定性15%，减少损耗8%",
        implementation: "计划实施",
        cost: "120万元",
        payback: "18个月",
      },
      {
        id: 2,
        type: "maintenance",
        priority: "medium",
        title: "有载调压变压器维护",
        description: "主变压器调压开关操作次数接近维护周期",
        expectedBenefit: "延长设备寿命，提高可靠性",
        implementation: "下月安排",
        cost: "25万元",
        payback: "预防性维护",
      },
      {
        id: 3,
        type: "upgrade",
        priority: "low",
        title: "智能调压系统升级",
        description: "升级为AI驱动的自适应电压调节系统",
        expectedBenefit: "响应速度提升50%，精度提升30%",
        implementation: "长期规划",
        cost: "300万元",
        payback: "3年",
      },
    ],
  });

  // 电压调节图表引用
  const voltageWaveChartRef = useRef(null);
  const voltageNodesChartRef = useRef(null);
  const voltageQualityChartRef = useRef(null);
  const voltageHistoryChartRef = useRef(null);

  // 控制模式状态
  const [controlMode, setControlMode] = useState("auto"); // 'auto', 'manual', 'maintenance'

  // 弹窗状态
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  // 优化建议数据
  const optimizationSuggestions = {
    sensitivity: {
      title: "调节灵敏度优化建议",
      current: 7,
      recommended: 8,
      benefits: [
        "提高系统响应速度15%",
        "减少电压波动幅度20%",
        "优化负荷跟踪精度",
      ],
      risks: ["可能增加设备操作频率", "需要更精确的监控"],
      impact: "中等",
      savings: "预计年节省成本 ¥12万",
    },
    speed: {
      title: "响应速度优化建议",
      current: 8,
      recommended: 9,
      benefits: [
        "缩短调节响应时间30%",
        "提高电能质量稳定性",
        "减少负荷冲击影响",
      ],
      risks: ["可能导致过调节", "增加系统能耗"],
      impact: "高",
      savings: "预计年节省成本 ¥18万",
    },
    prediction: {
      title: "预测性调节优化建议",
      current: "已启用",
      recommended: "增强模式",
      benefits: ["提前预测负荷变化", "减少被动调节次数40%", "优化设备使用寿命"],
      risks: ["依赖历史数据准确性", "需要定期模型更新"],
      impact: "高",
      savings: "预计年节省成本 ¥25万",
    },
  };

  // 处理策略点击
  const handleStrategyClick = (strategyType) => {
    setSelectedStrategy(optimizationSuggestions[strategyType]);
    setShowOptimizationModal(true);
  };

  // 关闭弹窗
  const closeOptimizationModal = () => {
    setShowOptimizationModal(false);
    setSelectedStrategy(null);
  };

  // 应用优化建议
  const applyOptimization = () => {
    // 这里可以添加应用优化的逻辑
    console.log("应用优化建议:", selectedStrategy);
    closeOptimizationModal();
    // 可以添加成功提示
  };

  // 根据控制模式渲染不同的控制面板
  const renderControlPanels = () => {
    switch (controlMode) {
      case "auto":
        return renderAutoModeControls();
      case "manual":
        return renderManualModeControls();
      case "maintenance":
        return renderMaintenanceModeControls();
      default:
        return renderAutoModeControls();
    }
  };

  // 自动模式控制面板
  const renderAutoModeControls = () => (
    <>
      {/* 目标电压设置 */}
      <div className="control-panel primary">
        <div className="panel-header">
          <span className="panel-icon">🎯</span>
          <div className="panel-info">
            <span className="panel-title">目标电压设置</span>
            <span className="panel-subtitle">系统电压调节目标</span>
          </div>
        </div>

        <div className="voltage-setter">
          <div className="voltage-input-group">
            <label className="voltage-label">目标电压 (kV)</label>
            <div className="voltage-input-container">
              <button className="voltage-btn decrease">-</button>
              <input
                type="number"
                className="voltage-input"
                value="220.0"
                min="215"
                max="225"
                step="0.1"
              />
              <button className="voltage-btn increase">+</button>
            </div>
          </div>

          <div className="voltage-range-display">
            <div className="range-item">
              <span className="range-label">允许范围:</span>
              <span className="range-value">219.5 - 220.5 kV</span>
            </div>
            <div className="range-item">
              <span className="range-label">当前偏差:</span>
              <span className="range-value deviation">+0.23 kV</span>
            </div>
          </div>

          <div className="voltage-actions">
            <button className="action-btn primary">应用设置</button>
            <button className="action-btn secondary">重置默认</button>
          </div>
        </div>
      </div>

      {/* 自动调节策略 */}
      <div className="control-panel">
        <div className="panel-header">
          <span className="panel-icon">🤖</span>
          <div className="panel-info">
            <span className="panel-title">自动调节策略</span>
            <span className="panel-subtitle">智能调节参数配置</span>
          </div>
        </div>

        <div className="strategy-settings">
          <div
            className="setting-group clickable"
            onClick={() => handleStrategyClick("sensitivity")}
          >
            <label className="setting-label">
              调节灵敏度
              <span className="optimization-hint">💡 点击查看优化建议</span>
            </label>
            <div className="slider-container">
              <input
                type="range"
                className="setting-slider"
                min="1"
                max="10"
                defaultValue="7"
              />
              <div className="slider-labels">
                <span>保守</span>
                <span>激进</span>
              </div>
            </div>
          </div>

          <div
            className="setting-group clickable"
            onClick={() => handleStrategyClick("speed")}
          >
            <label className="setting-label">
              响应速度
              <span className="optimization-hint">💡 点击查看优化建议</span>
            </label>
            <div className="slider-container">
              <input
                type="range"
                className="setting-slider"
                min="1"
                max="10"
                defaultValue="8"
              />
              <div className="slider-labels">
                <span>慢速</span>
                <span>快速</span>
              </div>
            </div>
          </div>

          <div className="setting-toggles">
            <div
              className="toggle-item clickable"
              onClick={() => handleStrategyClick("prediction")}
            >
              <label className="toggle-label">
                预测性调节
                <span className="optimization-hint">💡 点击查看优化建议</span>
              </label>
              <div className="toggle-switch active">
                <div className="toggle-slider"></div>
              </div>
            </div>
            <div className="toggle-item">
              <label className="toggle-label">负荷跟踪</label>
              <div className="toggle-switch active">
                <div className="toggle-slider"></div>
              </div>
            </div>
            <div className="toggle-item">
              <label className="toggle-label">经济优化</label>
              <div className="toggle-switch">
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI智能分析 */}
      <div className="control-panel">
        <div className="panel-header">
          <span className="panel-icon">🧠</span>
          <div className="panel-info">
            <span className="panel-title">AI智能分析</span>
            <span className="panel-subtitle">机器学习优化建议</span>
          </div>
        </div>

        <div className="ai-analysis">
          <div className="analysis-item">
            <div className="analysis-header">
              <span className="analysis-icon">📊</span>
              <span className="analysis-title">负荷预测</span>
            </div>
            <div className="analysis-content">
              <div className="prediction-value">预测准确率: 94.2%</div>
              <div className="prediction-trend">未来2小时负荷将上升15%</div>
            </div>
          </div>

          <div className="analysis-item">
            <div className="analysis-header">
              <span className="analysis-icon">⚡</span>
              <span className="analysis-title">电压优化</span>
            </div>
            <div className="analysis-content">
              <div className="optimization-suggestion">
                建议提前调节变压器档位
              </div>
              <div className="optimization-benefit">预计节省成本8%</div>
            </div>
          </div>

          <div className="ai-actions">
            <button className="ai-btn primary">启用AI建议</button>
            <button className="ai-btn secondary">查看详情</button>
          </div>
        </div>
      </div>
    </>
  );

  // 手动模式控制面板
  const renderManualModeControls = () => (
    <>
      {/* 设备手动控制 */}
      <div className="control-panel primary">
        <div className="panel-header">
          <span className="panel-icon">🎮</span>
          <div className="panel-info">
            <span className="panel-title">设备手动控制</span>
            <span className="panel-subtitle">直接控制调节设备</span>
          </div>
        </div>

        <div className="manual-controls">
          <div className="device-control-item">
            <div className="device-control-header">
              <span className="device-control-name">有载调压变压器</span>
              <span className="device-control-status active">运行中</span>
            </div>
            <div className="device-control-body">
              <div className="control-slider-group">
                <label>
                  调压档位: <span className="current-value">+3</span>
                </label>
                <input
                  type="range"
                  className="device-slider"
                  min="-10"
                  max="10"
                  defaultValue="3"
                />
                <div className="slider-range">
                  <span>-10</span>
                  <span>0</span>
                  <span>+10</span>
                </div>
              </div>
              <div className="control-buttons">
                <button className="control-btn">自动</button>
                <button className="control-btn active">手动</button>
              </div>
            </div>
          </div>

          <div className="device-control-item">
            <div className="device-control-header">
              <span className="device-control-name">无功补偿器</span>
              <span className="device-control-status active">运行中</span>
            </div>
            <div className="device-control-body">
              <div className="control-slider-group">
                <label>
                  补偿容量: <span className="current-value">180 Mvar</span>
                </label>
                <input
                  type="range"
                  className="device-slider"
                  min="0"
                  max="300"
                  defaultValue="180"
                />
                <div className="slider-range">
                  <span>0</span>
                  <span>150</span>
                  <span>300</span>
                </div>
              </div>
              <div className="control-buttons">
                <button className="control-btn active">投入</button>
                <button className="control-btn">切除</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 精确调节 */}
      <div className="control-panel">
        <div className="panel-header">
          <span className="panel-icon">🎯</span>
          <div className="panel-info">
            <span className="panel-title">精确调节</span>
            <span className="panel-subtitle">数值精确控制</span>
          </div>
        </div>

        <div className="precise-controls">
          <div className="precise-item">
            <label className="precise-label">目标电压 (kV)</label>
            <div className="precise-input-group">
              <input
                type="number"
                className="precise-input"
                defaultValue="220.0"
                step="0.01"
              />
              <button className="precise-btn">设置</button>
            </div>
          </div>

          <div className="precise-item">
            <label className="precise-label">无功功率 (Mvar)</label>
            <div className="precise-input-group">
              <input
                type="number"
                className="precise-input"
                defaultValue="180"
                step="1"
              />
              <button className="precise-btn">设置</button>
            </div>
          </div>

          <div className="precise-item">
            <label className="precise-label">功率因数</label>
            <div className="precise-input-group">
              <input
                type="number"
                className="precise-input"
                defaultValue="0.95"
                step="0.01"
                min="0"
                max="1"
              />
              <button className="precise-btn">设置</button>
            </div>
          </div>

          <div className="manual-actions">
            <button className="manual-btn primary">应用所有设置</button>
            <button className="manual-btn secondary">恢复自动</button>
          </div>
        </div>
      </div>

      {/* 实时监控 */}
      <div className="control-panel">
        <div className="panel-header">
          <span className="panel-icon">📊</span>
          <div className="panel-info">
            <span className="panel-title">实时监控</span>
            <span className="panel-subtitle">设备状态监控</span>
          </div>
        </div>

        <div className="realtime-monitor">
          <div className="monitor-item">
            <div className="monitor-label">系统电压</div>
            <div className="monitor-value">220.5 kV</div>
            <div className="monitor-status normal">正常</div>
          </div>

          <div className="monitor-item">
            <div className="monitor-label">负荷电流</div>
            <div className="monitor-value">1250 A</div>
            <div className="monitor-status normal">正常</div>
          </div>

          <div className="monitor-item">
            <div className="monitor-label">功率因数</div>
            <div className="monitor-value">0.95</div>
            <div className="monitor-status good">优秀</div>
          </div>

          <div className="monitor-actions">
            <button className="monitor-btn">刷新数据</button>
            <button className="monitor-btn">导出日志</button>
          </div>
        </div>
      </div>
    </>
  );

  // 维护模式控制面板
  const renderMaintenanceModeControls = () => (
    <>
      {/* 设备维护状态 */}
      <div className="control-panel primary">
        <div className="panel-header">
          <span className="panel-icon">🔧</span>
          <div className="panel-info">
            <span className="panel-title">设备维护状态</span>
            <span className="panel-subtitle">设备检修和维护管理</span>
          </div>
        </div>

        <div className="maintenance-status">
          <div className="maintenance-item">
            <div className="maintenance-header">
              <span className="maintenance-name">有载调压变压器</span>
              <span className="maintenance-status-badge normal">正常运行</span>
            </div>
            <div className="maintenance-details">
              <div className="detail-row">
                <span className="detail-label">上次维护:</span>
                <span className="detail-value">2024-01-15</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">下次维护:</span>
                <span className="detail-value">2024-07-15</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">运行时间:</span>
                <span className="detail-value">2580 小时</span>
              </div>
            </div>
            <div className="maintenance-actions">
              <button className="maintenance-btn">计划维护</button>
              <button className="maintenance-btn">停机检修</button>
            </div>
          </div>

          <div className="maintenance-item">
            <div className="maintenance-header">
              <span className="maintenance-name">无功补偿器</span>
              <span className="maintenance-status-badge warning">需要关注</span>
            </div>
            <div className="maintenance-details">
              <div className="detail-row">
                <span className="detail-label">上次维护:</span>
                <span className="detail-value">2024-02-20</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">下次维护:</span>
                <span className="detail-value">2024-08-20</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">操作次数:</span>
                <span className="detail-value">8960 次</span>
              </div>
            </div>
            <div className="maintenance-actions">
              <button className="maintenance-btn primary">立即维护</button>
              <button className="maintenance-btn">延期维护</button>
            </div>
          </div>
        </div>
      </div>

      {/* 维护计划 */}
      <div className="control-panel">
        <div className="panel-header">
          <span className="panel-icon">📅</span>
          <div className="panel-info">
            <span className="panel-title">维护计划</span>
            <span className="panel-subtitle">设备维护时间安排</span>
          </div>
        </div>

        <div className="maintenance-schedule">
          <div className="schedule-item">
            <div className="schedule-date">2024-03-15</div>
            <div className="schedule-content">
              <div className="schedule-title">变压器年度检修</div>
              <div className="schedule-duration">预计停机: 8小时</div>
            </div>
            <div className="schedule-status pending">待执行</div>
          </div>

          <div className="schedule-item">
            <div className="schedule-date">2024-03-20</div>
            <div className="schedule-content">
              <div className="schedule-title">补偿器电容更换</div>
              <div className="schedule-duration">预计停机: 4小时</div>
            </div>
            <div className="schedule-status pending">待执行</div>
          </div>

          <div className="schedule-actions">
            <button className="schedule-btn">添加计划</button>
            <button className="schedule-btn">修改计划</button>
          </div>
        </div>
      </div>

      {/* 安全检查 */}
      <div className="control-panel">
        <div className="panel-header">
          <span className="panel-icon">🛡️</span>
          <div className="panel-info">
            <span className="panel-title">安全检查</span>
            <span className="panel-subtitle">系统安全状态检查</span>
          </div>
        </div>

        <div className="safety-check">
          <div className="check-item">
            <div className="check-name">绝缘电阻</div>
            <div className="check-value">正常</div>
            <div className="check-status normal">✓</div>
          </div>

          <div className="check-item">
            <div className="check-name">接地电阻</div>
            <div className="check-value">正常</div>
            <div className="check-status normal">✓</div>
          </div>

          <div className="check-item">
            <div className="check-name">保护装置</div>
            <div className="check-value">正常</div>
            <div className="check-status normal">✓</div>
          </div>

          <div className="safety-actions">
            <button className="safety-btn">开始检查</button>
            <button className="safety-btn">生成报告</button>
          </div>
        </div>
      </div>
    </>
  );

  // 初始化电压调节图表
  const initVoltageCharts = () => {
    // 实时电压波形图
    if (voltageWaveChartRef.current) {
      const chart = echarts.init(voltageWaveChartRef.current, "dark");
      const option = {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#667eea",
          textStyle: { color: "#fff" },
        },
        legend: {
          data: ["实时电压", "目标电压", "上限", "下限"],
          textStyle: { color: "#fff" },
        },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category",
          data: voltageDetail.voltageHistory.realtime.map(
            (item) => item.time + "s"
          ),
          axisLabel: { color: "#fff" },
          axisLine: { lineStyle: { color: "#667eea" } },
        },
        yAxis: {
          type: "value",
          name: "电压(kV)",
          min: 219,
          max: 221,
          axisLabel: { color: "#fff" },
          axisLine: { lineStyle: { color: "#667eea" } },
          splitLine: { lineStyle: { color: "rgba(102, 126, 234, 0.2)" } },
        },
        series: [
          {
            name: "实时电压",
            type: "line",
            data: voltageDetail.voltageHistory.realtime.map(
              (item) => item.voltage
            ),
            smooth: true,
            lineStyle: { color: "#00c6ff", width: 3 },
            areaStyle: { color: "rgba(0, 198, 255, 0.1)" },
          },
          {
            name: "目标电压",
            type: "line",
            data: Array(60).fill(220),
            lineStyle: { color: "#4ECDC4", width: 2, type: "dashed" },
          },
          {
            name: "上限",
            type: "line",
            data: Array(60).fill(220.5),
            lineStyle: { color: "#ff6b6b", width: 1, type: "dotted" },
          },
          {
            name: "下限",
            type: "line",
            data: Array(60).fill(219.5),
            lineStyle: { color: "#ff6b6b", width: 1, type: "dotted" },
          },
        ],
      };
      chart.setOption(option);
    }

    // 电压节点分布图
    if (voltageNodesChartRef.current) {
      const chart = echarts.init(voltageNodesChartRef.current, "dark");
      const option = {
        backgroundColor: "transparent",
        tooltip: { trigger: "item" },
        series: [
          {
            type: "scatter",
            symbolSize: function (data) {
              return Math.sqrt(data[2]) * 5;
            },
            data: voltageDetail.voltageNodes.map((node, index) => [
              index,
              node.voltage,
              node.load,
              node.name,
            ]),
            itemStyle: {
              color: function (params) {
                const voltage = params.data[1];
                if (voltage >= 219.5 && voltage <= 220.5) return "#4ECDC4";
                if (voltage >= 219 && voltage <= 221) return "#ffd93d";
                return "#ff6b6b";
              },
            },
          },
        ],
        xAxis: {
          type: "category",
          data: voltageDetail.voltageNodes.map((node) => node.name),
          axisLabel: { color: "#fff", rotate: 45 },
          axisLine: { lineStyle: { color: "#667eea" } },
        },
        yAxis: {
          type: "value",
          name: "电压(kV)",
          min: 219,
          max: 221,
          axisLabel: { color: "#fff" },
          axisLine: { lineStyle: { color: "#667eea" } },
          splitLine: { lineStyle: { color: "rgba(102, 126, 234, 0.2)" } },
        },
        grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true },
      };
      chart.setOption(option);
    }
  };

  // 渲染电压调节详情
  const renderVoltageDetail = () => (
    <div className="service-detail voltage-regulation advanced">
      {/* 高级头部 */}
      <div className="detail-header advanced">
        <div className="header-left">
          <button
            className="back-btn modern"
            onClick={() => setCurrentView("overview")}
          >
            <span className="back-icon">←</span>
            <span>返回概览</span>
          </button>
          <div className="header-title">
            <h2>🔋 智能电压调节中心</h2>
            <div className="header-subtitle">
              <span className="status-badge active">实时监控</span>
              <span className="update-time">
                最后更新: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        <div className="header-controls">
          <button className="control-btn">
            <span className="btn-icon">📊</span>
            <span>电能质量报告</span>
          </button>
          <button className="control-btn primary">
            <span className="btn-icon">⚙️</span>
            <span>调节策略</span>
          </button>
        </div>
      </div>

      <div className="detail-content advanced">
        {/* 图表区域 */}
        <div className="voltage-charts-section">
          <div className="chart-row">
            <div className="chart-card large">
              <div className="chart-header">
                <h3>📊 实时电压波形</h3>
                <div className="chart-controls">
                  <button className="chart-btn active">1分钟</button>
                  <button className="chart-btn ">5分钟</button>
                  <button className="chart-btn ">15分钟</button>
                </div>
              </div>
              <div className="chart-container" ref={voltageWaveChartRef}></div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>🗺️ 电压节点分布</h3>
              </div>
              <div className="chart-container" ref={voltageNodesChartRef}></div>
            </div>
          </div>
        </div>

        {/* 智能调节控制面板 */}
        <div className="voltage-control-section">
          <div className="section-header">
            <h3>🎛️ 智能调节控制</h3>
            <div className="control-mode-switch">
              <button
                className={`mode-btn ${controlMode === "auto" ? "active" : ""}`}
                onClick={() => setControlMode("auto")}
              >
                自动模式
              </button>
              <button
                className={`mode-btn ${
                  controlMode === "manual" ? "active" : ""
                }`}
                onClick={() => setControlMode("manual")}
              >
                手动模式
              </button>
              <button
                className={`mode-btn ${
                  controlMode === "maintenance" ? "active" : ""
                }`}
                onClick={() => setControlMode("maintenance")}
              >
                维护模式
              </button>
            </div>
          </div>

          <div className="control-panels-grid">{renderControlPanels()}</div>
        </div>

        {/* 紧急控制面板 */}
        {/* <div className="emergency-control-section">
          <div className="section-header emergency">
            <h3>🚨 紧急控制</h3>
            <div className="emergency-status">
              <span className="status-indicator normal"></span>
              <span>系统正常</span>
            </div>
          </div>

          <div className="emergency-controls">
            <div className="emergency-card">
              <div className="emergency-header">
                <span className="emergency-icon">⚡</span>
                <span className="emergency-title">电压紧急调节</span>
              </div>
              <div className="emergency-body">
                <p className="emergency-desc">当电压超出安全范围时，立即执行紧急调节</p>
                <div className="emergency-actions">
                  <button className="emergency-btn danger">紧急升压</button>
                  <button className="emergency-btn danger">紧急降压</button>
                </div>
              </div>
            </div>

            <div className="emergency-card">
              <div className="emergency-header">
                <span className="emergency-icon">🛑</span>
                <span className="emergency-title">设备紧急停机</span>
              </div>
              <div className="emergency-body">
                <p className="emergency-desc">紧急情况下停止所有调节设备运行</p>
                <div className="emergency-actions">
                  <button className="emergency-btn danger">全部停机</button>
                  <button className="emergency-btn warning">选择停机</button>
                </div>
              </div>
            </div>

            <div className="emergency-card">
              <div className="emergency-header">
                <span className="emergency-icon">🔄</span>
                <span className="emergency-title">系统重置</span>
              </div>
              <div className="emergency-body">
                <p className="emergency-desc">重置所有调节参数到默认安全值</p>
                <div className="emergency-actions">
                  <button className="emergency-btn warning">软重置</button>
                  <button className="emergency-btn danger">硬重置</button>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* 优化建议 */}
        <div className="voltage-recommendations-section">
          <div className="section-header">
            <h3>💡 优化建议</h3>
            <div className="recommendations-filter">
              <button className="filter-btn active">全部</button>
              <button className="filter-btn">高优先级</button>
              <button className="filter-btn">可实施</button>
            </div>
          </div>

          <div className="voltage-recommendations-grid">
            {voltageDetail.recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className={`voltage-recommendation-card ${rec.priority}`}
              >
                <div className="rec-header">
                  <div className="rec-type">
                    <span className={`type-icon ${rec.type}`}>
                      {rec.type === "optimization"
                        ? "⚡"
                        : rec.type === "maintenance"
                        ? "🔧"
                        : "📈"}
                    </span>
                    <span className="type-name">
                      {rec.type === "optimization"
                        ? "优化建议"
                        : rec.type === "maintenance"
                        ? "维护建议"
                        : "升级建议"}
                    </span>
                  </div>
                  <span className={`priority-badge ${rec.priority}`}>
                    {rec.priority === "high"
                      ? "高优先级"
                      : rec.priority === "medium"
                      ? "中优先级"
                      : "低优先级"}
                  </span>
                </div>

                <div className="rec-content">
                  <h4 className="rec-title">{rec.title}</h4>
                  <p className="rec-description">{rec.description}</p>
                  <div className="rec-benefit">{rec.expectedBenefit}</div>
                </div>

                <div className="rec-economics">
                  <div className="economic-item">
                    <span className="economic-label">投资成本:</span>
                    <span className="economic-value">{rec.cost}</span>
                  </div>
                  <div className="economic-item">
                    <span className="economic-label">回收期:</span>
                    <span className="economic-value">{rec.payback}</span>
                  </div>
                </div>

                <div className="rec-footer">
                  <span className="implementation">{rec.implementation}</span>
                  <button className="implement-btn">
                    {rec.implementation === "计划实施"
                      ? "制定计划"
                      : rec.implementation === "下月安排"
                      ? "安排实施"
                      : "加入规划"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 优化建议弹窗 */}
      {showOptimizationModal && selectedStrategy && (
        <div
          className="optimization-modal-overlay"
          onClick={closeOptimizationModal}
        >
          <div
            className="optimization-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">{selectedStrategy.title}</h3>
              <button className="modal-close" onClick={closeOptimizationModal}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="current-vs-recommended">
                <div className="comparison-item">
                  <div className="comparison-label">当前设置</div>
                  <div className="comparison-value current">
                    {selectedStrategy.current}
                  </div>
                </div>
                <div className="comparison-arrow">→</div>
                <div className="comparison-item">
                  <div className="comparison-label">推荐设置</div>
                  <div className="comparison-value recommended">
                    {selectedStrategy.recommended}
                  </div>
                </div>
              </div>

              <div className="benefits-section">
                <h4 className="section-title">🎯 预期收益</h4>
                <ul className="benefits-list">
                  {selectedStrategy.benefits.map((benefit, index) => (
                    <li key={index} className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="risks-section">
                <h4 className="section-title">⚠️ 注意事项</h4>
                <ul className="risks-list">
                  {selectedStrategy.risks.map((risk, index) => (
                    <li key={index} className="risk-item">
                      <span className="risk-icon">!</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="impact-summary">
                <div className="summary-item">
                  <span className="summary-label">影响程度:</span>
                  <span
                    className={`impact-badge ${selectedStrategy.impact.toLowerCase()}`}
                  >
                    {selectedStrategy.impact}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">经济效益:</span>
                  <span className="savings-value">
                    {selectedStrategy.savings}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn secondary"
                onClick={closeOptimizationModal}
              >
                取消
              </button>
              <button className="modal-btn primary" onClick={applyOptimization}>
                应用优化
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 渲染当前视图
  const renderCurrentView = () => {
    // 如果选中了积分账户子模块，显示积分账户页面
    if (selectedSubModule === "pointsAccount") {
      return renderPointsAccount();
    }
    
    // 否则根据当前视图显示相应的服务详情
    switch (currentView) {
      case "frequency":
        return renderFrequencyDetail();
      case "peak":
        return renderPeakDetail();
      case "reactive":
        return renderReactiveDetail();
      case "voltage":
        return renderVoltageDetail();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="aggregation-control">
      {/* 页面标题 */}
      <div className="page-header">
        <div className="title-section">
          <div className="title-icon-wrapper">
            <div className="title-icon">⚡</div>
          </div>
          <div className="title-content">
            <h1 className="page-title">需求响应 · 辅助服务</h1>
            <p className="page-subtitle">
              智能聚合控制，优化电网稳定性与经济效益
            </p>
          </div>
        </div>
    
      </div>

      <div className="ac-content">{renderCurrentView()}</div>
      
    </div>
  );
};

export default AggregationControl;
