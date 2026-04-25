package com.example.backendjava.repository;

import com.example.backendjava.entity.User;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where lower(u.email) = lower(:email)")
    Optional<User> findByEmailForUpdate(@Param("email") String email);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update User u set u.dailySubmissionCount = 0")
    int resetAllDailySubmissionCounts();
}
