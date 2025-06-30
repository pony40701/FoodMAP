package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置靜態資源處理
        registry.addResourceHandler("/**")
                .addResourceLocations("file:./", "file:../../../")
                .setCachePeriod(0); // 禁用快取以便開發
        
        // 特別處理 CSS、JS、圖片等資源
        registry.addResourceHandler("/css/**")
                .addResourceLocations("file:./css/", "file:../../../css/")
                .setCachePeriod(0);
                
        registry.addResourceHandler("/js/**")
                .addResourceLocations("file:./js/", "file:../../../js/")
                .setCachePeriod(0);
                
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:./images/", "file:../../../images/")
                .setCachePeriod(0);
    }
}
