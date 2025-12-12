package org.example.virtualpowerplantback.dto;

import lombok.Data;
import org.example.virtualpowerplantback.entity.VppDevice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * 设备数据传输对象
 */
@Data
public class DeviceDTO {
    
    private Long id;
    
    @NotBlank(message = "设备名称不能为空")
    private String name;
    
    @NotBlank(message = "IP地址不能为空")
    private String ipAddress;
    
    @NotNull(message = "端口不能为空")
    @Min(value = 1, message = "端口号必须大于0")
    @Max(value = 65535, message = "端口号不能超过65535")
    private Integer port = 502;
    
    @NotNull(message = "从站ID不能为空")
    @Min(value = 1, message = "从站ID必须大于0")
    @Max(value = 255, message = "从站ID不能超过255")
    private Integer slaveId = 1;
    
    @NotNull(message = "设备类型不能为空")
    private VppDevice.DeviceType deviceType;
    
    private VppDevice.DeviceStatus status;
    
    private Boolean enabled = true;
    
    private String description;
} 