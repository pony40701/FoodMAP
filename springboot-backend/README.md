# FoodMAP 後端服務

這是 FoodMAP 專案的後端服務，使用 Spring Boot + Spring MVC + Spring Data JPA 開發。本服務負責處理前端 index.html 的登入請求，並與雲端 MySQL 資料庫連接。

## 環境需求

- Java 11 或更高版本
- Maven 3.6 或更高版本 (或使用內建的 Maven Wrapper)
- MySQL 資料庫 (已設定連接到雲端資料庫)

## 專案狀態

✅ 已完成：
- 完整的 Spring Boot 專案結構搭建
- 資料庫連接配置
- 實體類定義 (User, UserProfile 等)
- 登入 API 實作
- JWT 令牌認證機制
- 跨域請求處理
- 安全性配置

## 快速開始

### Windows 平台

1. 確保已安裝 Java 11 或更高版本
2. 開啟命令提示字元，進入專案目錄
3. 執行 `build.bat` 構建並啟動應用程式

```
cd springboot-backend
build.bat
```

### Linux/Mac 平台

1. 確保已安裝 Java 11 或更高版本
2. 開啟終端機，進入專案目錄
3. 執行以下命令構建並啟動應用程式

```
cd springboot-backend
chmod +x build.sh
./build.sh
```

## API 端點

### 登入 API

- URL: `/api/auth/login`
- 方法: `POST`
- 請求體:

```json
{
  "email": "用戶電子郵件",
  "password": "用戶密碼"
}
```

- 成功響應 (200 OK):

```json
{
  "success": true,
  "message": "登入成功",
  "token": "JWT令牌",
  "user": {
    "id": 1,
    "name": "用戶名稱",
    "email": "用戶電子郵件",
    "avatarUrl": "頭像URL"
  }
}
```

- 失敗響應 (401 Unauthorized):

```json
{
  "success": false,
  "message": "帳號或密碼錯誤",
  "token": null,
  "user": null
}
```

## 配置說明

資料庫和其他配置位於 `src/main/resources/application.properties` 文件。

```properties
# 資料庫連接設定
spring.datasource.url=jdbc:mysql://34.80.228.222:3306/foodmap_shrshengfake?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
spring.datasource.username=testuser
spring.datasource.password=12345678
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

## 前端整合

確保前端 `js/login.js` 文件中的 `API_BASE_URL` 變量設置為正確的後端服務地址：

```js
const API_BASE_URL = 'http://localhost:8080/api';
```

## 問題排解

如果遇到問題:

1. 確認 Java 版本是否為 11 或更高
2. 確認 Maven 是否正確安裝
3. 檢查資料庫連接配置是否正確
4. 檢查構建過程中的錯誤訊息
5. 若遇到 getter/setter 相關錯誤，請確認 Lombok 是否正常工作，或使用手動添加的 getter/setter 方法 