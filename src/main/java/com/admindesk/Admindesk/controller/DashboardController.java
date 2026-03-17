package com.admindesk.Admindesk.controller;

import com.admindesk.Admindesk.dto.DashboardDTO;
import com.admindesk.Admindesk.entity.User;
import com.admindesk.Admindesk.repository.UserRepository;
import com.admindesk.Admindesk.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired private DashboardService dashboardService;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(Principal principal) {

        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(dashboardService.getDados(user.getId()));
    }
}