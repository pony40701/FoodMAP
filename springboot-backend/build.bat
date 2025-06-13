@echo off
echo =====================================================
echo 正在建立 FoodMAP 後端服務...
echo =====================================================

echo 檢查 Java 環境...
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 錯誤: Java 未安裝或不在 PATH 中。請安裝 Java 11 或更高版本。
    pause
    exit /b 1
)

echo 檢查 Maven 環境...
call mvn -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Maven 未安裝，將使用內建的 Maven Wrapper...
    
    if not exist "mvnw.cmd" (
        echo 正在設置 Maven Wrapper...
        call mvn wrapper:wrapper
    )
    
    set MVN_CMD=mvnw.cmd
) else (
    set MVN_CMD=mvn
)

echo 正在清理和構建專案...
call %MVN_CMD% clean package -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo 構建失敗，請檢查錯誤信息。
    pause
    exit /b 1
)

echo 專案構建成功！
echo 啟動應用程式...
java -jar target/backend-0.0.1-SNAPSHOT.jar

pause 