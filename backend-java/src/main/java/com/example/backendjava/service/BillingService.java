package com.example.backendjava.service;

import com.example.backendjava.config.AppProperties;
import com.example.backendjava.dto.billing.CheckoutSessionResponse;
import com.example.backendjava.entity.User;
import com.example.backendjava.entity.UserPlan;
import com.example.backendjava.exception.ApiException;
import com.example.backendjava.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
@RequiredArgsConstructor
public class BillingService {

    private static final String STRIPE_CHECKOUT_SESSION_URL = "https://api.stripe.com/v1/checkout/sessions";
    private static final long WEBHOOK_TOLERANCE_SECONDS = 300;

    private final AppProperties appProperties;
    private final UserRepository userRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public CheckoutSessionResponse createCheckoutSession(String email) {
        AppProperties.Billing billing = appProperties.getBilling();
        ensureCheckoutConfigured(billing);

        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getPlan() == UserPlan.PRO) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Account is already Premium");
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("mode", normalizeCheckoutMode(billing.getCheckoutMode()));
        form.add("line_items[0][price]", billing.getStripePriceId());
        form.add("line_items[0][quantity]", "1");
        form.add("success_url", buildReturnUrl(billing.getAppPublicUrl(), billing.getSuccessPath(), true));
        form.add("cancel_url", buildReturnUrl(billing.getAppPublicUrl(), billing.getCancelPath(), false));
        form.add("client_reference_id", user.getId().toString());
        form.add("customer_email", user.getEmail());
        form.add("metadata[userId]", user.getId().toString());
        form.add("metadata[email]", user.getEmail());

        if ("subscription".equals(normalizeCheckoutMode(billing.getCheckoutMode()))) {
            form.add("subscription_data[metadata][userId]", user.getId().toString());
            form.add("subscription_data[metadata][email]", user.getEmail());
        }

        try {
            String response = restClient.post()
                    .uri(STRIPE_CHECKOUT_SESSION_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + billing.getStripeSecretKey())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            String url = root.path("url").asText();
            if (!StringUtils.hasText(url)) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Stripe did not return a checkout URL");
            }

            return new CheckoutSessionResponse(url);
        } catch (RestClientResponseException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Stripe checkout session creation failed");
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to create checkout session");
        }
    }

    @Transactional
    public void handleWebhook(String payload, String stripeSignature) {
        AppProperties.Billing billing = appProperties.getBilling();
        ensureWebhookConfigured(billing);
        verifyStripeSignature(payload, stripeSignature, billing.getStripeWebhookSecret());

        try {
            JsonNode root = objectMapper.readTree(payload);
            String eventType = root.path("type").asText();

            if (!"checkout.session.completed".equals(eventType)) {
                return;
            }

            JsonNode session = root.path("data").path("object");
            String userId = session.path("metadata").path("userId").asText(null);
            if (!StringUtils.hasText(userId)) {
                userId = session.path("client_reference_id").asText(null);
            }

            if (!StringUtils.hasText(userId)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Missing checkout user metadata");
            }

            grantPro(UUID.fromString(userId));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid checkout user metadata");
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid Stripe webhook payload");
        }
    }

    private void grantPro(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        user.setPlan(UserPlan.PRO);
        user.setUpdatedAt(Instant.now());
    }

    private void ensureCheckoutConfigured(AppProperties.Billing billing) {
        if (!billing.isEnabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Billing is not enabled");
        }
        if (!StringUtils.hasText(billing.getStripeSecretKey())
                || !StringUtils.hasText(billing.getStripePriceId())
                || !StringUtils.hasText(billing.getAppPublicUrl())) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Stripe checkout is not configured");
        }
    }

    private void ensureWebhookConfigured(AppProperties.Billing billing) {
        if (!billing.isEnabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Billing is not enabled");
        }
        if (!StringUtils.hasText(billing.getStripeWebhookSecret())) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Stripe webhook is not configured");
        }
    }

    private void verifyStripeSignature(String payload, String signatureHeader, String webhookSecret) {
        if (!StringUtils.hasText(signatureHeader)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Missing Stripe signature");
        }

        String timestamp = null;
        String expectedSignature = null;
        for (String part : signatureHeader.split(",")) {
            String[] pair = part.split("=", 2);
            if (pair.length != 2) {
                continue;
            }
            if ("t".equals(pair[0])) {
                timestamp = pair[1];
            }
            if ("v1".equals(pair[0])) {
                expectedSignature = pair[1];
            }
        }

        if (!StringUtils.hasText(timestamp) || !StringUtils.hasText(expectedSignature)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid Stripe signature");
        }

        long timestampSeconds;
        try {
            timestampSeconds = Long.parseLong(timestamp);
        } catch (NumberFormatException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid Stripe signature timestamp");
        }

        long age = Math.abs(Instant.now().getEpochSecond() - timestampSeconds);
        if (age > WEBHOOK_TOLERANCE_SECONDS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Expired Stripe signature");
        }

        String signedPayload = timestamp + "." + payload;
        String actualSignature = hmacSha256Hex(webhookSecret, signedPayload);
        if (!MessageDigest.isEqual(
                actualSignature.getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8)
        )) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid Stripe signature");
        }
    }

    private String hmacSha256Hex(String secret, String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to verify Stripe signature");
        }
    }

    private String normalizeCheckoutMode(String mode) {
        String normalized = StringUtils.hasText(mode) ? mode.trim().toLowerCase(Locale.ROOT) : "payment";
        if (!"payment".equals(normalized) && !"subscription".equals(normalized)) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Stripe checkout mode must be payment or subscription");
        }
        return normalized;
    }

    private String buildReturnUrl(String publicUrl, String path, boolean success) {
        String normalizedBase = publicUrl.endsWith("/") ? publicUrl.substring(0, publicUrl.length() - 1) : publicUrl;
        String normalizedPath = path.startsWith("/") ? path : "/" + path;
        String url = normalizedBase + normalizedPath;
        return success ? url + "?session_id={CHECKOUT_SESSION_ID}" : url;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
