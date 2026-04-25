package com.example.backendjava.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI veriAiOpenApi() {
        return new OpenAPI()
                .info(new Info().title("VeriAI Backend API").version("v1").description("JWT-protected API for VeriAI"))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .schemaRequirement(
                        "bearerAuth",
                        new SecurityScheme()
                                .name("Authorization")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                );
    }
}
