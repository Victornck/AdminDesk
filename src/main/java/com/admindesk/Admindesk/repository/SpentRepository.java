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

    @Query("select extract(month from s.data), s.type, sum(s.price) from Spent s " +
            "where s.user.id = :userId and extract(year from s.data) = extract(year from current_date) " +
            "group by extract(month from s.data), s.type order by 1")
    List<Object[]> monthlyByUser(@Param("userId") Long userId);
}