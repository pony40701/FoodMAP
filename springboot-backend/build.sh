#!/bin/bash
echo "====================================================="
echo "正在建立 FoodMAP 後端服務..."
echo "====================================================="

echo "檢查 Java 環境..."
if ! command -v java &> /dev/null; then
    echo "錯誤: Java 未安裝。請安裝 Java 11 或更高版本。"
    exit 1
fi

echo "檢查 Maven 環境..."
if ! command -v mvn &> /dev/null; then
    echo "Maven 未安裝，將使用內建的 Maven Wrapper..."
    
    if [ ! -f "./mvnw" ]; then
        echo "正在設置 Maven Wrapper..."
        mvn wrapper:wrapper
    fi
    
    MVN_CMD="./mvnw"
else
    MVN_CMD="mvn"
fi

echo "正在清理和構建專案..."
$MVN_CMD clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "構建失敗，請檢查錯誤信息。"
    exit 1
fi

echo "專案構建成功！"
echo "啟動應用程式..."
java -jar target/backend-0.0.1-SNAPSHOT.jar 