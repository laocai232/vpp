import React, { useState, useEffect } from "react";
import "./style.css";

function formatEnergy(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}GWh`;
  }
  return `${value.toFixed(0)}MWh`;
}


const OperationManagement = () => {
  const [monitoringData, setMonitoringData] = useState({
    totalPower: 2350,
    activePower: 1850,
    voltage: 220.5,
    frequency: 50.02,
  });

  const [scheduleData, setScheduleData] = useState([
    {
      id: 1,
      name: "风电机组1",
      type: "风电",
      capacity: 500,
      current: 450,
      target: 480,
      status: "运行",
    },
    {
      id: 2,
      name: "光伏阵列1",
      type: "光伏",
      capacity: 300,
      current: 280,
      target: 290,
      status: "运行",
    },
    {
      id: 3,
      name: "储能系统1",
      type: "储能",
      capacity: 200,
      current: -50,
      target: -80,
      status: "充电",
    },
    {
      id: 4,
      name: "燃气机组1",
      type: "燃气",
      capacity: 400,
      current: 350,
      target: 380,
      status: "运行",
    },
    {
      id: 5,
      name: "水电机组1",
      type: "水电",
      capacity: 600,
      current: 520,
      target: 550,
      status: "运行",
    },
  ]);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [newTargetValue, setNewTargetValue] = useState("");
  const [newDeviceStatus, setNewDeviceStatus] = useState("");
  const [showExecutionPlan, setShowExecutionPlan] = useState(false);
  const [optimizationPlan, setOptimizationPlan] = useState(null);

  // 收益数据
  const [revenueData, setRevenueData] = useState({
    daily: { revenue: 125600, profit: 36400, efficiency: 72.5 },
    improvement: { revenue: 8.5, efficiency: 12.3, load: 15.2 },
  });

  // 对比数据
  const [comparisonData] = useState({
    before: {
      efficiency: 68,
      utilization: 75,
      loadMatch: 82,
      powerOutput: 2150,
      cost: 45600,
      carbonEmission: 1250,
    },
    after: {
      efficiency: 85,
      utilization: 92,
      loadMatch: 94,
      powerOutput: 2680,
      cost: 38200,
      carbonEmission: 950,
    },
  });

  // 24小时功率对比数据
  const [hourlyComparisonData] = useState({
    hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    beforeData: [
      1200, 1150, 1100, 1080, 1120, 1250, 1450, 1650, 1800, 1950, 2100, 2200,
      2250, 2200, 2150, 2100, 2050, 1950, 1800, 1650, 1500, 1350, 1250, 1200,
    ],
    afterData: [
      1350, 1280, 1220, 1180, 1200, 1380, 1580, 1780, 1950, 2150, 2350, 2450,
      2520, 2480, 2420, 2350, 2280, 2180, 2050, 1880, 1680, 1520, 1400, 1350,
    ],
  });

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setMonitoringData((prev) => ({
        ...prev,
        totalPower: prev.totalPower + (Math.random() - 0.5) * 50,
        activePower: prev.activePower + (Math.random() - 0.5) * 40,
        voltage: prev.voltage + (Math.random() - 0.5) * 1,
        frequency: prev.frequency + (Math.random() - 0.5) * 0.02,
      }));

      setRevenueData((prev) => ({
        ...prev,
        daily: {
          ...prev.daily,
          revenue: prev.daily.revenue + (Math.random() - 0.5) * 1000,
          profit: prev.daily.profit + (Math.random() - 0.5) * 300,
        },
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDeviceUpdate = () => {
    if (selectedDevice && newTargetValue) {
      setScheduleData((prev) =>
        prev.map((device) =>
          device.id === selectedDevice.id
            ? {
                ...device,
                target: parseFloat(newTargetValue),
                status: newDeviceStatus || device.status,
              }
            : device
        )
      );
      setSelectedDevice(null);
      setNewTargetValue("");
      setNewDeviceStatus("");
    }
  };

  const generateSchedule = () => {
    // 生成优化方案数据
    const optimizationPlan = {
      planId: `OPT-${Date.now()}`,
      generateTime: new Date().toLocaleString(),
      optimizationType: "经济优化",
      targetFunction: "最小化运行成本",
      timeHorizon: "24小时",

      // 优化目标
      objectives: {
        costReduction: 15.8, // 成本降低百分比
        efficiencyImprovement: 12.3, // 效率提升百分比
        emissionReduction: 8.5, // 排放减少百分比
        reliabilityIncrease: 5.2, // 可靠性提升百分比
      },

      // 优化前后对比
      comparison: {
        before: {
          totalPower: scheduleData.reduce(
            (sum, device) => sum + device.current,
            0
          ),
          totalCost: 125600, // 元/天
          efficiency: 78.5, // %
          emissions: 45.2, // 吨CO2/天
          reliability: 92.1, // %
        },
        after: {
          totalPower: 0, // 将在下面计算
          totalCost: 105800, // 元/天
          efficiency: 88.2, // %
          emissions: 41.4, // 吨CO2/天
          reliability: 96.8, // %
        },
      },

      // 设备调整方案
      deviceAdjustments: [],

      // 经济效益分析
      economicBenefits: {
        dailySavings: 19800, // 元/天
        monthlySavings: 594000, // 元/月
        yearlySavings: 7128000, // 元/年
        paybackPeriod: 2.3, // 年
        roi: 43.5, // %
      },

      // 风险评估
      riskAssessment: {
        technicalRisk: "低",
        economicRisk: "低",
        environmentalRisk: "极低",
        operationalRisk: "中",
        overallRisk: "低",
      },

      // 实施建议
      recommendations: [
        "优先调整储能设备充放电策略，提高峰谷套利收益",
        "适当降低燃气机组出力，减少高成本发电",
        "充分利用光伏和风电的清洁能源优势",
        "优化负荷分配，提高系统整体运行效率",
        "建议在低负荷时段进行设备维护",
      ],
    };

    // 生成设备调整方案
    const newSchedule = scheduleData.map((device) => {
      let targetPower = device.current;
      let adjustmentReason = "";
      let expectedBenefit = "";

      // 根据设备类型和当前状态生成优化建议
      switch (device.type) {
        case "光伏":
          targetPower = Math.min(
            device.capacity,
            device.current + Math.random() * 30
          );
          adjustmentReason = "充分利用当前光照条件，最大化清洁能源发电";
          expectedBenefit = "降低系统碳排放，减少化石能源依赖";
          break;
        case "风电":
          targetPower = Math.min(
            device.capacity,
            device.current + Math.random() * 40
          );
          adjustmentReason = "根据风速预测，优化风机运行参数";
          expectedBenefit = "提高风能利用率，增加清洁能源占比";
          break;
        case "储能":
          if (Math.random() > 0.5) {
            targetPower = Math.max(0, device.current - Math.random() * 50);
            adjustmentReason = "当前电价较低，建议储能充电";
            expectedBenefit = "峰谷套利，预计收益提升25%";
          } else {
            targetPower = Math.min(
              device.capacity,
              device.current + Math.random() * 60
            );
            adjustmentReason = "当前电价较高，建议储能放电";
            expectedBenefit = "峰谷套利，预计收益提升30%";
          }
          break;
        case "燃气":
          targetPower = Math.max(
            device.capacity * 0.3,
            device.current - Math.random() * 30
          );
          adjustmentReason = "燃气成本较高，建议降低出力";
          expectedBenefit = "降低发电成本，预计节省15%运行费用";
          break;
        case "水电":
          targetPower = Math.min(
            device.capacity,
            device.current + Math.random() * 20
          );
          adjustmentReason = "水电成本低且环保，建议增加出力";
          expectedBenefit = "提高经济效益，减少环境影响";
          break;
        default:
          targetPower = device.current + (Math.random() - 0.5) * 20;
          adjustmentReason = "根据系统负荷需求进行调整";
          expectedBenefit = "优化系统运行效率";
      }

      const powerChange = targetPower - device.current;
      const adjustmentType =
        powerChange > 0
          ? "增加出力"
          : powerChange < 0
          ? "降低出力"
          : "维持现状";

      optimizationPlan.deviceAdjustments.push({
        deviceName: device.name,
        deviceType: device.type,
        currentPower: device.current,
        targetPower: targetPower,
        powerChange: powerChange,
        adjustmentType: adjustmentType,
        adjustmentReason: adjustmentReason,
        expectedBenefit: expectedBenefit,
        priority:
          Math.abs(powerChange) > 50
            ? "高"
            : Math.abs(powerChange) > 20
            ? "中"
            : "低",
        implementationTime: getImplementationTime(device.type),
        costImpact: calculateCostImpact(powerChange, device.type),
      });

      return {
        ...device,
        target: targetPower,
      };
    });

    // 计算优化后总功率
    optimizationPlan.comparison.after.totalPower = newSchedule.reduce(
      (sum, device) => sum + device.target,
      0
    );

    setScheduleData(newSchedule);
    setOptimizationPlan(optimizationPlan);
    setShowExecutionPlan(true);
  };

  // 获取实施时间
  const getImplementationTime = (deviceType) => {
    const timeMap = {
      光伏: "即时生效",
      风电: "1-2分钟",
      储能: "30秒",
      燃气: "5-10分钟",
      水电: "2-5分钟",
    };
    return timeMap[deviceType] || "2-3分钟";
  };

  // 计算成本影响
  const calculateCostImpact = (powerChange, deviceType) => {
    const costMap = {
      光伏: 0.15, // 元/MWh
      风电: 0.18,
      储能: 0.25,
      燃气: 0.65,
      水电: 0.12,
    };
    const cost = costMap[deviceType] || 0.3;
    const dailyImpact = powerChange * cost * 24;
    return dailyImpact > 0
      ? `+${dailyImpact.toFixed(0)}元/天`
      : `${dailyImpact.toFixed(0)}元/天`;
  };

  return (
    <div className="operation-management">
      {/* 页面标题 */}
      <div className="page-header">
        <div className="title-section">
          <div className="title-icon-wrapper">
            <div className="title-icon">🏭</div>
          </div>
          <div className="title-content">
            <h1 className="page-title">虚拟电厂运营调度中心</h1>
            <p className="page-subtitle">
              智能调度优化，提升运营效率与经济效益
            </p>
          </div>
        </div>

      </div>

      <div className="om-content">
        {/* 实时监控面板 */}
        <div className="monitoring-panel">
          <div className="monitoring-cards">
            <div className="monitor-card">
              <div className="card-icon">⚡</div>
              <div className="card-content">
                <div className="card-value">
                  {monitoringData.totalPower.toFixed(0)}
                </div>
                <div className="card-label">总功率(MWh)</div>
              </div>
            </div>
            <div className="monitor-card">
              <div className="card-icon">🔋</div>
              <div className="card-content">
                <div className="card-value">
                  {monitoringData.activePower.toFixed(0)}
                </div>
                <div className="card-label">有功功率(MWh)</div>
              </div>
            </div>
            <div className="monitor-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-value">
                  {monitoringData.voltage.toFixed(1)}
                </div>
                <div className="card-label">电压(V)</div>
              </div>
            </div>
            <div className="monitor-card">
              <div className="card-icon">🎯</div>
              <div className="card-content">
                <div className="card-value">
                  {monitoringData.frequency.toFixed(2)}
                </div>
                <div className="card-label">频率(Hz)</div>
              </div>
            </div>
          </div>
        </div>

        {/* 主功能区域 */}
        <div className="main-functions">
          {/* 调度方案生成区域 */}
          <div className="schedule-section">
            <div className="section-header">
              <h2>⚙️ 调度方案生成</h2>
              <button className="generate-btn" onClick={generateSchedule}>
                🔄 生成优化方案
              </button>
            </div>
            <div className="schedule-content">
              <div className="device-list">
                <table>
                  <thead>
                    <tr>
                      <th>🏭 设备名称</th>
                      <th>⚡ 类型</th>
                      <th>📊 容量(MWh)</th>
                      <th>📈 当前值(MWh)</th>
                      <th>🎯 目标值(MWh)</th>
                      <th>🔄 状态</th>
                      <th>🛠️ 操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleData.map((device) => (
                      <tr key={device.id}>
                        <td>{device.name}</td>
                        <td>
                          <span className={`device-type ${device.type}`}>
                            {device.type}
                          </span>
                        </td>
                        <td>{device.capacity}</td>
                        <td>{device.current}</td>
                        <td>{device.target}</td>
                        <td>
                          <span className={`status ${device.status}`}>
                            {device.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setSelectedDevice(device);
                              setNewTargetValue(device.target.toString());
                              setNewDeviceStatus(device.status);
                            }}
                          >
                            ⚙️ 调整
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 优化方案执行计划 */}
              {showExecutionPlan && optimizationPlan && (
                <div
                  className="optimization-modal-mask"
                  onClick={() => setShowExecutionPlan(false)}
                >
                  <div
                    className="optimization-modal"
                    onClick={(e) => e.stopPropagation()}
                  >

                    <div className="optimization-plan">
                      <div className="plan-header">
                        <div className="plan-title">
                          <h3>🎯 智能优化方案</h3>
                          <div className="plan-meta">
                            <span className="plan-id">
                              方案ID: {optimizationPlan.planId}
                            </span>
                            <span className="plan-time">
                              生成时间: {optimizationPlan.generateTime}
                            </span>
                          </div>
                        </div>
                        <button
                          className="close-plan-btn"
                          onClick={() => setShowExecutionPlan(false)}
                        >
                          ✕
                        </button>
                      </div>

                      {/* 优化目标概览 */}
                      <div className="optimization-overview">
                        <div className="overview-header">
                          <h4>📊 优化效果概览</h4>
                          <div className="optimization-type">
                            <span className="type-badge">
                              {optimizationPlan.optimizationType}
                            </span>
                            <span className="target-function">
                              {optimizationPlan.targetFunction}
                            </span>
                          </div>
                        </div>

                        <div className="objectives-grid">
                          <div className="objective-card cost">
                            <div className="objective-icon">💰</div>
                            <div className="objective-content">
                              <div className="objective-value">
                                -{optimizationPlan.objectives.costReduction}%
                              </div>
                              <div className="objective-label">成本降低</div>
                            </div>
                          </div>
                          <div className="objective-card efficiency">
                            <div className="objective-icon">⚡</div>
                            <div className="objective-content">
                              <div className="objective-value">
                                +{optimizationPlan.objectives.efficiencyImprovement}
                                %
                              </div>
                              <div className="objective-label">效率提升</div>
                            </div>
                          </div>
                          <div className="objective-card emission">
                            <div className="objective-icon">🌱</div>
                            <div className="objective-content">
                              <div className="objective-value">
                                -{optimizationPlan.objectives.emissionReduction}%
                              </div>
                              <div className="objective-label">排放减少</div>
                            </div>
                          </div>
                          <div className="objective-card reliability">
                            <div className="objective-icon">🛡️</div>
                            <div className="objective-content">
                              <div className="objective-value">
                                +{optimizationPlan.objectives.reliabilityIncrease}%
                              </div>
                              <div className="objective-label">可靠性提升</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 设备调整方案 */}
                      <div className="device-adjustments">
                        <h4>🔧 设备调整方案</h4>
                        <div className="adjustments-list">
                          {optimizationPlan.deviceAdjustments.map(
                            (adjustment, index) => (
                              <div
                                key={index}
                                className={`adjustment-card priority-${adjustment.priority.toLowerCase()}`}
                              >
                                <div className="adjustment-header">
                                  <div className="device-info">
                                    <span className="device-name">
                                      {adjustment.deviceName}
                                    </span>
                                    <span
                                      className={`device-type-badge ${adjustment.deviceType}`}
                                    >
                                      {adjustment.deviceType}
                                    </span>
                                    <span
                                      className={`priority-badge priority-${adjustment.priority.toLowerCase()}`}
                                    >
                                      {adjustment.priority}优先级
                                    </span>
                                  </div>
                                  <div className="power-adjustment">
                                    <span className="power-change">
                                      {adjustment.currentPower.toFixed(0)}MWh →{" "}
                                      {adjustment.targetPower.toFixed(0)}MWh
                                    </span>
                                    <span
                                      className={`change-indicator ${
                                        adjustment.powerChange >= 0
                                          ? "increase"
                                          : "decrease"
                                      }`}
                                    >
                                      ({adjustment.powerChange >= 0 ? "+" : ""}
                                      {adjustment.powerChange.toFixed(0)}MWh)
                                    </span>
                                  </div>
                                </div>

                                <div className="adjustment-details">
                                  <div className="adjustment-reason">
                                    <span className="reason-label">调整原因:</span>
                                    <span className="reason-text">
                                      {adjustment.adjustmentReason}
                                    </span>
                                  </div>
                                  <div className="expected-benefit">
                                    <span className="benefit-label">预期效益:</span>
                                    <span className="benefit-text">
                                      {adjustment.expectedBenefit}
                                    </span>
                                  </div>
                                  <div className="adjustment-meta">
                                    <span className="implementation-time">
                                      <span className="meta-icon">⏱️</span>
                                      {adjustment.implementationTime}
                                    </span>
                                    <span className="cost-impact">
                                      <span className="meta-icon">💰</span>
                                      {adjustment.costImpact}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* 经济效益分析 */}
                      <div className="economic-benefits">
                        <h4>💰 经济效益分析</h4>
                        <div className="benefits-grid">
                          <div className="benefit-card">
                            <div className="benefit-icon">📅</div>
                            <div className="benefit-content">
                              <div className="benefit-value">
                                ¥
                                {(
                                  optimizationPlan.economicBenefits.dailySavings /
                                  1000
                                ).toFixed(1)}
                                K
                              </div>
                              <div className="benefit-label">日节省</div>
                            </div>
                          </div>
                          <div className="benefit-card">
                            <div className="benefit-icon">📊</div>
                            <div className="benefit-content">
                              <div className="benefit-value">
                                ¥
                                {(
                                  optimizationPlan.economicBenefits.monthlySavings /
                                  10000
                                ).toFixed(0)}
                                万
                              </div>
                              <div className="benefit-label">月节省</div>
                            </div>
                          </div>
                          <div className="benefit-card">
                            <div className="benefit-icon">📈</div>
                            <div className="benefit-content">
                              <div className="benefit-value">
                                ¥
                                {(
                                  optimizationPlan.economicBenefits.yearlySavings /
                                  10000
                                ).toFixed(0)}
                                万
                              </div>
                              <div className="benefit-label">年节省</div>
                            </div>
                          </div>
                          <div className="benefit-card">
                            <div className="benefit-icon">🎯</div>
                            <div className="benefit-content">
                              <div className="benefit-value">
                                {optimizationPlan.economicBenefits.roi}%
                              </div>
                              <div className="benefit-label">投资回报率</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 实施建议 */}
                      <div className="recommendations">
                        <h4>💡 实施建议</h4>
                        <div className="recommendations-list">
                          {optimizationPlan.recommendations.map(
                            (recommendation, index) => (
                              <div key={index} className="recommendation-item">
                                <span className="recommendation-number">
                                  {index + 1}
                                </span>
                                <span className="recommendation-text">
                                  {recommendation}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* 风险评估 */}
                      <div className="risk-assessment">
                        <h4>⚠️ 风险评估</h4>
                        <div className="risk-grid">
                          <div className="risk-item">
                            <span className="risk-label">技术风险:</span>
                            <span
                              className={`risk-level ${optimizationPlan.riskAssessment.technicalRisk}`}
                            >
                              {optimizationPlan.riskAssessment.technicalRisk}
                            </span>
                          </div>
                          <div className="risk-item">
                            <span className="risk-label">经济风险:</span>
                            <span
                              className={`risk-level ${optimizationPlan.riskAssessment.economicRisk}`}
                            >
                              {optimizationPlan.riskAssessment.economicRisk}
                            </span>
                          </div>
                          <div className="risk-item">
                            <span className="risk-label">环境风险:</span>
                            <span
                              className={`risk-level ${optimizationPlan.riskAssessment.environmentalRisk}`}
                            >
                              {optimizationPlan.riskAssessment.environmentalRisk}
                            </span>
                          </div>
                          <div className="risk-item">
                            <span className="risk-label">运营风险:</span>
                            <span
                              className={`risk-level ${optimizationPlan.riskAssessment.operationalRisk}`}
                            >
                              {optimizationPlan.riskAssessment.operationalRisk}
                            </span>
                          </div>
                          <div className="risk-item overall">
                            <span className="risk-label">综合风险:</span>
                            <span
                              className={`risk-level ${optimizationPlan.riskAssessment.overallRisk}`}
                            >
                              {optimizationPlan.riskAssessment.overallRisk}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 收益预测区域 */}
          <div className="revenue-section">
            <div className="section-header">
              <h2>💰 收益预测分析</h2>
            </div>
            <div className="revenue-content">
              <div className="revenue-cards">
                <div className="revenue-card">
                  <div className="revenue-icon">💰</div>
                  <div className="revenue-info">
                    <div className="revenue-value">
                      ¥{(revenueData.daily.revenue / 1000).toFixed(1)}K
                    </div>
                    <div className="revenue-label">日收益</div>
                  </div>
                </div>
                <div className="revenue-card">
                  <div className="revenue-icon">📈</div>
                  <div className="revenue-info">
                    <div className="revenue-value">
                      +{revenueData.improvement.revenue}%
                    </div>
                    <div className="revenue-label">收益提升</div>
                  </div>
                </div>
                <div className="revenue-card">
                  <div className="revenue-icon">⚡</div>
                  <div className="revenue-info">
                    <div className="revenue-value">
                      {((revenueData.daily.revenue * 0.8) / 1000).toFixed(1)}K
                    </div>
                    <div className="revenue-label">发电量(MWh)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 调度前后对比区域 */}
          <div className="comparison-section">
            <div className="section-header">
              <h2>📊 调度前后对比</h2>
            </div>
            <div className="comparison-content">
              {/* 关键指标对比卡片 */}
              <div className="comparison-cards">
                <div className="comparison-card">
                  <div className="card-title">⚡ 功率输出</div>
                  <div className="card-comparison">
                    <div className="before-value">
                      <span className="label">调度前</span>
                      <span className="value">
                        {formatEnergy(comparisonData.before.powerOutput)}
                      </span>
                    </div>
                    <div className="improvement-arrow">➡️</div>
                    <div className="after-value">
                      <span className="label">调度后</span>
                      <span className="value">
                        {formatEnergy(comparisonData.after.powerOutput)}
                      </span>
                    </div>
                  </div>
                  <div className="improvement-rate">
                    +
                    {(
                      ((comparisonData.after.powerOutput -
                        comparisonData.before.powerOutput) /
                        comparisonData.before.powerOutput) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>

                <div className="comparison-card">
                  <div className="card-title">💰 运营成本</div>
                  <div className="card-comparison">
                    <div className="before-value">
                      <span className="label">调度前</span>
                      <span className="value">
                        ¥{(comparisonData.before.cost / 1000).toFixed(1)}K
                      </span>
                    </div>
                    <div className="improvement-arrow">➡️</div>
                    <div className="after-value">
                      <span className="label">调度后</span>
                      <span className="value">
                        ¥{(comparisonData.after.cost / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                  <div className="improvement-rate cost-reduction">
                    -
                    {(
                      ((comparisonData.before.cost -
                        comparisonData.after.cost) /
                        comparisonData.before.cost) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>

                <div className="comparison-card">
                  <div className="card-title">🌱 碳排放</div>
                  <div className="card-comparison">
                    <div className="before-value">
                      <span className="label">调度前</span>
                      <span className="value">
                        {comparisonData.before.carbonEmission}kg
                      </span>
                    </div>
                    <div className="improvement-arrow">➡️</div>
                    <div className="after-value">
                      <span className="label">调度后</span>
                      <span className="value">
                        {comparisonData.after.carbonEmission}kg
                      </span>
                    </div>
                  </div>
                  <div className="improvement-rate carbon-reduction">
                    -
                    {(
                      ((comparisonData.before.carbonEmission -
                        comparisonData.after.carbonEmission) /
                        comparisonData.before.carbonEmission) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>

              {/* 24小时功率对比图表 */}
              <div className="comparison-chart">
                <div className="chart-title">
                  <h3>📈 24小时功率输出对比</h3>
                  <div className="chart-legend">
                    <span className="legend-item before">
                      <span className="legend-color"></span>
                      调度前
                    </span>
                    <span className="legend-item after">
                      <span className="legend-color"></span>
                      调度后
                    </span>
                  </div>
                </div>
                <div className="chart-container">
                  <div className="chart-grid">
                    {hourlyComparisonData.hours.map((hour, index) => (
                      <div key={hour} className="chart-column">
                        <div className="chart-bars">
                          <div
                            className="chart-bar before"
                            style={{
                              height: `${
                                (hourlyComparisonData.beforeData[index] /
                                  2600) *
                                100
                              }%`,
                            }}
                            title={`调度前 ${hour}: ${hourlyComparisonData.beforeData[index]}MWh`}
                          ></div>
                          <div
                            className="chart-bar after"
                            style={{
                              height: `${
                                (hourlyComparisonData.afterData[index] / 2600) *
                                100
                              }%`,
                            }}
                            title={`调度后 ${hour}: ${hourlyComparisonData.afterData[index]}MWh`}
                          ></div>
                        </div>
                        <div className="chart-label">{hour}</div>
                      </div>
                    ))}
                  </div>
                  {/* <div className="chart-y-axis">
                    <div className="y-label">2600MWh</div>
                    <div className="y-label">2000MWh</div>
                    <div className="y-label">1500MWh</div>
                    <div className="y-label">1000MWh</div>
                    <div className="y-label">500MWh</div>
                    <div className="y-label">0MWh</div>
                  </div> */}
                </div>
              </div>

              {/* 性能指标对比 */}
              <div className="performance-grid">
                <div className="performance-item">
                  <div className="performance-title">📊 系统效率</div>
                  <div className="performance-bars">
                    <div className="performance-bar before">
                      <div className="bar-label">调度前</div>
                      <div
                        className="bar-fill"
                        style={{
                          width: `${comparisonData.before.efficiency}%`,
                        }}
                      ></div>
                      <div className="bar-value">
                        {comparisonData.before.efficiency}%
                      </div>
                    </div>
                    <div className="performance-bar after">
                      <div className="bar-label">调度后</div>
                      <div
                        className="bar-fill"
                        style={{ width: `${comparisonData.after.efficiency}%` }}
                      ></div>
                      <div className="bar-value">
                        {comparisonData.after.efficiency}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="performance-item">
                  <div className="performance-title">🔧 设备利用率</div>
                  <div className="performance-bars">
                    <div className="performance-bar before">
                      <div className="bar-label">调度前</div>
                      <div
                        className="bar-fill"
                        style={{
                          width: `${comparisonData.before.utilization}%`,
                        }}
                      ></div>
                      <div className="bar-value">
                        {comparisonData.before.utilization}%
                      </div>
                    </div>
                    <div className="performance-bar after">
                      <div className="bar-label">调度后</div>
                      <div
                        className="bar-fill"
                        style={{
                          width: `${comparisonData.after.utilization}%`,
                        }}
                      ></div>
                      <div className="bar-value">
                        {comparisonData.after.utilization}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="performance-item">
                  <div className="performance-title">🎯 负荷匹配度</div>
                  <div className="performance-bars">
                    <div className="performance-bar before">
                      <div className="bar-label">调度前</div>
                      <div
                        className="bar-fill"
                        style={{ width: `${comparisonData.before.loadMatch}%` }}
                      ></div>
                      <div className="bar-value">
                        {comparisonData.before.loadMatch}%
                      </div>
                    </div>
                    <div className="performance-bar after">
                      <div className="bar-label">调度后</div>
                      <div
                        className="bar-fill"
                        style={{ width: `${comparisonData.after.loadMatch}%` }}
                      ></div>
                      <div className="bar-value">
                        {comparisonData.after.loadMatch}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 设备调整模态框 */}
      {selectedDevice && (
        <div className="device-edit-modal">
          <div className="modal-content">
            <h3>调整设备参数</h3>
            <p>设备: {selectedDevice.name}</p>
            <div className="input-group">
              <label>目标值 (MWh):</label>
              <input
                type="number"
                value={newTargetValue}
                onChange={(e) => setNewTargetValue(e.target.value)}
                max={selectedDevice.capacity}
                min={0}
              />
            </div>
            <div className="input-group">
              <label>设备状态:</label>
              <select
                value={newDeviceStatus}
                onChange={(e) => setNewDeviceStatus(e.target.value)}
              >
                <option value="运行">运行</option>
                <option value="停机">停机</option>
                <option value="维护">维护</option>
                <option value="待机">待机</option>
                {selectedDevice.type === "储能" && (
                  <>
                    <option value="充电">充电</option>
                    <option value="放电">放电</option>
                  </>
                )}
              </select>
            </div>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleDeviceUpdate}>
                确认
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setSelectedDevice(null);
                  setNewTargetValue("");
                  setNewDeviceStatus("");
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationManagement;
