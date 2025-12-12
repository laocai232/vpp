package org.example.virtualpowerplantback.service;

import lombok.extern.slf4j.Slf4j;
import org.example.virtualpowerplantback.entity.VppDevice;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * 数据模拟器服务
 * 用于在没有真实Modbus设备时模拟设备数据
 */
@Service
@Slf4j
public class DataSimulatorService {
    
    private final Random random = new Random();
    
    /**
     * 模拟设备数据
     */
    public Map<String, Object> simulateDeviceData(VppDevice device) {
        Map<String, Object> data = new HashMap<>();
        
        switch (device.getDeviceType()) {
            case ELECTRIC_METER:
                data = simulateElectricMeterData();
                break;
            case ENERGY_STORAGE:
                data = simulateEnergyStorageData();
                break;
            case SOLAR_PANEL:
                data = simulateSolarPanelData();
                break;
            case INVERTER:
                data = simulateInverterData();
                break;
            case WIND_TURBINE:
                data = simulateWindTurbineData();
                break;
            case LOAD_CONTROLLER:
                data = simulateLoadControllerData();
                break;
            default:
                data = simulateGenericDeviceData();
        }
        
        log.debug("模拟设备数据: {} - {}", device.getName(), data);
        return data;
    }
    
    /**
     * 模拟电表数据
     */
    private Map<String, Object> simulateElectricMeterData() {
        Map<String, Object> data = new HashMap<>();
        
        // 电压: 220V ± 10V
        data.put("voltage", randomBigDecimal(210.0, 230.0, 1));
        
        // 电流: 0-50A
        data.put("current", randomBigDecimal(0.5, 50.0, 3));
        
        // 功率: 计算或随机生成 100W-10kW
        data.put("power", randomBigDecimal(100.0, 10000.0, 2));
        
        // 电能: 累计值 0-999999 MWh
        data.put("energy", randomBigDecimal(0.0, 999999.0, 3));
        
        // 频率: 50Hz ± 0.5Hz
        data.put("frequency", randomBigDecimal(49.5, 50.5, 2));
        
        // 功率因数: 0.8-1.0
        data.put("powerFactor", randomBigDecimal(0.8, 1.0, 3));
        
        return data;
    }
    
    /**
     * 模拟储能设备数据
     */
    private Map<String, Object> simulateEnergyStorageData() {
        Map<String, Object> data = new HashMap<>();
        
        // 电压: 48V系统，实际45-55V
        data.put("voltage", randomBigDecimal(45.0, 55.0, 1));
        
        // 电流: 充放电电流 -100A到+100A
        data.put("current", randomBigDecimal(-100.0, 100.0, 3));
        
        // 功率: 充放电功率 -5kW到+5kW
        data.put("power", randomBigDecimal(-5000.0, 5000.0, 2));
        
        // SOC: 电池荷电状态 20%-95%
        data.put("soc", randomBigDecimal(20.0, 95.0, 1));
        
        // 温度: 电池温度 15-45°C
        data.put("temperature", randomBigDecimal(15.0, 45.0, 1));
        
        // 状态代码: 0=正常, 1=充电, 2=放电, 3=故障
        data.put("statusCode", random.nextInt(4));
        
        return data;
    }
    
    /**
     * 模拟光伏板数据
     */
    private Map<String, Object> simulateSolarPanelData() {
        Map<String, Object> data = new HashMap<>();
        
        // 根据时间模拟光照强度变化
        int hour = java.time.LocalDateTime.now().getHour();
        double lightFactor = calculateLightFactor(hour);
        
        // 电压: 取决于光照 20-40V
        data.put("voltage", randomBigDecimal(20.0 * lightFactor, 40.0 * lightFactor, 1));
        
        // 电流: 取决于光照 0-20A
        data.put("current", randomBigDecimal(0.0, 20.0 * lightFactor, 3));
        
        // 功率: 取决于光照 0-3kW
        data.put("power", randomBigDecimal(0.0, 3000.0 * lightFactor, 2));
        
        // 温度: 面板温度 20-60°C（高温时效率下降）
        data.put("temperature", randomBigDecimal(20.0, 60.0, 1));
        
        return data;
    }
    
    /**
     * 模拟逆变器数据
     */
    private Map<String, Object> simulateInverterData() {
        Map<String, Object> data = new HashMap<>();
        
        // 输出电压: 220V ± 5V
        data.put("voltage", randomBigDecimal(215.0, 225.0, 1));
        
        // 输出电流: 0-30A
        data.put("current", randomBigDecimal(0.0, 30.0, 3));
        
        // 输出功率: 0-6kW
        data.put("power", randomBigDecimal(0.0, 6000.0, 2));
        
        // 频率: 50Hz ± 0.1Hz
        data.put("frequency", randomBigDecimal(49.9, 50.1, 2));
        
        // 温度: 设备温度 25-70°C
        data.put("temperature", randomBigDecimal(25.0, 70.0, 1));
        
        // 状态代码: 0=正常, 1=待机, 2=故障
        data.put("statusCode", random.nextInt(3));
        
        return data;
    }
    
    /**
     * 模拟风力发电机数据
     */
    private Map<String, Object> simulateWindTurbineData() {
        Map<String, Object> data = new HashMap<>();
        
        // 风速影响因子（模拟）
        double windFactor = 0.3 + random.nextDouble() * 0.7; // 0.3-1.0
        
        // 电压: 取决于风速
        data.put("voltage", randomBigDecimal(200.0 * windFactor, 400.0 * windFactor, 1));
        
        // 电流: 取决于风速
        data.put("current", randomBigDecimal(0.0, 50.0 * windFactor, 3));
        
        // 功率: 取决于风速 0-10kW
        data.put("power", randomBigDecimal(0.0, 10000.0 * windFactor, 2));
        
        // 温度: 环境温度 -10-40°C
        data.put("temperature", randomBigDecimal(-10.0, 40.0, 1));
        
        return data;
    }
    
    /**
     * 模拟负荷控制器数据
     */
    private Map<String, Object> simulateLoadControllerData() {
        Map<String, Object> data = new HashMap<>();
        
        // 控制电压
        data.put("voltage", randomBigDecimal(215.0, 225.0, 1));
        
        // 负荷电流
        data.put("current", randomBigDecimal(5.0, 80.0, 3));
        
        // 负荷功率
        data.put("power", randomBigDecimal(1000.0, 15000.0, 2));
        
        // 频率
        data.put("frequency", randomBigDecimal(49.8, 50.2, 2));
        
        // 状态代码: 0=自动, 1=手动, 2=切除
        data.put("statusCode", random.nextInt(3));
        
        return data;
    }
    
    /**
     * 模拟通用设备数据
     */
    private Map<String, Object> simulateGenericDeviceData() {
        Map<String, Object> data = new HashMap<>();
        
        data.put("value1", random.nextInt(1000));
        data.put("value2", random.nextInt(1000));
        data.put("statusCode", random.nextInt(5));
        
        return data;
    }
    
    /**
     * 计算光照强度因子（模拟日出日落）
     */
    private double calculateLightFactor(int hour) {
        if (hour < 6 || hour > 18) {
            return 0.0; // 夜间无光照
        } else if (hour >= 10 && hour <= 14) {
            return 1.0; // 正午光照最强
        } else {
            // 早晚光照较弱
            double factor = Math.sin(Math.PI * (hour - 6) / 12.0);
            return Math.max(0.1, factor);
        }
    }
    
    /**
     * 生成指定范围内的随机BigDecimal
     */
    private BigDecimal randomBigDecimal(double min, double max, int scale) {
        double value = min + (max - min) * random.nextDouble();
        return BigDecimal.valueOf(value).setScale(scale, RoundingMode.HALF_UP);
    }
} 