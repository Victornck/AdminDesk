package com.admindesk.Admindesk.controller;

import com.admindesk.Admindesk.entity.Client;
import com.admindesk.Admindesk.service.ClienteService;
import com.admindesk.Admindesk.entity.User;
import com.admindesk.Admindesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/clients")
public class ClientController {

    @Autowired private ClienteService clienteService;
    @Autowired private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Client> create(@RequestBody Client client, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        client.setUser(user);
        return ResponseEntity.ok(clienteService.save(client));
    }

    @GetMapping
    public ResponseEntity<List<Client>> list(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(clienteService.listByUser(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        clienteService.delete(id);
        return ResponseEntity.ok("Client deleted!");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> update(@PathVariable Long id, @RequestBody Client client) {
        return ResponseEntity.ok(clienteService.update(id, client));
    }

    // Relatório: soma total de todos os valueMonthly do usuário
    @GetMapping("/report")
    public ResponseEntity<Double> monthlyReport(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(clienteService.getMonthlyReport(user.getId()));
    }
}