# 虚拟电厂后端系统

这是一个基于Spring Boot的虚拟电厂后端系统，支持通过Modbus协议获取各种电力设备的数据。

## 功能特性

- 🔌 **Modbus TCP协议支持** - 与真实的电力设备通信
- 📊 **多种设备类型支持** - 电表、储能设备、光伏板、逆变器、风机、负荷控制器
- 🎯 **模拟模式** - 在没有真实设备时可以模拟数据
- ⏰ **定时数据采集** - 自动定时采集所有启用设备的数据
- 💾 **数据存储** - 将采集的数据存储到MySQL数据库
- 🌐 **RESTful API** - 提供完整的API接口
- 🏥 **设备管理** - 设备的增删改查、启用禁用、连接测试

## 技术栈

- **后端框架**: Spring Boot 3.5.3
- **数据库**: MySQL
- **Modbus库**: digitalpetri modbus-master-tcp
- **ORM**: Spring Data JPA
- **构建工具**: Maven
- **Java版本**: 17

## 快速开始

### 1. 环境准备

确保你的系统已安装：
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### 2. 数据库配置

创建数据库：
```sql
CREATE DATABASE vpp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 配置文件

在 `src/main/resources/application.yml` 中配置数据库连接：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/vpp_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
```

### 4. 启动应用

```bash
# 编译项目
mvn clean compile

# 启动应用
mvn spring-boot:run
```

访问 `http://localhost:8080` 确认服务启动成功。

## 配置说明

### 虚拟电厂配置 (`application.yml`)

```yaml
vpp:
  modbus:
    connect-timeout: 5000      # 连接超时时间（毫秒）
    read-timeout: 3000         # 读取超时时间（毫秒）  
    collection-interval: 30    # 数据采集间隔（秒）
    simulation-mode: true      # 模拟模式开关
```

**重要：** 
- `simulation-mode: true` - 使用模拟数据，适合开发和演示
- `simulation-mode: false` - 连接真实Modbus设备

## API 接口

### 设备管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/vpp/devices` | 获取所有设备列表 |
| GET | `/api/vpp/devices/{id}` | 获取设备详情 |
| POST | `/api/vpp/devices` | 创建新设备 |
| PUT | `/api/vpp/devices/{id}` | 更新设备信息 |
| DELETE | `/api/vpp/devices/{id}` | 删除设备 |
| POST | `/api/vpp/devices/{id}/test` | 测试设备连接 |
| POST | `/api/vpp/devices/{id}/read` | 手动读取设备数据 |
| PUT | `/api/vpp/devices/{id}/toggle?enabled=true` | 启用/禁用设备 |

### 数据查询

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/vpp/devices/{id}/latest` | 获取设备最新数据 |
| GET | `/api/vpp/devices/latest` | 获取所有设备最新数据 |
| GET | `/api/vpp/devices/{id}/history` | 获取设备历史数据 |

### 创建设备示例

```json
{
  "name": "测试电表001",
  "ipAddress": "192.168.1.100",
  "port": 502,
  "slaveId": 1,
  "deviceType": "ELECTRIC_METER",
  "enabled": true,
  "description": "主配电箱智能电表"
}
```

### 设备类型

- `ELECTRIC_METER` - 智能电表
- `ENERGY_STORAGE` - 储能设备  
- `SOLAR_PANEL` - 光伏板
- `INVERTER` - 逆变器
- `WIND_TURBINE` - 风力发电机
- `LOAD_CONTROLLER` - 负荷控制器

## 真实设备接入

当你有真实的Modbus设备时：

1. **修改配置**
   ```yaml
   vpp:
     modbus:
       simulation-mode: false  # 关闭模拟模式
   ```

2. **添加设备**
   通过API或直接在数据库中添加真实设备的IP地址和端口

3. **寄存器映射**
   根据设备文档修改 `ModbusService.java` 中的寄存器映射关系

4. **测试连接**
   使用 `/api/vpp/devices/{id}/test` 接口测试设备连接

## 数据模拟

系统内置了智能的数据模拟器：

- **电表**: 模拟真实的电压、电流、功率等参数
- **储能设备**: 模拟SOC、充放电状态、温度等
- **光伏板**: 根据时间模拟日照变化对发电量的影响
- **风机**: 模拟风速变化对发电的影响
- **逆变器**: 模拟电力转换相关参数

## 定时采集

系统会自动定时采集所有启用设备的数据：
- 默认间隔：30秒（可配置）
- 数据自动存储到数据库
- 支持历史数据查询
- 自动清理30天前的历史数据

## 部署

### Docker部署

项目包含 `compose.yaml` 文件，可以使用Docker Compose部署：

```bash
docker-compose up -d
```

### 生产环境

1. 修改数据库配置为生产环境
2. 设置合适的日志级别
3. 配置真实设备的IP地址
4. 关闭模拟模式

## 常见问题

### Q: 如何连接真实Modbus设备？
A: 修改 `simulation-mode: false`，然后添加设备的真实IP地址和端口。

### Q: 如何修改数据采集频率？
A: 修改配置文件中的 `collection-interval` 参数（单位：秒）。

### Q: 数据库表是如何创建的？
A: 使用JPA自动建表，启动时会根据实体类自动创建表结构。

### Q: 如何自定义寄存器映射？
A: 修改 `ModbusService.java` 中对应设备类型的读取方法。

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License 