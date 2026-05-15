package com.example.backendjava.service;

import com.example.backendjava.config.AppProperties;
import com.example.backendjava.entity.User;
import com.example.backendjava.entity.UserPlan;
import com.example.backendjava.exception.ApiException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QuotaService {

    private final AppProperties appProperties;

    public void consumeCredits(User user, int wordCount) {
        if (user.getPlan() == UserPlan.PRO) {
            return;
        }

        int safeWordCount = Math.max(0, wordCount);
        int textWordLimit = getFreeTextWordLimit();
        if (safeWordCount > textWordLimit) {
            throw new ApiException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Free plan supports up to " + textWordLimit + " words per text submission"
            );
        }

        int currentCredits = currentDailyCreditsUsed(user);
        int dailyCredits = getFreeDailyCredits();
        if (currentCredits + safeWordCount > dailyCredits) {
            throw new ApiException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Free daily credit limit exceeded. " + getFreeCreditsRemaining(user) + " credits remaining today"
            );
        }

        user.setDailySubmissionCount(currentCredits + safeWordCount);
        user.setLastSubmissionDate(todayUtc());
        user.setUpdatedAt(Instant.now());
    }

    public int currentDailyCreditsUsed(User user) {
        LocalDate todayUtc = LocalDate.now(ZoneOffset.UTC);
        Integer currentCount = user.getDailySubmissionCount() == null ? 0 : user.getDailySubmissionCount();

        if (user.getLastSubmissionDate() == null || !todayUtc.equals(user.getLastSubmissionDate())) {
            return 0;
        }

        return currentCount;
    }

    public Integer getFreeCreditsRemaining(User user) {
        if (user.getPlan() == UserPlan.PRO) {
            return null;
        }

        return Math.max(0, getFreeDailyCredits() - currentDailyCreditsUsed(user));
    }

    public Integer getDailyCreditLimit(User user) {
        return user.getPlan() == UserPlan.PRO ? null : getFreeDailyCredits();
    }

    public Integer getTextWordLimit(User user) {
        return user.getPlan() == UserPlan.PRO ? null : getFreeTextWordLimit();
    }

    public LocalDate getNextResetDate() {
        return todayUtc().plusDays(1);
    }

    public int getFreeDailyCredits() {
        return Math.max(1, appProperties.getQuota().getFreeDailyCredits());
    }

    public int getFreeTextWordLimit() {
        return Math.max(1, appProperties.getQuota().getFreeTextWordLimit());
    }

    public int getPremiumMonthlyPriceUsd() {
        return Math.max(0, appProperties.getQuota().getPremiumMonthlyPriceUsd());
    }

    private LocalDate todayUtc() {
        return LocalDate.now(ZoneOffset.UTC);
    }
}
