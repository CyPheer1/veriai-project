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

    public void consumeQuota(User user) {
        // No quota limits — all plans are unlimited
        LocalDate todayUtc = LocalDate.now(ZoneOffset.UTC);
        Integer currentCount = user.getDailySubmissionCount() == null ? 0 : user.getDailySubmissionCount();

        if (user.getLastSubmissionDate() == null || !todayUtc.equals(user.getLastSubmissionDate())) {
            currentCount = 0;
            user.setLastSubmissionDate(todayUtc);
        }

        user.setDailySubmissionCount(currentCount + 1);
        user.setLastSubmissionDate(todayUtc);
        user.setUpdatedAt(Instant.now());
    }
}
