package org.example.virtualpowerplantback.repository;

import org.example.virtualpowerplantback.entity.DeviceData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 设备数据Repository
 */
@Repository
public interface DeviceDataRepository extends JpaRepository<DeviceData, Long> {
    
    /**
     * 根据设备ID查找数据
     */
    List<DeviceData> findByDeviceIdOrderByCollectTimeDesc(Long deviceId);
    
    /**
     * 根据设备ID和时间范围查找数据
     */
    @Query("SELECT d FROM DeviceData d WHERE d.deviceId = :deviceId " +
           "AND d.collectTime BETWEEN :startTime AND :endTime " +
           "ORDER BY d.collectTime DESC")
    List<DeviceData> findByDeviceIdAndTimeRange(@Param("deviceId") Long deviceId,
                                               @Param("startTime") LocalDateTime startTime,
                                               @Param("endTime") LocalDateTime endTime);
    
    /**
     * 获取设备最新数据
     */
    @Query("SELECT d FROM DeviceData d WHERE d.deviceId = :deviceId " +
           "ORDER BY d.collectTime DESC LIMIT 1")
    DeviceData findLatestDataByDeviceId(@Param("deviceId") Long deviceId);
    
    /**
     * 获取所有设备的最新数据
     */
    @Query("SELECT d FROM DeviceData d WHERE d.id IN " +
           "(SELECT MAX(d2.id) FROM DeviceData d2 GROUP BY d2.deviceId)")
    List<DeviceData> findLatestDataForAllDevices();
    
    /**
     * 根据时间范围查找数据
     */
    List<DeviceData> findByCollectTimeBetweenOrderByCollectTimeDesc(LocalDateTime startTime, 
                                                                   LocalDateTime endTime);
    
    /**
     * 删除指定时间之前的历史数据
     */
    void deleteByCollectTimeBefore(LocalDateTime beforeTime);
} 