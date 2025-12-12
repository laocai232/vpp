package org.example.virtualpowerplantback.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.virtualpowerplantback.entity.VppDevice;
import org.example.virtualpowerplantback.repository.VppDeviceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 数据初始化器
 * 在应用启动时创建一些测试设备
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final VppDeviceRepository deviceRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if (deviceRepository.count() == 0) {
            initializeTestDevices();
            log.info("初始化测试设备数据完成");
        } else {
            log.info("数据库中已存在设备数据，跳过初始化");
        }
    }
    
    private void initializeTestDevices() {
        // 创建测试电表
        VppDevice electricMeter = new VppDevice();
        electricMeter.setName("测试智能电表001");
        electricMeter.setIpAddress("192.168.1.100");
        electricMeter.setPort(502);
        electricMeter.setSlaveId(1);
        electricMeter.setDeviceType(VppDevice.DeviceType.ELECTRIC_METER);
        electricMeter.setStatus(VppDevice.DeviceStatus.OFFLINE);
        electricMeter.setEnabled(true);
        electricMeter.setDescription("主要用于监测用电量和电能质量");
        deviceRepository.save(electricMeter);
        
        // 创建测试储能设备
        VppDevice energyStorage = new VppDevice();
        energyStorage.setName("储能电池系统001");
        energyStorage.setIpAddress("192.168.1.101");
        energyStorage.setPort(502);
        energyStorage.setSlaveId(1);
        energyStorage.setDeviceType(VppDevice.DeviceType.ENERGY_STORAGE);
        energyStorage.setStatus(VppDevice.DeviceStatus.OFFLINE);
        energyStorage.setEnabled(true);
        energyStorage.setDescription("锂电池储能系统，容量100MWh");
        deviceRepository.save(energyStorage);
        
        // 创建测试光伏设备
        VppDevice solarPanel = new VppDevice();
        solarPanel.setName("屋顶光伏板组001");
        solarPanel.setIpAddress("192.168.1.102");
        solarPanel.setPort(502);
        solarPanel.setSlaveId(1);
        solarPanel.setDeviceType(VppDevice.DeviceType.SOLAR_PANEL);
        solarPanel.setStatus(VppDevice.DeviceStatus.OFFLINE);
        solarPanel.setEnabled(true);
        solarPanel.setDescription("单晶硅光伏板，装机容量50kW");
        deviceRepository.save(solarPanel);
        
        // 创建测试逆变器
        VppDevice inverter = new VppDevice();
        inverter.setName("并网逆变器001");
        inverter.setIpAddress("192.168.1.103");
        inverter.setPort(502);
        inverter.setSlaveId(1);
        inverter.setDeviceType(VppDevice.DeviceType.INVERTER);
        inverter.setStatus(VppDevice.DeviceStatus.OFFLINE);
        inverter.setEnabled(true);
        inverter.setDescription("三相并网逆变器，额定功率50kW");
        deviceRepository.save(inverter);
        
        // 创建测试风机
        VppDevice windTurbine = new VppDevice();
        windTurbine.setName("小型风力发电机001");
        windTurbine.setIpAddress("192.168.1.104");
        windTurbine.setPort(502);
        windTurbine.setSlaveId(1);
        windTurbine.setDeviceType(VppDevice.DeviceType.WIND_TURBINE);
        windTurbine.setStatus(VppDevice.DeviceStatus.OFFLINE);
        windTurbine.setEnabled(true);
        windTurbine.setDescription("水平轴风力发电机，额定功率10kW");
        deviceRepository.save(windTurbine);
        
        // 创建测试负荷控制器
        VppDevice loadController = new VppDevice();
        loadController.setName("智能负荷控制器001");
        loadController.setIpAddress("192.168.1.105");
        loadController.setPort(502);
        loadController.setSlaveId(1);
        loadController.setDeviceType(VppDevice.DeviceType.LOAD_CONTROLLER);
        loadController.setStatus(VppDevice.DeviceStatus.OFFLINE);
        loadController.setEnabled(true);
        loadController.setDescription("可控负荷设备，最大负荷20kW");
        deviceRepository.save(loadController);
        
        log.info("创建了{}个测试设备", 6);
    }
} 