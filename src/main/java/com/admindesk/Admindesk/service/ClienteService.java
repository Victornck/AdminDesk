package com.admindesk.Admindesk.service;

import com.admindesk.Admindesk.entity.Client;
import com.admindesk.Admindesk.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    @Autowired private ClientRepository clientRepository;

    public Client salvar(Client client) {
        return clientRepository.save(client);
    }

    public List<Client> listarPorUsuario(Long userId) {
        return clientRepository.findByUserId(userId);
    }

    public void deletar(Long id) {
        clientRepository.deleteById(id);
    }

    public Client atualizar(Long id, Client clientAtualizado) {
        Client existing = clientRepository.findById(id).orElseThrow();
        existing.setNome(clientAtualizado.getNome());
        existing.setEmail(clientAtualizado.getEmail());
        existing.setTelefone(clientAtualizado.getTelefone());
        return clientRepository.save(existing);
    }
}