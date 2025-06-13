#!/bin/bash

# 停止任何正在運行的應用程序
echo "正在停止現有應用程序..."
fuser -k 8080/tcp 2>/dev/null || true

# 清理並構建應用程序
echo "正在構建應用程序..."
cd "$(dirname "$0")"
mvn clean package -DskipTests

# 運行應用程序
echo "正在啟動應用程序..."
java -jar target/backend-0.0.1-SNAPSHOT.jar 