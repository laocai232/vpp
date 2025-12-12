import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import './style.css';

export default function DataReportingByte() {
    const fileInputRef = useRef(null);

    const [byteStats, setByteStats] = useState({
        totalBytes: 3458792,
        compressionRatio: 68.5,
        encryptionOverhead: 12.3,
        dataIntegrity: 99.8,
        transmissionRate: 1.87 // MB/s
    });

    const [formData, setFormData] = useState({
        deviceType: 'pv',
        reportType: 'realtime',
        dataFormat: 'json',
        encryptionType: 'aes',
        compressionEnabled: true,
        description: '',
        frequency: 5,
        priority: 'normal',
        aggregationEnabled: true,
        reportEndpoint: 'vpp-central-platform'
    });

    const [selectedModules, setSelectedModules] = useState([]);
    const [availableModules, setAvailableModules] = useState([
        // { id: 'dispatch001', name: '实时调度模块', type: 'dispatch', status: 'active', description: '负责实时电力调度与平衡' },
        // { id: 'dispatch002', name: '预测调度模块', type: 'dispatch', status: 'active', description: '基于预测的调度计划制定' },
        { id: 'trading001', name: '电量与报价', type: 'trading', status: 'active', description: '电力现货市场交易管理' },
        // { id: 'trading002', name: '中长期交易模块', type: 'trading', status: 'active', description: '中长期电力合约交易' },
        { id: 'pricing001', name: '收益与分析', type: 'pricing', status: 'active', description: '实时电价计算收益' },
        // { id: 'pricing002', name: '成本分析模块', type: 'pricing', status: 'maintenance', description: '发电成本分析与优化' },
        { id: 'forecast001', name: '负荷预测模块', type: 'forecast', status: 'active', description: '电力负荷预测分析' },
        // { id: 'forecast002', name: '新能源预测模块', type: 'forecast', status: 'active', description: '风光发电功率预测' },
    ]);

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [reportHistory, setReportHistory] = useState([
        {
            id: 'rep001',
            time: '2023-06-25 14:30:22',
            type: '实时数据',
            status: 'success',
            size: '1.2MB',
            modules: ['实时调度模块', '动态定价模块', '现货交易模块'],
            endpoint: 'VPP中央平台',
            dataFormat: 'JSON',
            encryption: 'AES-256',
            compression: '启用',
            transmissionTime: '2.3秒',
            recordCount: 1250,
            errorCount: 0,
            description: '实时调度指令、电价信息、交易数据上报'
        },
        {
            id: 'rep002',
            time: '2023-06-25 13:15:05',
            type: '历史数据',
            status: 'success',
            size: '3.5MB',
            modules: ['预测调度模块', '中长期交易模块', '负荷预测模块', '成本分析模块'],
            endpoint: '电网运营商',
            dataFormat: 'CSV',
            encryption: '无',
            compression: '启用',
            transmissionTime: '5.8秒',
            recordCount: 8640,
            errorCount: 0,
            description: '24小时调度计划、交易合约、负荷预测数据'
        },
        {
            id: 'rep003',
            time: '2023-06-25 11:42:18',
            type: '配置数据',
            status: 'failed',
            size: '0.8MB',
            modules: ['成本分析模块'],
            endpoint: '本地控制中心',
            dataFormat: 'JSON',
            encryption: 'AES-128',
            compression: '禁用',
            transmissionTime: '超时',
            recordCount: 0,
            errorCount: 1,
            description: '成本分析模块配置参数同步失败',
            errorMessage: '网络连接超时，模块服务异常'
        },
        {
            id: 'rep004',
            time: '2023-06-24 22:10:45',
            type: '实时数据',
            status: 'success',
            size: '1.4MB',
            modules: ['实时调度模块', '动态定价模块', '负荷预测模块', '新能源预测模块'],
            endpoint: '电力市场',
            dataFormat: 'JSON',
            encryption: 'AES-256',
            compression: '启用',
            transmissionTime: '1.9秒',
            recordCount: 1680,
            errorCount: 0,
            description: '调度优化结果和负荷预测数据'
        },
        {
            id: 'rep005',
            time: '2023-06-24 18:05:33',
            type: '告警数据',
            status: 'success',
            size: '0.5MB',
            modules: ['新能源预测模块'],
            endpoint: 'VPP中央平台',
            dataFormat: 'JSON',
            encryption: 'AES-256',
            compression: '禁用',
            transmissionTime: '0.8秒',
            recordCount: 15,
            errorCount: 0,
            description: '新能源预测偏差告警信息'
        },
    ]);

    // 弹窗状态
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // 查看详情
    const handleViewDetail = (report) => {
        setSelectedReport(report);
        setShowDetailModal(true);
    };

    // 关闭弹窗
    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedReport(null);
    };

    // 下载报告
    const handleDownloadReport = (report) => {
        // 模拟下载功能
        console.log('下载报告:', report.id);
        alert(`正在下载 ${report.type} 报告...`);
    };

    // 添加预设配置选项
    const presetConfigs = [
        { name: '实时监控', config: { reportType: 'realtime', dataFormat: 'json', frequency: 5, compressionEnabled: true, encryptionType: 'aes', aggregationEnabled: true } },
        { name: '历史数据', config: { reportType: 'historical', dataFormat: 'csv', frequency: 60, compressionEnabled: true, encryptionType: 'none', aggregationEnabled: false } },
        { name: '告警数据', config: { reportType: 'alarm', dataFormat: 'json', frequency: 1, compressionEnabled: false, encryptionType: 'aes256', aggregationEnabled: false } },
    ];

    // 虚拟电厂数据上报端点
    const reportEndpoints = [
        { id: 'vpp-central-platform', name: 'VPP中央平台' },
        { id: 'grid-operator', name: '电网运营商' },
        { id: 'energy-market', name: '电力市场' },
        { id: 'local-control', name: '本地控制中心' }
    ];

    useEffect(() => {
        // 实时数据更新
        const interval = setInterval(() => {
            setByteStats(prev => ({
                ...prev,
                totalBytes: prev.totalBytes + Math.floor(Math.random() * 5000),
                compressionRatio: Math.max(50, Math.min(90, prev.compressionRatio + (Math.random() - 0.5) * 0.5)),
                encryptionOverhead: Math.max(8, Math.min(18, prev.encryptionOverhead + (Math.random() - 0.5) * 0.3)),
                dataIntegrity: Math.max(98, Math.min(100, prev.dataIntegrity + (Math.random() - 0.5) * 0.1)),
                transmissionRate: Math.max(0.5, Math.min(5, prev.transmissionRate + (Math.random() - 0.5) * 0.2))
            }));
        }, 3000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    // 处理表单变化
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // 处理模块选择
    const handleModuleSelect = (moduleId) => {
        setSelectedModules(prev => {
            if (prev.includes(moduleId)) {
                return prev.filter(id => id !== moduleId);
            } else {
                return [...prev, moduleId];
            }
        });
    };

    // 处理文件上传
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedFiles(prev => [...prev, ...files]);
    };

    // 应用预设配置
    const applyPresetConfig = (config) => {
        setFormData(prev => ({
            ...prev,
            ...config
        }));
    };

    // 重置表单
    const resetForm = () => {
        setFormData({
            deviceType: 'pv',
            reportType: 'realtime',
            dataFormat: 'json',
            encryptionType: 'aes',
            compressionEnabled: true,
            description: '',
            frequency: 5,
            priority: 'normal',
            aggregationEnabled: true,
            reportEndpoint: 'vpp-central-platform'
        });
        setSelectedModules([]);
        setUploadedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // 保存配置
    const saveConfig = () => {
        alert('配置已保存！');
    };

    // 处理上报内容配置变更
    const handleReportContentChange = (e) => {
        const { name, type, checked, value } = e.target;
        setReportContent(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // 专用：切换复选框状态，避免由于点击 label 导致事件目标不是 input 而获取不到 checked
    const toggleCheckbox = (name) => {
        setReportContent(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    // 生成报文
    const generatePayload = () => {
        const payload = {
            target: gridTargets.find(t => t.id === gridTarget)?.name,
            endpoint: gridTarget,
            content: {
                priceUnit: reportContent.unit,
                quotationUnit: reportContent.unit,
                granularity: reportContent.granularity,
                timeRange: { start: reportContent.startTime, end: reportContent.endTime },
                include: {
                    price: reportContent.includePrice,
                    quotation: reportContent.includeQuotation,
                    scheduling: reportContent.includeScheduling
                },
                strategy: reportContent.strategy,
                schedulingNote: reportContent.schedulingNote,
                modules: selectedModules
            },
            format: (formData.dataFormat || 'json').toUpperCase(),
            timestamp: new Date().toISOString()
        };
        setPayloadPreview(JSON.stringify(payload, null, 2));
    };

    // 提交报告到电网平台
    const submitReportToGrid = () => {
        const endpointNameMap = { dispatch: '调度平台', om: '运检平台', marketing: '营销平台' };
        const newReport = {
            id: `rep${Math.floor(Math.random() * 1000)}`,
            time: new Date().toLocaleString(),
            type: '电价/报价/调度信息',
            status: 'success',
            size: `${(Math.random() * 1.5 + 0.5).toFixed(1)}MB`,
            modules: selectedModules.map(id => availableModules.find(m => m.id === id)?.name || id),
            endpoint: endpointNameMap[gridTarget],
            dataFormat: 'JSON',
            encryption: (formData.encryptionType || 'aes').toUpperCase(),
            compression: formData.compressionEnabled ? '启用' : '禁用',
            transmissionTime: `${(Math.random() * 2 + 0.8).toFixed(1)}秒`,
            recordCount: Math.floor(Math.random() * 500) + 100,
            errorCount: 0,
            description: `上报内容: 电价(${reportContent.unit}), 报价(${reportContent.unit}), 调度信息; 时间粒度: ${reportContent.granularity}`
        };
        setReportHistory(prev => [newReport, ...prev]);
        alert(`已将报文上报到${endpointNameMap[gridTarget]}`);
    };

    // 新增：电网公司平台与上报内容配置
    const [gridTarget, setGridTarget] = useState('dispatch'); // dispatch | om | marketing
    const gridTargets = [
        { id: 'dispatch', name: '调度平台' },
        { id: 'om', name: '运检平台' },
        { id: 'marketing', name: '营销平台' }
    ];
    const [reportContent, setReportContent] = useState({
        includePrice: true,
        includeQuotation: true,
        includeScheduling: true,
        unit: '元/MWh',
        granularity: '15分钟',
        startTime: '00:00',
        endTime: '24:00',
        strategy: '默认策略',
        schedulingNote: ''
    });
    const [payloadPreview, setPayloadPreview] = useState('');

    // 模拟上传过程
    const simulateUpload = () => {
        if (uploadedFiles.length === 0 && selectedModules.length === 0) {
            alert('请选择模块或上传文件');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsUploading(false);
                    
                    // 添加到上报历史
                    const newReport = {
                        id: `rep${Math.floor(Math.random() * 1000)}`,
                        time: new Date().toLocaleString(),
                        type: formData.reportType === 'realtime' ? '实时数据' : '历史数据',
                        status: 'success',
                        size: `${(Math.random() * 2 + 0.5).toFixed(1)}MB`
                    };
                    
                    setReportHistory(prev => [newReport, ...prev]);
                    
                    // 清空已上传文件
                    setUploadedFiles([]);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    
                    return 0;
                }
                return prev + 5;
            });
        }, 200);
    };

    // 取消上传
    const cancelUpload = () => {
        setIsUploading(false);
        setUploadProgress(0);
    };

    // 删除上传文件
    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="data-reporting-container">
            {/* 页面标题 */}
            <div className="page-header">
                <div className="title-section">
                    <div className="title-icon-wrapper">
                        <div className="title-icon">📊</div>
                    </div>
                    <div className="title-content">
                        <h1 className="page-title">数据上报（电网公司平台）</h1>
                        <p className="page-subtitle">上报电价、报价与运营调度信息（调度/运检/营销）</p>
                    </div>
                </div>
                {/* <div className="header-stats">
                    <div className="stat-item">
                        <div className="stat-icon">💾</div>
                        <div className="stat-content">
                            <span className="stat-value">{byteStats.totalBytes.toLocaleString()}</span>
                            <span className="stat-label">总字节数</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">🔄</div>
                        <div className="stat-content">
                            <span className="stat-value">{byteStats.compressionRatio.toFixed(1)}%</span>
                            <span className="stat-label">压缩率</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <span className="stat-value">{byteStats.dataIntegrity.toFixed(1)}%</span>
                            <span className="stat-label">数据完整性</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-content">
                            <span className="stat-value">{byteStats.transmissionRate.toFixed(2)}MB/s</span>
                            <span className="stat-label">传输速率</span>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* 主要内容区域 - 改为两列布局 */}
            <div className="main-content-grid two-column">
                {/* 左侧 - 模块选择和文件上传 */}
                <div className="device-upload-section">
                    <div className="section-header">
                        <h2>运营调度与交易模块选择</h2>
                    </div>
                    
                    <div className="device-selection">
                        <h3>选择业务模块</h3>
                        <div className="devices-grid">
                            {availableModules.map(module => (
                                <div 
                                    key={module.id} 
                                    className={`device-item ${module.status === 'inactive' ? 'offline' : ''} ${module.status === 'maintenance' ? 'maintenance' : ''} ${selectedModules.includes(module.id) ? 'selected' : ''}`}
                                    onClick={() => module.status !== 'inactive' && handleModuleSelect(module.id)}
                                >
                                    <div className="device-icon">
                                        {module.type === 'dispatch' && '🎯'}
                                        {module.type === 'trading' && '💰'}
                                        {module.type === 'pricing' && '💲'}
                                        {module.type === 'forecast' && '📈'}
                                    </div>
                                    <div className="device-info">
                                        <div className="device-name">{module.name}</div>
                                        <div className="device-description">{module.description}</div>
                                        <div className="device-status">
                                            <span className={`status-indicator ${module.status}`}></span>
                                            {module.status === 'active' && '运行中'}
                                            {module.status === 'inactive' && '未激活'}
                                            {module.status === 'maintenance' && '维护中'}
                                        </div>
                                    </div>
                                    {selectedModules.includes(module.id) && (
                                        <div className="device-selected-mark">✓</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="selection-summary">
                            已选择 {selectedModules.length} 个模块
                            {selectedModules.length > 0 && (
                                <button className="clear-selection-btn" onClick={() => setSelectedModules([])}>
                                    清除选择
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="file-upload-section">
                        <h3>业务数据文件上传</h3>
                        <div className="file-upload-area">
                            <input 
                                type="file" 
                                multiple 
                                onChange={handleFileUpload} 
                                className="file-input"
                                ref={fileInputRef}
                            />
                            <div className="upload-button">
                                <span>选择业务数据文件</span>
                                <span className="upload-icon">📊</span>
                            </div>
                            <div className="upload-hint">支持调度计划(.json)、交易数据(.csv)、电价信息(.xml)等格式</div>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="uploaded-files-list">
                                <h4>已选择文件 ({uploadedFiles.length})</h4>
                                {uploadedFiles.map((file, index) => (
                                    <div key={index} className="uploaded-file-item">
                                        <div className="file-info">
                                            <span className="file-icon">📄</span>
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <button 
                                            className="remove-file-btn" 
                                            onClick={() => removeFile(index)}
                                            disabled={isUploading}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isUploading && (
                            <div className="upload-progress-container">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <div className="progress-text">{uploadProgress}%</div>
                                <button className="cancel-upload-btn" onClick={cancelUpload}>
                                    取消
                                </button>
                            </div>
                        )}

                        <div className="upload-actions">
                            <button 
                                className="upload-submit-btn" 
                                onClick={simulateUpload}
                                disabled={isUploading}
                            >
                                {isUploading ? '上传中...' : '开始上报'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 右侧 - 上报历史 */}
                <div className="history-charts-section">
                    <div className="section-header">
                        <h2>上报至电网公司（调度/运检/营销）部门</h2>
                    </div>

                    {/* 新增：报送配置与预览 */}
                    <div className="report-config-section">
                        <div className="form-content">
                            <div className="form-group">
                                <label>平台选择</label>
                                <div className="platform-options">
                                    {gridTargets.map(t => (
                                        <label key={t.id} className={`platform-option ${gridTarget === t.id ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="gridTarget"
                                                value={t.id}
                                                checked={gridTarget === t.id}
                                                onChange={(e) => setGridTarget(e.target.value)}
                                            />
                                            {t.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>上报内容</label>
                                <div className="content-options">
                                    <label>
                                        <input type="checkbox" name="includePrice" checked={reportContent.includePrice} onChange={() => toggleCheckbox('includePrice')} /> 电价（{reportContent.unit}）
                                    </label>
                                    <label>
                                        <input type="checkbox" name="includeQuotation" checked={reportContent.includeQuotation} onChange={() => toggleCheckbox('includeQuotation')} /> 报价（{reportContent.unit}）
                                    </label>
                                    <label>
                                        <input type="checkbox" name="includeScheduling" checked={reportContent.includeScheduling} onChange={() => toggleCheckbox('includeScheduling')} /> 调度信息
                                    </label>
                                </div>
                            </div>

                            {/* <div className="form-group">
                                <label>时间粒度与范围</label>
                                <div className="time-config">
                                    <span className="granularity-badge">粒度：{reportContent.granularity}</span>
                                    <input type="time" name="startTime" value={reportContent.startTime} onChange={handleReportContentChange} className="time-input" />
                                    <span className="time-sep">—</span>
                                    <input type="time" name="endTime" value={reportContent.endTime} onChange={handleReportContentChange} className="time-input" />
                                </div>
                            </div> */}

                            {/* <div className="form-group">
                                <label>报价策略</label>
                                <input type="text" name="strategy" value={reportContent.strategy} onChange={handleReportContentChange} className="text-input" placeholder="例如：分时阶梯报价策略" />
                            </div> */}

                            <div className="form-group">
                                <label>上报信息备注</label>
                                <textarea name="schedulingNote" value={reportContent.schedulingNote} onChange={handleReportContentChange} className="textarea-input" placeholder="填入本次上报相关的调度指令、执行情况、约束与工况等"></textarea>
                            </div>

                            <div className="config-actions">
                                <button className="generate-payload-btn" onClick={generatePayload}>生成报文</button>
                                <button className="submit-grid-btn" onClick={submitReportToGrid}>上报到平台</button>
                            </div>

                            {payloadPreview && (
                                <div className="payload-preview">
                                    <pre>{payloadPreview}</pre>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* <div className="section-header">
                        <h2>上报历史与统计</h2>
                    </div>
                    
                    <div className="report-history">
                        <h3>上报历史记录</h3>
                        <div className="history-list">
                            {reportHistory.map(report => (
                                <div key={report.id} className="history-item enhanced">
                                    <div className="history-header">
                                        <div className="history-icon">
                                            {report.status === 'success' ? '✅' : '❌'}
                                        </div>
                                        <div className="history-main-info">
                                            <div className="history-time">{report.time}</div>
                                            <div className="history-type-badge">{report.type}</div>
                                        </div>
                                        <div className={`history-status-badge ${report.status}`}>
                                            {report.status === 'success' ? '成功' : '失败'}
                                        </div>
                                    </div>

                                    <div className="history-content">
                                        <div className="history-description">
                                            {report.description}
                                        </div>

                                        <div className="history-metrics">
                                            <div className="metric-item">
                                                <span className="metric-label">数据大小:</span>
                                                <span className="metric-value">{report.size}</span>
                                            </div>
                                            <div className="metric-item">
                                                <span className="metric-label">模块数量:</span>
                                                <span className="metric-value">{(report.modules || report.devices || []).length}个</span>
                                            </div>
                                            <div className="metric-item">
                                                <span className="metric-label">上报端点:</span>
                                                <span className="metric-value">{report.endpoint}</span>
                                            </div>
                                            <div className="metric-item">
                                                <span className="metric-label">传输时间:</span>
                                                <span className="metric-value">{report.transmissionTime}</span>
                                            </div>
                                        </div>

                                        <div className="history-devices">
                                            <span className="devices-label">涉及设备:</span>
                                            <div className="devices-list">
                                                {report.devices.slice(0, 3).map((device, index) => (
                                                    <span key={index} className="device-tag">{device}</span>
                                                ))}
                                                {report.devices.length > 3 && (
                                                    <span className="device-more">+{report.devices.length - 3}台</span>
                                                )}
                                            </div>
                                        </div>

                                        {report.status === 'failed' && report.errorMessage && (
                                            <div className="error-message">
                                                <span className="error-icon">⚠️</span>
                                                <span className="error-text">{report.errorMessage}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="history-actions">
                                        <button
                                            className="history-view-btn"
                                            onClick={() => handleViewDetail(report)}
                                        >
                                            查看详情
                                        </button>
                                        <button
                                            className="history-download-btn"
                                            onClick={() => handleDownloadReport(report)}
                                            disabled={report.status === 'failed'}
                                        >
                                            下载报告
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    <div className="data-transfer-info">
                        <div className="info-card">
                            <div className="info-title">
                                <span className="info-icon">📊</span>
                                数据传输信息
                            </div>
                            <div className="info-content">
                                <div className="info-item">
                                    <span className="info-label">今日上报总量:</span>
                                    <span className="info-value">24.5 MB</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">平均上报速率:</span>
                                    <span className="info-value">1.8 MB/s</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">最大传输峰值:</span>
                                    <span className="info-value">5.2 MB/s</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">累计上报次数:</span>
                                    <span className="info-value">128 次</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 详情弹窗 */}
            {showDetailModal && selectedReport && (
                <div className="report-detail-modal-overlay" onClick={closeDetailModal}>
                    <div className="report-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <span className="modal-icon">
                                    {selectedReport.status === 'success' ? '✅' : '❌'}
                                </span>
                                {selectedReport.type} - 详细信息
                            </h3>
                            <button className="modal-close" onClick={closeDetailModal}>×</button>
                        </div>

                        <div className="modal-content">
                            <div className="detail-section">
                                <h4 className="section-title">📋 基本信息</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">上报时间:</span>
                                        <span className="detail-value">{selectedReport.time}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">数据类型:</span>
                                        <span className="detail-value">{selectedReport.type}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">上报状态:</span>
                                        <span className={`detail-status ${selectedReport.status}`}>
                                            {selectedReport.status === 'success' ? '成功' : '失败'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">数据大小:</span>
                                        <span className="detail-value">{selectedReport.size}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">目标端点:</span>
                                        <span className="detail-value">{selectedReport.endpoint}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">数据格式:</span>
                                        <span className="detail-value">{selectedReport.dataFormat}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="section-title">🔧 技术参数</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">加密方式:</span>
                                        <span className="detail-value">{selectedReport.encryption}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">压缩状态:</span>
                                        <span className="detail-value">{selectedReport.compression}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">传输时间:</span>
                                        <span className="detail-value">{selectedReport.transmissionTime}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">记录数量:</span>
                                        <span className="detail-value">{selectedReport.recordCount.toLocaleString()}条</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">错误数量:</span>
                                        <span className="detail-value error-count">{selectedReport.errorCount}条</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">成功率:</span>
                                        <span className="detail-value success-rate">
                                            {selectedReport.recordCount > 0
                                                ? ((selectedReport.recordCount - selectedReport.errorCount) / selectedReport.recordCount * 100).toFixed(2)
                                                : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="section-title">🏭 涉及模块</h4>
                                <div className="devices-detail">
                                    {(selectedReport.modules || selectedReport.devices || []).map((module, index) => (
                                        <div key={index} className="device-detail-item">
                                            <span className="device-name">{module}</span>
                                            <span className="device-status online">运行中</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="section-title">📝 描述信息</h4>
                                <div className="description-content">
                                    {selectedReport.description}
                                </div>
                            </div>

                            {selectedReport.status === 'failed' && selectedReport.errorMessage && (
                                <div className="detail-section error-section">
                                    <h4 className="section-title">❌ 错误信息</h4>
                                    <div className="error-detail">
                                        <div className="error-message-detail">
                                            <span className="error-icon">⚠️</span>
                                            <span className="error-text">{selectedReport.errorMessage}</span>
                                        </div>
                                        <div className="error-suggestions">
                                            <h5>建议解决方案:</h5>
                                            <ul>
                                                <li>检查网络连接状态</li>
                                                <li>确认模块服务运行状态</li>
                                                <li>重新尝试数据上报</li>
                                                <li>检查模块配置参数</li>
                                                <li>联系技术支持</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="modal-btn secondary" onClick={closeDetailModal}>
                                关闭
                            </button>
                            <button
                                className="modal-btn primary"
                                onClick={() => handleDownloadReport(selectedReport)}
                                disabled={selectedReport.status === 'failed'}
                            >
                                下载报告
                            </button>
                            {selectedReport.status === 'failed' && (
                                <button className="modal-btn retry">
                                    重新上报
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


