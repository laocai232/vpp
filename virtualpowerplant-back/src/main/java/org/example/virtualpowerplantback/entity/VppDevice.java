package org.example.virtualpowerplantback.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 虚拟电厂设备实体
 */
@Entity
@Table(name = "vpp_device")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VppDevice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 设备名称
     */
    @Column(nullable = false, length = 100)
    private String name;
    
    /**
     * 设备IP地址
     */
    @Column(nullable = false, length = 50)
    private String ipAddress;
    
    /**
     * Modbus端口
     */
    @Column(nullable = false)
    private Integer port = 502;
    
    /**
     * Modbus从站ID
     */
    @Column(nullable = false)
    private Integer slaveId = 1;
    
    /**
     * 设备类型
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceType deviceType;
    
    /**
     * 设备状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceStatus status = DeviceStatus.OFFLINE;
    
    /**
     * 是否启用
     */
    @Column(nullable = false)
    private Boolean enabled = true;
    
    /**
     * 设备描述
     */
    @Column(length = 500)
    private String description;
    
    /**
     * 最后通信时间
     */
    private LocalDateTime lastCommunicationTime;
    
    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    @UpdateTimestamp
    private LocalDateTime updateTime;
    
    /**
     * 设备类型枚举
     */
    public enum DeviceType {
        ELECTRIC_METER("电表"),
        ENERGY_STORAGE("储能设备"),
        SOLAR_PANEL("光伏板"),
        WIND_TURBINE("风力发电机"),
        LOAD_CONTROLLER("负荷控制器"),
        INVERTER("逆变器");
        
        private final String description;
        
        DeviceType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    /**
     * 设备状态枚举
     */
    public enum DeviceStatus {
        ONLINE("在线"),
        OFFLINE("离线"),
        ERROR("故障"),
        MAINTENANCE("维护中");
        
        private final String description;
        
        DeviceStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
} 