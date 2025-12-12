package org.example.virtualpowerplantback.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.virtualpowerplantback.entity.DeviceData;
import org.example.virtualpowerplantback.entity.VppDevice;
import org.example.virtualpowerplantback.repository.DeviceDataRepository;
import org.example.virtualpowerplantback.repository.VppDeviceRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 虚拟电厂设备管理服务
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class VppDeviceService {
    
    private final VppDeviceRepository deviceRepository;
    private final DeviceDataRepository deviceDataRepository;
    private final ModbusService modbusService;
    private final ObjectMapper objectMapper;
    
    /**
     * 获取所有设备
     */
    public List<VppDevice> getAllDevices() {
        return deviceRepository.findAll();
    }
    
    /**
     * 根据ID获取设备
     */
    public Optional<VppDevice> getDeviceById(Long id) {
        return deviceRepository.findById(id);
    }
    
    /**
     * 保存设备
     */
    @Transactional
    public VppDevice saveDevice(VppDevice device) {
        // 检查IP地址是否已存在
        Optional<VppDevice> existingDevice = deviceRepository.findByIpAddressAndPort(
            device.getIpAddress(), device.getPort());
        
        if (existingDevice.isPresent() && !existingDevice.get().getId().equals(device.getId())) {
            throw new RuntimeException("该IP地址和端口的设备已存在");
        }
        
        return deviceRepository.save(device);
    }
    
    /**
     * 删除设备
     */
    @Transactional
    public void deleteDevice(Long id) {
        deviceRepository.deleteById(id);
    }
    
    /**
     * 测试设备连接
     */
    public boolean testDeviceConnection(Long deviceId) {
        Optional<VppDevice> deviceOpt = deviceRepository.findById(deviceId);
        if (deviceOpt.isEmpty()) {
            return false;
        }
        
        VppDevice device = deviceOpt.get();
        boolean connected = modbusService.testConnection(device);
        
        // 更新设备状态
        device.setStatus(connected ? VppDevice.DeviceStatus.ONLINE : VppDevice.DeviceStatus.OFFLINE);
        device.setLastCommunicationTime(LocalDateTime.now());
        deviceRepository.save(device);
        
        return connected;
    }
    
    /**
     * 手动读取单个设备数据
     */
    @Transactional
    public DeviceData readDeviceData(Long deviceId) {
        Optional<VppDevice> deviceOpt = deviceRepository.findById(deviceId);
        if (deviceOpt.isEmpty()) {
            throw new RuntimeException("设备不存在");
        }
        
        VppDevice device = deviceOpt.get();
        if (!device.getEnabled()) {
            throw new RuntimeException("设备已禁用");
        }
        
        Map<String, Object> rawData = modbusService.readDeviceData(device);
        
        // 创建设备数据记录
        DeviceData deviceData = new DeviceData();
        deviceData.setDeviceId(device.getId());
        deviceData.setDeviceName(device.getName());
        deviceData.setCollectTime(LocalDateTime.now());
        
        // 解析数据
        if (!rawData.containsKey("error")) {
            populateDeviceData(deviceData, rawData);
            
            // 更新设备状态为在线
            device.setStatus(VppDevice.DeviceStatus.ONLINE);
            device.setLastCommunicationTime(LocalDateTime.now());
        } else {
            // 通信失败，更新设备状态为离线
            device.setStatus(VppDevice.DeviceStatus.OFFLINE);
            log.error("读取设备数据失败: {}", rawData.get("error"));
        }
        
        try {
            deviceData.setRawData(objectMapper.writeValueAsString(rawData));
        } catch (Exception e) {
            log.warn("序列化原始数据失败: {}", e.getMessage());
        }
        
        deviceRepository.save(device);
        return deviceDataRepository.save(deviceData);
    }
    
    /**
     * 获取设备历史数据
     */
    public List<DeviceData> getDeviceHistoryData(Long deviceId, LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(1);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        return deviceDataRepository.findByDeviceIdAndTimeRange(deviceId, startTime, endTime);
    }
    
    /**
     * 获取设备最新数据
     */
    public DeviceData getLatestDeviceData(Long deviceId) {
        return deviceDataRepository.findLatestDataByDeviceId(deviceId);
    }
    
    /**
     * 获取所有设备的最新数据
     */
    public List<DeviceData> getAllLatestData() {
        return deviceDataRepository.findLatestDataForAllDevices();
    }
    
    /**
     * 启用/禁用设备
     */
    @Transactional
    public void toggleDeviceStatus(Long deviceId, boolean enabled) {
        Optional<VppDevice> deviceOpt = deviceRepository.findById(deviceId);
        if (deviceOpt.isPresent()) {
            VppDevice device = deviceOpt.get();
            device.setEnabled(enabled);
            if (!enabled) {
                device.setStatus(VppDevice.DeviceStatus.OFFLINE);
            }
            deviceRepository.save(device);
        }
    }
    
    /**
     * 定时采集所有启用设备的数据
     * 每2小时执行一次（在每小时的0分和30分不执行，选择其他时间点以错开高峰）
     */
    @Scheduled(cron = "0 0 */2 * * ?")
    @Async
    public void collectAllDevicesData() {
        List<VppDevice> enabledDevices = deviceRepository.findByEnabledTrue();
        
        log.info("开始定时采集设备数据（每2小时执行一次），共{}个设备", enabledDevices.size());
        
        for (VppDevice device : enabledDevices) {
            try {
                readDeviceData(device.getId());
                Thread.sleep(1000); // 设备间隔1秒，避免并发过多
            } catch (Exception e) {
                log.error("采集设备数据失败: {} - {}", device.getName(), e.getMessage());
            }
        }
        
        log.info("定时采集设备数据完成");
    }
    
    /**
     * 清理历史数据
     */
    @Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点执行
    @Transactional
    public void cleanupHistoryData() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusDays(30); // 保留30天数据
        deviceDataRepository.deleteByCollectTimeBefore(cutoffTime);
        log.info("清理30天前的历史数据完成");
    }
    
    /**
     * 填充设备数据
     */
    private void populateDeviceData(DeviceData deviceData, Map<String, Object> rawData) {
        if (rawData.get("voltage") instanceof BigDecimal) {
            deviceData.setVoltage((BigDecimal) rawData.get("voltage"));
        }
        if (rawData.get("current") instanceof BigDecimal) {
            deviceData.setCurrent((BigDecimal) rawData.get("current"));
        }
        if (rawData.get("power") instanceof BigDecimal) {
            deviceData.setPower((BigDecimal) rawData.get("power"));
        }
        if (rawData.get("energy") instanceof BigDecimal) {
            deviceData.setEnergy((BigDecimal) rawData.get("energy"));
        }
        if (rawData.get("frequency") instanceof BigDecimal) {
            deviceData.setFrequency((BigDecimal) rawData.get("frequency"));
        }
        if (rawData.get("powerFactor") instanceof BigDecimal) {
            deviceData.setPowerFactor((BigDecimal) rawData.get("powerFactor"));
        }
        if (rawData.get("temperature") instanceof BigDecimal) {
            deviceData.setTemperature((BigDecimal) rawData.get("temperature"));
        }
        if (rawData.get("soc") instanceof BigDecimal) {
            deviceData.setSoc((BigDecimal) rawData.get("soc"));
        }
        if (rawData.get("statusCode") instanceof Integer) {
            deviceData.setStatusCode((Integer) rawData.get("statusCode"));
        }
    }
} 