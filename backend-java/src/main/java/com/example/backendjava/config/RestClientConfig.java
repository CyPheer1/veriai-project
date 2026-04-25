package com.example.backendjava.config;

import java.net.http.HttpClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient restClient(RestClient.Builder builder) {
        // Force HTTP/1.1 — uvicorn does not support HTTP/2 (h2c)
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();
        return builder
                .requestFactory(new JdkClientHttpRequestFactory(httpClient))
                .build();
    }
}
