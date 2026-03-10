package com.admindesk.Admindesk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardDTO {
    private Double totalReceitas;
    private Double totalDespesas;
    private Double lucro;
}