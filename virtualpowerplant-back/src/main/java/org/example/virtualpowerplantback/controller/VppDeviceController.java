package org.example.virtualpowerplantback.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.virtualpowerplantback.dto.ApiResponse;
import org.example.virtualpowerplantback.dto.DeviceDTO;
import org.example.virtualpowerplantback.entity.DeviceData;
import org.example.virtualpowerplantback.entity.VppDevice;
import org.example.virtualpowerplantback.service.VppDeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 虚拟电厂设备控制器
 */
@RestController
@RequestMapping("/api/vpp/devices")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VppDeviceController {
    @Autowired
    private VppDeviceService vppDeviceService;
    
    /**
     * 获取所有设备列表
     */
    @GetMapping("/AllDevices")
    public ResponseEntity<ApiResponse<List<VppDevice>>> getAllDevices() {
        try {
            List<VppDevice> devices = vppDeviceService.getAllDevices();
            return ResponseEntity.ok(ApiResponse.success(devices));
        } catch (Exception e) {
            log.error("获取设备列表失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取设备列表失败: " + e.getMessage()));
        }
    }
    
    /**
     * 根据ID获取设备详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VppDevice>> getDeviceById(@PathVariable Long id) {
        try {
            Optional<VppDevice> device = vppDeviceService.getDeviceById(id);
            if (device.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(device.get()));
            } else {
                return ResponseEntity.ok(ApiResponse.error(404, "设备不存在"));
            }
        } catch (Exception e) {
            log.error("获取设备详情失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取设备详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 创建新设备
     */
    @PostMapping
    public ResponseEntity<ApiResponse<VppDevice>> createDevice(@Validated @RequestBody DeviceDTO deviceDTO) {
        try {
            VppDevice device = convertToEntity(deviceDTO);
            VppDevice savedDevice = vppDeviceService.saveDevice(device);
            return ResponseEntity.ok(ApiResponse.success("设备创建成功", savedDevice));
        } catch (Exception e) {
            log.error("创建设备失败", e);
            return ResponseEntity.ok(ApiResponse.error("创建设备失败: " + e.getMessage()));
        }
    }
    
    /**
     * 更新设备信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VppDevice>> updateDevice(
            @PathVariable Long id, 
            @Validated @RequestBody DeviceDTO deviceDTO) {
        try {
            deviceDTO.setId(id);
            VppDevice device = convertToEntity(deviceDTO);
            VppDevice updatedDevice = vppDeviceService.saveDevice(device);
            return ResponseEntity.ok(ApiResponse.success("设备更新成功", updatedDevice));
        } catch (Exception e) {
            log.error("更新设备失败", e);
            return ResponseEntity.ok(ApiResponse.error("更新设备失败: " + e.getMessage()));
        }
    }
    
    /**
     * 删除设备
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDevice(@PathVariable Long id) {
        try {
            vppDeviceService.deleteDevice(id);
            return ResponseEntity.ok(ApiResponse.success("设备删除成功", null));
        } catch (Exception e) {
            log.error("删除设备失败", e);
            return ResponseEntity.ok(ApiResponse.error("删除设备失败: " + e.getMessage()));
        }
    }
    
    /**
     * 测试设备连接
     */
    @PostMapping("/{id}/test")
    public ResponseEntity<ApiResponse<Boolean>> testDeviceConnection(@PathVariable Long id) {
        try {
            boolean connected = vppDeviceService.testDeviceConnection(id);
            String message = connected ? "设备连接成功" : "设备连接失败";
            return ResponseEntity.ok(ApiResponse.success(message, connected));
        } catch (Exception e) {
            log.error("测试设备连接失败", e);
            return ResponseEntity.ok(ApiResponse.error("测试设备连接失败: " + e.getMessage()));
        }
    }
    
    /**
     * 手动读取设备数据
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<DeviceData>> readDeviceData(@PathVariable Long id) {
        try {
            DeviceData data = vppDeviceService.readDeviceData(id);
            return ResponseEntity.ok(ApiResponse.success("读取设备数据成功", data));
        } catch (Exception e) {
            log.error("读取设备数据失败", e);
            return ResponseEntity.ok(ApiResponse.error("读取设备数据失败: " + e.getMessage()));
        }
    }
    
    /**
     * 启用/禁用设备
     */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleDeviceStatus(
            @PathVariable Long id, 
            @RequestParam boolean enabled) {
        try {
            vppDeviceService.toggleDeviceStatus(id, enabled);
            String message = enabled ? "设备已启用" : "设备已禁用";
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (Exception e) {
            log.error("切换设备状态失败", e);
            return ResponseEntity.ok(ApiResponse.error("切换设备状态失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取设备历史数据
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<DeviceData>>> getDeviceHistoryData(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        try {
            List<DeviceData> historyData = vppDeviceService.getDeviceHistoryData(id, startTime, endTime);
            return ResponseEntity.ok(ApiResponse.success(historyData));
        } catch (Exception e) {
            log.error("获取设备历史数据失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取设备历史数据失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取设备最新数据
     */
    @GetMapping("/{id}/latest")
    public ResponseEntity<ApiResponse<DeviceData>> getLatestDeviceData(@PathVariable Long id) {
        try {
            DeviceData latestData = vppDeviceService.getLatestDeviceData(id);
            return ResponseEntity.ok(ApiResponse.success(latestData));
        } catch (Exception e) {
            log.error("获取设备最新数据失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取设备最新数据失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取所有设备的最新数据
     */
    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<DeviceData>>> getAllLatestData() {
        try {
            List<DeviceData> allLatestData = vppDeviceService.getAllLatestData();
            return ResponseEntity.ok(ApiResponse.success(allLatestData));
        } catch (Exception e) {
            log.error("获取所有设备最新数据失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取所有设备最新数据失败: " + e.getMessage()));
        }
    }
    
    /**
     * 转换DTO为实体
     */
    private VppDevice convertToEntity(DeviceDTO dto) {
        VppDevice device = new VppDevice();
        device.setId(dto.getId());
        device.setName(dto.getName());
        device.setIpAddress(dto.getIpAddress());
        device.setPort(dto.getPort());
        device.setSlaveId(dto.getSlaveId());
        device.setDeviceType(dto.getDeviceType());
        device.setEnabled(dto.getEnabled());
        device.setDescription(dto.getDescription());
        
        if (dto.getStatus() != null) {
            device.setStatus(dto.getStatus());
        }
        
        return device;
    }
} 