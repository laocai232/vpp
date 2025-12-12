import apiService from '../../../utils/apiService';

/**
 * HomeView页面的API调用服务
 */
class HomeViewApiService {
    
    // ========== 设备相关API ==========

    /**
     * 获取所有设备信息
     * @returns {Promise} 设备列表
     */
    async getAllDevices() {
        return apiService.get('/devices/AllDevices');
    }

    /**
     * 获取设备在线状态统计
     * @returns {Promise} 设备在线状态统计数据
     */
    async getDeviceOnlineStats() {
        const result = await this.getAllDevices();
        
        if (!result.success) {
            console.error('API调用失败:', result);
            return result;
        }

        try {
            console.log('原始设备数据:', result);
            let devices = result.data;
            
            // 处理不同的数据格式
            if (!devices) {
                throw new Error('设备数据为空');
            }
            
            // 如果数据被包装在其他字段中，尝试提取
            if (devices.data && Array.isArray(devices.data)) {
                devices = devices.data;
            } else if (devices.list && Array.isArray(devices.list)) {
                devices = devices.list;
            } else if (devices.devices && Array.isArray(devices.devices)) {
                devices = devices.devices;
            } else if (!Array.isArray(devices)) {
                // 如果数据格式不正确，返回空数组
                console.warn('设备数据格式不正确，返回空数组:', devices);
                devices = [];
            }

            console.log('处理后的设备数据:', devices);

            // 计算设备在线率统计
            const stats = this.calculateDeviceStats(devices);
            
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('处理设备统计数据失败:', error);
            // 返回错误信息
            return {
                success: false,
                error: error.message,
                data: {
                    total: 0,
                    online: 0,
                    offline: 0,
                    onlineRate: 0,
                    typeStats: {},
                    trendData: { daily: [], labels: [] },
                    deviceData: [],
                    lastUpdated: new Date().toISOString()
                }
            };
    }
    }



    /**
     * 计算设备统计数据
     * @param {Array} devices - 设备列表
     * @returns {Object} 统计数据
     */
    calculateDeviceStats(devices) {
        const total = devices.length;
        const online = devices.filter(device => 
            device.status === 'ONLINE' || 
            device.online === true || 
            device.isOnline === true ||
            device.state === 'running'
        ).length;
        
        const offline = total - online;
        const onlineRate = total > 0 ? Math.round((online / total) * 100) : 0;

        // 按设备类型分组统计
        const typeStats = {};
        devices.forEach(device => {
            const type = this.getDeviceTypeDisplay(device.deviceType) || device.type || '未知设备';
            if (!typeStats[type]) {
                typeStats[type] = { total: 0, online: 0 };
            }
            typeStats[type].total++;
            if (device.status === 'ONLINE' || 
                device.online === true || 
                device.isOnline === true ||
                device.state === 'running') {
                typeStats[type].online++;
            }
        });

        // 生成趋势数据（模拟历史数据）
        const trendData = this.generateOnlineTrendData(onlineRate);

        return {
            total,
            online,
            offline,
            onlineRate,
            typeStats,
            trendData,
            deviceData: devices, // 添加原始设备数据
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * 生成在线率趋势数据（模拟历史数据）
     * @param {number} currentRate - 当前在线率
     * @returns {Object} 趋势数据
     */
    generateOnlineTrendData(currentRate) {
        const baseRate = currentRate;
        const variation = 5; // 变化幅度

        return {
            daily: [
                Math.max(0, Math.min(100, baseRate + Math.random() * variation - variation/2)),
                Math.max(0, Math.min(100, baseRate + Math.random() * variation - variation/2)),
                Math.max(0, Math.min(100, baseRate + Math.random() * variation - variation/2)),
                Math.max(0, Math.min(100, baseRate + Math.random() * variation - variation/2)),
                currentRate
            ],
            labels: ['昨日', '今日', '本周', '本月', '今年']
        };
    }

    /**
     * 设备类型显示转换
     * @param {string} deviceType - 设备类型
     * @returns {string} 中文显示名称
     */
    getDeviceTypeDisplay(deviceType) {
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
    }

    // ========== 其他HomeView相关API ==========

    /**
     * 获取实时功率数据
     * @returns {Promise} 实时功率数据
     */
    async getRealTimePowerData() {
        return apiService.get('/power/realtime');
    }

    /**
     * 获取系统状态
     * @returns {Promise} 系统状态数据
     */
    async getSystemStatus() {
        return apiService.get('/system/status');
    }

    /**
     * 获取电厂地图数据
     * @returns {Promise} 地图数据
     */
    async getMapData() {
        return apiService.get('/map/stations');
    }

    /**
     * 获取产能结构数据
     * @returns {Promise} 产能结构数据
     */
    async getProductionStructure() {
        return apiService.get('/production/structure');
    }

    /**
     * 获取电量趋势数据
     * @returns {Promise} 电量趋势数据
     */
    async getPowerTrend() {
        return apiService.get('/power/trend');
    }
}

// 创建单例实例
const homeViewApiService = new HomeViewApiService();

export default homeViewApiService;
