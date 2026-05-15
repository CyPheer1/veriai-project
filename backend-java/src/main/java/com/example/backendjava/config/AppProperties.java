package com.example.backendjava.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();
    private Quota quota = new Quota();
    private AiService aiService = new AiService();
    private Internal internal = new Internal();
    private Billing billing = new Billing();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long expirationSeconds = 86400;
    }

    @Getter
    @Setter
    public static class Cors {
        private String allowedOrigins = "http://localhost:3000";
    }

    @Getter
    @Setter
    public static class Quota {
        private int freeDailyCredits = 3000;
        private int freeTextWordLimit = 1000;
        private int premiumMonthlyPriceUsd = 10;
    }

    @Getter
    @Setter
    public static class AiService {
        private String baseUrl = "http://localhost:8000";
        private String enqueuePath = "/internal/v1/analyze";
    }

    @Getter
    @Setter
    public static class Internal {
        private String serviceToken = "change-me-internal-token";
    }

    @Getter
    @Setter
    public static class Billing {
        private boolean enabled = false;
        private boolean directUpgradeEnabled = false;
        private String stripeSecretKey;
        private String stripeWebhookSecret;
        private String stripePriceId;
        private String checkoutMode = "payment";
        private String appPublicUrl = "http://localhost:3000";
        private String successPath = "/billing/success";
        private String cancelPath = "/billing/cancel";
    }
}
