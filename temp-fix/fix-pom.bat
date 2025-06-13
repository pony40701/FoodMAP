@echo off
echo 正在修復 pom.xml 檔案...
cd /d C:\Users\saucy\Desktop\FoodMAP\backend

echo ^<?xml version="1.0" encoding="UTF-8"?^>> pom_fixed.xml
echo ^<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">> pom_fixed.xml
echo          xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd"^>> pom_fixed.xml
echo     ^<modelVersion^>4.0.0^</modelVersion^>> pom_fixed.xml
echo     ^<parent^>> pom_fixed.xml
echo         ^<groupId^>org.springframework.boot^</groupId^>> pom_fixed.xml
echo         ^<artifactId^>spring-boot-starter-parent^</artifactId^>> pom_fixed.xml
echo         ^<version^>2.7.13^</version^>> pom_fixed.xml
echo         ^<relativePath/^> ^<!-- lookup parent from repository --^>> pom_fixed.xml
echo     ^</parent^>> pom_fixed.xml
echo     ^<groupId^>com.foodmap^</groupId^>> pom_fixed.xml
echo     ^<artifactId^>backend^</artifactId^>> pom_fixed.xml
echo     ^<version^>0.0.1-SNAPSHOT^</version^>> pom_fixed.xml
echo     ^<name^>FoodMAP Backend^</name^>> pom_fixed.xml
echo     ^<description^>Spring Boot Backend for FoodMAP^</description^>> pom_fixed.xml
echo     ^<properties^>> pom_fixed.xml
echo         ^<java.version^>11^</java.version^>> pom_fixed.xml
echo     ^</properties^>> pom_fixed.xml
echo.>> pom_fixed.xml
echo     ^<dependencies^>> pom_fixed.xml
echo         ^<!-- Spring Boot 核心依賴 --^>> pom_fixed.xml
echo         ^<dependency^>> pom_fixed.xml
echo             ^<groupId^>org.springframework.boot^</groupId^>> pom_fixed.xml
echo             ^<artifactId^>spring-boot-starter-web^</artifactId^>> pom_fixed.xml
echo         ^</dependency^>> pom_fixed.xml
echo         ^<dependency^>> pom_fixed.xml
echo             ^<groupId^>org.springframework.boot^</groupId^>> pom_fixed.xml
echo             ^<artifactId^>spring-boot-starter-data-jpa^</artifactId^>> pom_fixed.xml
echo         ^</dependency^>> pom_fixed.xml
echo         ^<!-- MySQL 連接器 --^>> pom_fixed.xml
echo         ^<dependency^>> pom_fixed.xml
echo             ^<groupId^>mysql^</groupId^>> pom_fixed.xml
echo             ^<artifactId^>mysql-connector-java^</artifactId^>> pom_fixed.xml
echo             ^<version^>8.0.28^</version^>> pom_fixed.xml
echo         ^</dependency^>> pom_fixed.xml
echo         ^<!-- Spring Boot 安全框架 --^>> pom_fixed.xml
echo         ^<dependency^>> pom_fixed.xml
echo             ^<groupId^>org.springframework.boot^</groupId^>> pom_fixed.xml
echo             ^<artifactId^>spring-boot-starter-security^</artifactId^>> pom_fixed.xml
echo         ^</dependency^>> pom_fixed.xml
echo         ^<!-- JSON Web Token --^>> pom_fixed.xml
echo         ^<dependency^>> pom_fixed.xml
echo             ^<groupId^>io.jsonwebtoken^</groupId^>> pom_fixed.xml
echo             ^<artifactId^>jjwt-api^</artifactId^>> pom_fixed.xml
echo             ^<version^>0.11.5^</version^>> pom_fixed.xml
echo         ^</dependency^>> pom_fixed.xml
echo         ^<dependency^>> pom_fixed.xml
echo             ^<groupId^>io.jsonwebtoken^</groupId^>> pom_fixed.xml
echo             ^<artifactId^>jjwt-impl^</artifactId^>> pom_fixed.xml
echo             ^<version^>0.11.5^</version^>> pom_fixed.xml
echo             ^<scope^>runtime^</scope^>> pom_fixed.xml
echo         ^</dependency^>> pom_fixed.xml
echo         ^<dependency^>> pom_fixed.xml
echo             ^<groupId^>io.jsonwebtoken^</groupId^>> pom_fixed.xml
echo             ^<artifactId^>jjwt-jackson^</artifactId^>> pom_fixed.xml
echo             ^<version^>0.11.5^</version^>> pom_fixed.xml
echo             ^<scope^>runtime^</scope^>> pom_fixed.xml
echo         ^</dependency^>> pom_fixed.xml
echo         ^<!-- Lombok --^>> pom_fixed.xml
echo         ^<dependency^>> pom_fixed.xml
echo             ^<groupId^>org.projectlombok^</groupId^>> pom_fixed.xml
echo             ^<artifactId^>lombok^</artifactId^>> pom_fixed.xml
echo             ^<optional^>true^</optional^>> pom_fixed.xml
echo         ^</dependency^>> pom_fixed.xml
echo         ^<!-- Spring Boot Devtools --^>> pom_fixed.xml
echo         ^<dependency^>> pom_fixed.xml
echo             ^<groupId^>org.springframework.boot^</groupId^>> pom_fixed.xml
echo             ^<artifactId^>spring-boot-devtools^</artifactId^>> pom_fixed.xml
echo             ^<scope^>runtime^</scope^>> pom_fixed.xml
echo             ^<optional^>true^</optional^>> pom_fixed.xml
echo         ^</dependency^>> pom_fixed.xml
echo         ^<!-- Spring Boot 測試 --^>> pom_fixed.xml
echo         ^<dependency^>> pom_fixed.xml
echo             ^<groupId^>org.springframework.boot^</groupId^>> pom_fixed.xml
echo             ^<artifactId^>spring-boot-starter-test^</artifactId^>> pom_fixed.xml
echo             ^<scope^>test^</scope^>> pom_fixed.xml
echo         ^</dependency^>> pom_fixed.xml
echo         ^<dependency^>> pom_fixed.xml
echo             ^<groupId^>org.springframework.security^</groupId^>> pom_fixed.xml
echo             ^<artifactId^>spring-security-test^</artifactId^>> pom_fixed.xml
echo             ^<scope^>test^</scope^>> pom_fixed.xml
echo         ^</dependency^>> pom_fixed.xml
echo     ^</dependencies^>> pom_fixed.xml
echo.>> pom_fixed.xml
echo     ^<build^>> pom_fixed.xml
echo         ^<plugins^>> pom_fixed.xml
echo             ^<plugin^>> pom_fixed.xml
echo                 ^<groupId^>org.springframework.boot^</groupId^>> pom_fixed.xml
echo                 ^<artifactId^>spring-boot-maven-plugin^</artifactId^>> pom_fixed.xml
echo                 ^<configuration^>> pom_fixed.xml
echo                     ^<excludes^>> pom_fixed.xml
echo                         ^<exclude^>> pom_fixed.xml
echo                             ^<groupId^>org.projectlombok^</groupId^>> pom_fixed.xml
echo                             ^<artifactId^>lombok^</artifactId^>> pom_fixed.xml
echo                         ^</exclude^>> pom_fixed.xml
echo                     ^</excludes^>> pom_fixed.xml
echo                 ^</configuration^>> pom_fixed.xml
echo             ^</plugin^>> pom_fixed.xml
echo         ^</plugins^>> pom_fixed.xml
echo     ^</build^>> pom_fixed.xml
echo ^</project^>> pom_fixed.xml

del pom.xml
rename pom_fixed.xml pom.xml

echo pom.xml 檔案已修復完成！
pause 