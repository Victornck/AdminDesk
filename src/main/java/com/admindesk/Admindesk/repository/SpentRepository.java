package com.admindesk.Admindesk.repository;

import com.admindesk.Admindesk.entity.Spent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SpentRepository extends JpaRepository<Spent, Long> {
    List<Spent> findByUserId(Long userId);

    //Soma total da receita
    @Query("SELECT SUM(g.valor) FROM Gasto g WHERE g.user.id = :userId AND g.tipo = :tipo")
    Double sumByUserIdAndTipo(@Param("userId") Long userId, @Param("tipo") String tipo);
}