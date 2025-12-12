package org.example.virtualpowerplantback.service;

import com.digitalpetri.modbus.master.ModbusTcpMaster;
import com.digitalpetri.modbus.master.ModbusTcpMasterConfig;
import com.digitalpetri.modbus.requests.ReadHoldingRegistersRequest;
import com.digitalpetri.modbus.responses.ReadHoldingRegistersResponse;
import lombok.extern.slf4j.Slf4j;
import org.example.virtualpowerplantback.entity.VppDevice;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Modbus通信服务 - 兼容JDK17
 */
@Service
@Slf4j
public class ModbusService {
    
    @Value("${vpp.modbus.connect-timeout:5000}")
    private int connectTimeout;
    
    @Value("${vpp.modbus.read-timeout:3000}")
    private int readTimeout;
    
    @Value("${vpp.modbus.simulation-mode:true}")
    private boolean simulationMode;
    
    // 缓存Modbus客户端连接
    private final Map<String, ModbusTcpMaster> clientCache = new ConcurrentHashMap<>();
    
    private final DataSimulatorService dataSimulatorService;
    
    public ModbusService(DataSimulatorService dataSimulatorService) {
        this.dataSimulatorService = dataSimulatorService;
    }
    
    /**
     * 获取或创建Modbus客户端
     */
    private ModbusTcpMaster getOrCreateClient(String ipAddress, int port) {
        String key = "%s:%d".formatted(ipAddress, port);
        return clientCache.computeIfAbsent(key, k -> {
            try {
                ModbusTcpMasterConfig config = new ModbusTcpMasterConfig.Builder(ipAddress)
                        .setPort(port)
                        .setTimeout(Duration.ofMillis(readTimeout))
                        .build();
                
                return new ModbusTcpMaster(config);
            } catch (Exception e) {
                log.error("创建Modbus客户端失败: {}", e.getMessage());
                return null;
            }
        });
    }
    
    /**
     * 测试设备连接
     */
    public boolean testConnection(VppDevice device) {
        if (simulationMode) {
            // 模拟模式下直接返回成功
            log.info("模拟模式 - 设备连接测试成功: {} - {}", device.getName(), device.getIpAddress());
            return true;
        }
        
        ModbusTcpMaster client = null;
        try {
            client = getOrCreateClient(device.getIpAddress(), device.getPort());
            if (client == null) {
                return false;
            }
            
            // 连接设备
            client.connect().get(connectTimeout, TimeUnit.MILLISECONDS);
            
            // 尝试读取一个寄存器来测试连接
            ReadHoldingRegistersRequest request = new ReadHoldingRegistersRequest(0, 1);
            CompletableFuture<ReadHoldingRegistersResponse> future = 
                    client.sendRequest(request, device.getSlaveId());
            
            ReadHoldingRegistersResponse response = future.get(readTimeout, TimeUnit.MILLISECONDS);
            
            log.info("设备连接测试成功: {} - {}", device.getName(), device.getIpAddress());
            return true;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("设备连接测试被中断: {} - {}", device.getName(), device.getIpAddress());
            return false;
        } catch (ExecutionException | TimeoutException e) {
            log.error("设备连接测试失败: {} - {}, 错误: {}", 
                    device.getName(), device.getIpAddress(), e.getMessage());
            return false;
        } finally {
            // 清理连接
            if (client != null) {
                try {
                    client.disconnect();
                } catch (Exception e) {
                    log.warn("断开连接时出错: {}", e.getMessage());
                }
            }
        }
    }
    
    /**
     * 读取设备数据
     */
    public Map<String, Object> readDeviceData(VppDevice device) {
        if (simulationMode) {
            // 模拟模式下返回模拟数据
            log.debug("模拟模式 - 读取设备数据: {}", device.getName());
            return dataSimulatorService.simulateDeviceData(device);
        }
        
        Map<String, Object> data = new HashMap<>();
        ModbusTcpMaster client = null;
        
        try {
            client = getOrCreateClient(device.getIpAddress(), device.getPort());
            if (client == null) {
                data.put("error", "无法创建客户端连接");
                return data;
            }
            
            // 连接设备
            client.connect().get(connectTimeout, TimeUnit.MILLISECONDS);
            
            // 根据设备类型读取不同的寄存器
            data = switch (device.getDeviceType()) {
                case ELECTRIC_METER -> readElectricMeterData(client, device.getSlaveId());
                case ENERGY_STORAGE -> readEnergyStorageData(client, device.getSlaveId());
                case SOLAR_PANEL -> readSolarPanelData(client, device.getSlaveId());
                case INVERTER -> readInverterData(client, device.getSlaveId());
                case WIND_TURBINE -> readWindTurbineData(client, device.getSlaveId());
                case LOAD_CONTROLLER -> readLoadControllerData(client, device.getSlaveId());
                default -> readGenericDeviceData(client, device.getSlaveId());
            };
            
            log.debug("成功读取设备数据: {} - {}", device.getName(), data);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("读取设备数据被中断: {} - {}", device.getName(), device.getIpAddress());
            data.put("error", "操作被中断");
        } catch (ExecutionException | TimeoutException e) {
            log.error("读取设备数据失败: {} - {}, 错误: {}", 
                    device.getName(), device.getIpAddress(), e.getMessage());
            data.put("error", e.getMessage());
        } finally {
            // 清理连接
            if (client != null) {
                try {
                    client.disconnect();
                } catch (Exception e) {
                    log.warn("断开连接时出错: {}", e.getMessage());
                }
            }
        }
        
        return data;
    }
    
    /**
     * 读取电表数据
     */
    private Map<String, Object> readElectricMeterData(ModbusTcpMaster client, int slaveId) 
            throws ExecutionException, InterruptedException, TimeoutException {
        Map<String, Object> data = new HashMap<>();
        
        // 读取保持寄存器 (电压、电流、功率等)
        ReadHoldingRegistersRequest request = new ReadHoldingRegistersRequest(0, 20);
        CompletableFuture<ReadHoldingRegistersResponse> future = 
                client.sendRequest(request, slaveId);
        
        ReadHoldingRegistersResponse response = future.get(readTimeout, TimeUnit.MILLISECONDS);
        
        // 使用正确的API方法获取寄存器值
        var registers = response.getRegisters();
        if (registers.readableBytes() >= 40) { // 20个寄存器 * 2字节 = 40字节
            // 假设寄存器映射如下（实际项目中需要根据设备文档调整）
            data.put("voltage", convertToDecimal(getRegisterValue(registers, 0), getRegisterValue(registers, 1), 0.1)); // 电压
            data.put("current", convertToDecimal(getRegisterValue(registers, 2), getRegisterValue(registers, 3), 0.001)); // 电流
            data.put("power", convertToDecimal(getRegisterValue(registers, 4), getRegisterValue(registers, 5), 1.0)); // 功率
            data.put("energy", convertToDecimal(getRegisterValue(registers, 6), getRegisterValue(registers, 7), 0.01)); // 电能
            data.put("frequency", convertToDecimal(getRegisterValue(registers, 8), 0.01)); // 频率
            data.put("powerFactor", convertToDecimal(getRegisterValue(registers, 9), 0.001)); // 功率因数
        }
        
        return data;
    }
    
    /**
     * 读取储能设备数据
     */
    private Map<String, Object> readEnergyStorageData(ModbusTcpMaster client, int slaveId) 
            throws ExecutionException, InterruptedException, TimeoutException {
        Map<String, Object> data = new HashMap<>();
        
        ReadHoldingRegistersRequest request = new ReadHoldingRegistersRequest(0, 25);
        CompletableFuture<ReadHoldingRegistersResponse> future = 
                client.sendRequest(request, slaveId);
        
        ReadHoldingRegistersResponse response = future.get(readTimeout, TimeUnit.MILLISECONDS);
        
        var registers = response.getRegisters();
        if (registers.readableBytes() >= 50) { // 25个寄存器 * 2字节 = 50字节
            data.put("voltage", convertToDecimal(getRegisterValue(registers, 0), getRegisterValue(registers, 1), 0.1));
            data.put("current", convertToDecimal(getRegisterValue(registers, 2), getRegisterValue(registers, 3), 0.001));
            data.put("power", convertToDecimal(getRegisterValue(registers, 4), getRegisterValue(registers, 5), 1.0));
            data.put("soc", convertToDecimal(getRegisterValue(registers, 10), 0.1)); // 荷电状态
            data.put("temperature", convertToDecimal(getRegisterValue(registers, 11), 0.1)); // 温度
            data.put("statusCode", getRegisterValue(registers, 12)); // 状态代码
        }
        
        return data;
    }
    
    /**
     * 读取光伏板数据
     */
    private Map<String, Object> readSolarPanelData(ModbusTcpMaster client, int slaveId) 
            throws ExecutionException, InterruptedException, TimeoutException {
        Map<String, Object> data = new HashMap<>();
        
        ReadHoldingRegistersRequest request = new ReadHoldingRegistersRequest(0, 15);
        CompletableFuture<ReadHoldingRegistersResponse> future = 
                client.sendRequest(request, slaveId);
        
        ReadHoldingRegistersResponse response = future.get(readTimeout, TimeUnit.MILLISECONDS);
        
        var registers = response.getRegisters();
        if (registers.readableBytes() >= 30) { // 15个寄存器 * 2字节 = 30字节
            data.put("voltage", convertToDecimal(getRegisterValue(registers, 0), getRegisterValue(registers, 1), 0.1));
            data.put("current", convertToDecimal(getRegisterValue(registers, 2), getRegisterValue(registers, 3), 0.001));
            data.put("power", convertToDecimal(getRegisterValue(registers, 4), getRegisterValue(registers, 5), 1.0));
            data.put("temperature", convertToDecimal(getRegisterValue(registers, 8), 0.1));
        }
        
        return data;
    }
    
    /**
     * 读取逆变器数据
     */
    private Map<String, Object> readInverterData(ModbusTcpMaster client, int slaveId) 
            throws ExecutionException, InterruptedException, TimeoutException {
        Map<String, Object> data = new HashMap<>();
        
        ReadHoldingRegistersRequest request = new ReadHoldingRegistersRequest(0, 20);
        CompletableFuture<ReadHoldingRegistersResponse> future = 
                client.sendRequest(request, slaveId);
        
        ReadHoldingRegistersResponse response = future.get(readTimeout, TimeUnit.MILLISECONDS);
        
        var registers = response.getRegisters();
        if (registers.readableBytes() >= 40) { // 20个寄存器 * 2字节 = 40字节
            data.put("voltage", convertToDecimal(getRegisterValue(registers, 0), getRegisterValue(registers, 1), 0.1));
            data.put("current", convertToDecimal(getRegisterValue(registers, 2), getRegisterValue(registers, 3), 0.001));
            data.put("power", convertToDecimal(getRegisterValue(registers, 4), getRegisterValue(registers, 5), 1.0));
            data.put("frequency", convertToDecimal(getRegisterValue(registers, 8), 0.01));
            data.put("temperature", convertToDecimal(getRegisterValue(registers, 10), 0.1));
            data.put("statusCode", getRegisterValue(registers, 15));
        }
        
        return data;
    }
    
    /**
     * 读取风力发电机数据
     */
    private Map<String, Object> readWindTurbineData(ModbusTcpMaster client, int slaveId) 
            throws ExecutionException, InterruptedException, TimeoutException {
        Map<String, Object> data = new HashMap<>();
        
        ReadHoldingRegistersRequest request = new ReadHoldingRegistersRequest(0, 18);
        CompletableFuture<ReadHoldingRegistersResponse> future = 
                client.sendRequest(request, slaveId);
        
        ReadHoldingRegistersResponse response = future.get(readTimeout, TimeUnit.MILLISECONDS);
        
        var registers = response.getRegisters();
        if (registers.readableBytes() >= 36) { // 18个寄存器 * 2字节 = 36字节
            data.put("voltage", convertToDecimal(getRegisterValue(registers, 0), getRegisterValue(registers, 1), 0.1));
            data.put("current", convertToDecimal(getRegisterValue(registers, 2), getRegisterValue(registers, 3), 0.001));
            data.put("power", convertToDecimal(getRegisterValue(registers, 4), getRegisterValue(registers, 5), 1.0));
            data.put("windSpeed", convertToDecimal(getRegisterValue(registers, 10), 0.1)); // 风速
            data.put("temperature", convertToDecimal(getRegisterValue(registers, 11), 0.1));
            data.put("statusCode", getRegisterValue(registers, 15));
        }
        
        return data;
    }
    
    /**
     * 读取负荷控制器数据
     */
    private Map<String, Object> readLoadControllerData(ModbusTcpMaster client, int slaveId) 
            throws ExecutionException, InterruptedException, TimeoutException {
        Map<String, Object> data = new HashMap<>();
        
        ReadHoldingRegistersRequest request = new ReadHoldingRegistersRequest(0, 16);
        CompletableFuture<ReadHoldingRegistersResponse> future = 
                client.sendRequest(request, slaveId);
        
        ReadHoldingRegistersResponse response = future.get(readTimeout, TimeUnit.MILLISECONDS);
        
        var registers = response.getRegisters();
        if (registers.readableBytes() >= 32) { // 16个寄存器 * 2字节 = 32字节
            data.put("voltage", convertToDecimal(getRegisterValue(registers, 0), getRegisterValue(registers, 1), 0.1));
            data.put("current", convertToDecimal(getRegisterValue(registers, 2), getRegisterValue(registers, 3), 0.001));
            data.put("power", convertToDecimal(getRegisterValue(registers, 4), getRegisterValue(registers, 5), 1.0));
            data.put("frequency", convertToDecimal(getRegisterValue(registers, 8), 0.01));
            data.put("loadRate", convertToDecimal(getRegisterValue(registers, 10), 0.1)); // 负荷率
            data.put("statusCode", getRegisterValue(registers, 15));
        }
        
        return data;
    }
    
    /**
     * 读取通用设备数据
     */
    private Map<String, Object> readGenericDeviceData(ModbusTcpMaster client, int slaveId) 
            throws ExecutionException, InterruptedException, TimeoutException {
        Map<String, Object> data = new HashMap<>();
        
        ReadHoldingRegistersRequest request = new ReadHoldingRegistersRequest(0, 10);
        CompletableFuture<ReadHoldingRegistersResponse> future = 
                client.sendRequest(request, slaveId);
        
        ReadHoldingRegistersResponse response = future.get(readTimeout, TimeUnit.MILLISECONDS);
        
        var registers = response.getRegisters();
        if (registers.readableBytes() >= 20) { // 10个寄存器 * 2字节 = 20字节
            data.put("value1", getRegisterValue(registers, 0));
            data.put("value2", getRegisterValue(registers, 1));
            data.put("statusCode", getRegisterValue(registers, 9));
        }
        
        return data;
    }
    
    /**
     * 从ByteBuf中获取寄存器值
     */
    private int getRegisterValue(io.netty.buffer.ByteBuf byteBuf, int index) {
        if (index >= 0 && (index * 2 + 1) < byteBuf.readableBytes()) {
            return byteBuf.getUnsignedShort(index * 2);
        }
        return 0;
    }

    /**
     * 将Modbus寄存器值转换为BigDecimal
     */
    private BigDecimal convertToDecimal(int register, double scale) {
        return BigDecimal.valueOf(register * scale);
    }
    
    /**
     * 将两个Modbus寄存器值合并转换为BigDecimal（32位值）
     */
    private BigDecimal convertToDecimal(int highRegister, int lowRegister, double scale) {
        long value = ((long) highRegister << 16) | (lowRegister & 0xFFFF);
        return BigDecimal.valueOf(value * scale);
    }
    
    /**
     * 关闭所有连接
     */
    public void closeAllConnections() {
        clientCache.values().parallelStream().forEach(client -> {
            if (client != null) {
                try {
                    client.disconnect();
                } catch (Exception e) {
                    log.warn("关闭Modbus连接时出错: {}", e.getMessage());
                }
            }
        });
        clientCache.clear();
        log.info("已关闭所有Modbus连接");
    }
} 