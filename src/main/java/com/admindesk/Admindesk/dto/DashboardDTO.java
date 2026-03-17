package com.admindesk.Admindesk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class DashboardDTO {
    private Double totalReceitas;
    private Double totalDespesas;
    private Double lucro;
    private List<Map<String, Object>> grafico;
}