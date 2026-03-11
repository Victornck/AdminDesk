package com.admindesk.Admindesk.controller;

import com.admindesk.Admindesk.entity.Spent;
import com.admindesk.Admindesk.entity.User;
import com.admindesk.Admindesk.repository.UserRepository;
import com.admindesk.Admindesk.service.SpentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/spents")
public class SpentController {

    @Autowired private SpentService spentService;
    @Autowired private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Spent> create(@RequestBody Spent spent, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        spent.setUser(user);
        return ResponseEntity.ok(spentService.save(spent));
    }

    @GetMapping
    public ResponseEntity<List<Spent>> list(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(spentService.listByUser(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        spentService.delete(id);
        return ResponseEntity.ok("Deleted!");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Spent> update(@PathVariable Long id, @RequestBody Spent spent) {
        return ResponseEntity.ok(spentService.update(id, spent));
    }
}