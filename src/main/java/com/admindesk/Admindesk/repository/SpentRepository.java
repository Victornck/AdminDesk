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

    @Query("SELECT FUNCTION('MONTH', s.data) as mes, s.type, SUM(s.price) as total " +
            "FROM Spent s WHERE s.user.id = :userId AND FUNCTION('YEAR', s.data) = FUNCTION('YEAR', CURRENT_DATE) " +
            "GROUP BY FUNCTION('MONTH', s.data), s.type ORDER BY mes")
    List<Object[]> monthlyByUser(@Param("userId") Long userId);
}