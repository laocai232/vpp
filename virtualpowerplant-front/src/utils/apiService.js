// API服务工具类
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:8080/api/vpp';
        this.timeout = 5000; // 5秒超时
    }

    /**
     * 通用请求方法
     * @param {string} url - 请求地址
     * @param {Object} options - 请求配置
     * @returns {Promise} 请求结果
     */
    async request(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            timeout: this.timeout,
            ...options
        };

        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

        try {
            // 创建一个超时Promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('请求超时')), this.timeout);
            });

            // 创建fetch请求Promise
            const fetchPromise = fetch(fullUrl, defaultOptions).then(async response => {
                if (!response.ok) {
                    throw new Error(`HTTP错误: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            });

            // 使用Promise.race来实现超时控制
            const result = await Promise.race([fetchPromise, timeoutPromise]);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('API请求失败:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * GET请求
     * @param {string} url - 请求地址
     * @param {Object} params - 查询参数
     * @returns {Promise} 请求结果
     */
    async get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.request(fullUrl);
    }

    /**
     * POST请求
     * @param {string} url - 请求地址
     * @param {Object} data - 请求数据
     * @returns {Promise} 请求结果
     */
    async post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT请求
     * @param {string} url - 请求地址
     * @param {Object} data - 请求数据
     * @returns {Promise} 请求结果
     */
    async put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE请求
     * @param {string} url - 请求地址
     * @returns {Promise} 请求结果
     */
    async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }

    // ========== 基础请求方法已提供，具体API调用请在各页面中实现 ==========
}

// 创建单例实例
const apiService = new ApiService();

export default apiService; 