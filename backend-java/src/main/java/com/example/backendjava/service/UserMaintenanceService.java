package com.example.backendjava.service;

import com.example.backendjava.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserMaintenanceService {

    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")
    @Transactional
    public void resetDailySubmissionCounters() {
        int updated = userRepository.resetAllDailySubmissionCounts();
        log.info("Daily quota reset completed for {} users", updated);
    }
}
