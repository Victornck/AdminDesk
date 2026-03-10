package com.admindesk.Admindesk.service;

import com.admindesk.Admindesk.dto.DashboardDTO;
import com.admindesk.Admindesk.repository.SpentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private SpentRepository spentRepository;

    public DashboardDTO getDados(Long userId) {
        Double receitas = spentRepository.sumByUserIdAndTipo(userId, "receita");
        Double despesas = spentRepository.sumByUserIdAndTipo(userId, "despesa");

        receitas = receitas != null ? receitas : 0.0;
        despesas = despesas != null ? despesas : 0.0;

        return new DashboardDTO(receitas, despesas, receitas - despesas);
    }
}
