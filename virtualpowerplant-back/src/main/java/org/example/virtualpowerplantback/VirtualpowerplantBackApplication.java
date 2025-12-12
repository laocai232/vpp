package org.example.virtualpowerplantback;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class VirtualpowerplantBackApplication {

    public static void main(String[] args) {
        System.out.println("虚拟电厂后端系统启动中...");
        System.out.println("支持Modbus协议的设备数据采集");
        System.out.println("访问地址: http://localhost:8080");
        SpringApplication.run(VirtualpowerplantBackApplication.class, args);
        System.out.println("虚拟电厂后端系统启动成功！");
    }

}
