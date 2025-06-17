package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 將 /uploads/** 映射到本地硬碟的 uploads/ 資料夾
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
