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
@RequestMapping("/clientes")
public class ClientController {

    @Autowired private ClienteService clienteService;
    @Autowired private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Client> cadastrar(@RequestBody Client client, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        client.setUser(user);
        return ResponseEntity.ok(clienteService.salvar(client));
    }

    @GetMapping
    public ResponseEntity<List<Client>> listar(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(clienteService.listarPorUsuario(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletar(@PathVariable Long id) {
        clienteService.deletar(id);
        return ResponseEntity.ok("Cliente deletado!");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> atualizar(@PathVariable Long id, @RequestBody Client client) {
        return ResponseEntity.ok(clienteService.atualizar(id, client));
    }
}