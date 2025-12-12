package org.example.virtualpowerplantback.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 设备数据实体
 */
@Entity
@Table(name = "device_data", indexes = {
    @Index(name = "idx_device_id", columnList = "device_id"),
    @Index(name = "idx_collect_time", columnList = "collect_time")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 关联设备ID
     */
    @Column(name = "device_id", nullable = false)
    private Long deviceId;
    
    /**
     * 设备名称（冗余字段，便于查询）
     */
    @Column(name = "device_name", length = 100)
    private String deviceName;
    
    /**
     * 电压 (V)
     */
    @Column(precision = 10, scale = 2)
    private BigDecimal voltage;
    
    /**
     * 电流 (A)
     */
    @Column(precision = 10, scale = 3)
    private BigDecimal current;
    
    /**
     * 功率 (W)
     */
    @Column(precision = 15, scale = 2)
    private BigDecimal power;
    
    /**
     * 电能 (MWh)
     */
    @Column(precision = 15, scale = 3)
    private BigDecimal energy;
    
    /**
     * 频率 (Hz)
     */
    @Column(precision = 6, scale = 2)
    private BigDecimal frequency;
    
    /**
     * 功率因数
     */
    @Column(precision = 4, scale = 3)
    private BigDecimal powerFactor;
    
    /**
     * 温度 (°C)
     */
    @Column(precision = 5, scale = 2)
    private BigDecimal temperature;
    
    /**
     * SOC - 电池荷电状态 (%)
     */
    @Column(precision = 5, scale = 2)
    private BigDecimal soc;
    
    /**
     * 设备状态代码
     */
    private Integer statusCode;
    
    /**
     * 原始数据（JSON格式）
     */
    @Column(columnDefinition = "TEXT")
    private String rawData;
    
    /**
     * 数据采集时间
     */
    @Column(name = "collect_time", nullable = false)
    private LocalDateTime collectTime;
    
    /**
     * 数据创建时间
     */
    @CreationTimestamp
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;
} 