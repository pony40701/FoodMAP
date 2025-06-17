package com.example.demo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI foodMapAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FoodMap API")
                        .description("FoodMap 後端 API 文檔")
                        .version("1.0"));
    }
}
