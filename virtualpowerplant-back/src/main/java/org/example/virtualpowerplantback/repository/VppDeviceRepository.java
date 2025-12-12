package org.example.virtualpowerplantback.repository;

import org.example.virtualpowerplantback.entity.VppDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 虚拟电厂设备Repository
 */
@Repository
public interface VppDeviceRepository extends JpaRepository<VppDevice, Long> {
    
    /**
     * 根据IP地址查找设备
     */
    Optional<VppDevice> findByIpAddress(String ipAddress);
    
    /**
     * 根据设备类型查找设备
     */
    List<VppDevice> findByDeviceType(VppDevice.DeviceType deviceType);
    
    /**
     * 查找已启用的设备
     */
    List<VppDevice> findByEnabledTrue();
    
    /**
     * 根据状态查找设备
     */
    List<VppDevice> findByStatus(VppDevice.DeviceStatus status);
    
    /**
     * 查找在线且启用的设备
     */
    @Query("SELECT d FROM VppDevice d WHERE d.enabled = true AND d.status = 'ONLINE'")
    List<VppDevice> findActiveDevices();
    
    /**
     * 根据IP地址和端口查找设备
     */
    Optional<VppDevice> findByIpAddressAndPort(String ipAddress, Integer port);
} 