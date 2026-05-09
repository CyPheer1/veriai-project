package com.example.backendjava.controller;

import com.example.backendjava.dto.billing.CheckoutSessionResponse;
import com.example.backendjava.service.BillingService;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/billing")
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/checkout-session")
    public ResponseEntity<CheckoutSessionResponse> createCheckoutSession(Principal principal) {
        return ResponseEntity.ok(billingService.createCheckoutSession(principal.getName()));
    }

    @PostMapping(path = "/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(name = "Stripe-Signature", required = false) String stripeSignature
    ) {
        billingService.handleWebhook(payload, stripeSignature);
        return ResponseEntity.ok().build();
    }
}
