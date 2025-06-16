package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/db-monitor")
public class DatabaseMonitorController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/pool-stats")
    public ResponseEntity<?> getPoolStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            if (dataSource instanceof HikariDataSource) {
                HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
                HikariPoolMXBean poolMXBean = hikariDataSource.getHikariPoolMXBean();
                
                stats.put("activeConnections", poolMXBean.getActiveConnections());
                stats.put("idleConnections", poolMXBean.getIdleConnections());
                stats.put("totalConnections", poolMXBean.getTotalConnections());
                stats.put("threadsAwaitingConnection", poolMXBean.getThreadsAwaitingConnection());
                stats.put("maximumPoolSize", hikariDataSource.getMaximumPoolSize());
                stats.put("minimumIdle", hikariDataSource.getMinimumIdle());
                stats.put("connectionTimeout", hikariDataSource.getConnectionTimeout());
                stats.put("idleTimeout", hikariDataSource.getIdleTimeout());
                stats.put("maxLifetime", hikariDataSource.getMaxLifetime());
                stats.put("validationTimeout", hikariDataSource.getValidationTimeout());
                stats.put("leakDetectionThreshold", hikariDataSource.getLeakDetectionThreshold());
                stats.put("poolName", hikariDataSource.getPoolName());
                stats.put("jdbcUrl", hikariDataSource.getJdbcUrl());
                stats.put("username", hikariDataSource.getUsername());
                stats.put("driverClassName", hikariDataSource.getDriverClassName());
                
                return ResponseEntity.ok(stats);
            } else {
                stats.put("error", "Not a HikariDataSource");
                stats.put("dataSourceClass", dataSource.getClass().getName());
                return ResponseEntity.ok(stats);
            }
        } catch (Exception e) {
            stats.put("error", e.getMessage());
            stats.put("stackTrace", e.getStackTrace());
            return ResponseEntity.status(500).body(stats);
        }
    }
    
    @GetMapping("/reset-pool")
    public ResponseEntity<?> resetPool() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (dataSource instanceof HikariDataSource) {
                HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
                
                // 關閉連接池
                hikariDataSource.close();
                
                // 等待一段時間
                Thread.sleep(1000);
                
                // 重新初始化連接池
                hikariDataSource.getConnection().close();
                
                result.put("success", true);
                result.put("message", "連接池已重置");
                return ResponseEntity.ok(result);
            } else {
                result.put("success", false);
                result.put("error", "Not a HikariDataSource");
                result.put("dataSourceClass", dataSource.getClass().getName());
                return ResponseEntity.ok(result);
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("stackTrace", e.getStackTrace());
            return ResponseEntity.status(500).body(result);
        }
    }
} 