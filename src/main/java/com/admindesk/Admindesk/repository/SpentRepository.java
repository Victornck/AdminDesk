package com.admindesk.Admindesk.repository;

import com.admindesk.Admindesk.entity.Spent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SpentRepository extends JpaRepository<Spent, Long> {
    List<Spent> findByUserId(Long userId);

    @Query("SELECT SUM(s.price) FROM Spent s WHERE s.user.id = :userId AND s.type = :type")
    Double sumByUserIdAndType(@Param("userId") Long userId, @Param("type") String type);
}