package com.admindesk.Admindesk.repository;

import com.admindesk.Admindesk.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByUserId(Long userId);

    @Query("SELECT SUM(c.valueMonthly) FROM Client c WHERE c.user.id = :userId")
    Double sumValueMonthlyByUserId(@Param("userId") Long userId);
}