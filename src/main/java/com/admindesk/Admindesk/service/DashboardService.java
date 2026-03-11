package com.admindesk.Admindesk.service;

import com.admindesk.Admindesk.dto.DashboardDTO;
import com.admindesk.Admindesk.repository.SpentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private SpentRepository spentRepository;

    public DashboardDTO getDados(Long userId) {
        Double receitas = spentRepository.sumByUserIdAndType(userId, "income");
        Double despesas = spentRepository.sumByUserIdAndType(userId, "expense");

        receitas = receitas != null ? receitas : 0.0;
        despesas = despesas != null ? despesas : 0.0;

        // Dados mensais para o gráfico
        List<Object[]> monthly = spentRepository.monthlyByUser(userId);
        List<Map<String, Object>> grafico = buildGrafico(monthly);

        return new DashboardDTO(receitas, despesas, receitas - despesas, grafico);
    }

    private List<Map<String, Object>> buildGrafico(List<Object[]> monthly) {
        String[] meses = {"Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"};
        Map<Integer, Map<String, Object>> map = new LinkedHashMap<>();

        for (Object[] row : monthly) {
            int mes = ((Number) row[0]).intValue();
            String type = (String) row[1];
            double total = ((Number) row[2]).doubleValue();

            map.computeIfAbsent(mes, k -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("time", meses[k - 1]);
                m.put("receita", 0.0);
                m.put("despesa", 0.0);
                return m;
            });

            if ("income".equals(type)) map.get(mes).put("receita", total);
            else map.get(mes).put("despesa", total);
        }

        return new ArrayList<>(map.values());
    }
}