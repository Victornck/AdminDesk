package com.admindesk.Admindesk.service;

import com.admindesk.Admindesk.entity.Client;
import com.admindesk.Admindesk.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    @Autowired private ClientRepository clientRepository;

    public Client save(Client client) {
        return clientRepository.save(client);
    }

    public List<Client> listByUser(Long userId) {
        return clientRepository.findByUserId(userId);
    }

    public void delete(Long id) {
        clientRepository.deleteById(id);
    }

    public Client update(Long id, Client updatedClient) {
        Client existing = clientRepository.findById(id).orElseThrow();
        existing.setName(updatedClient.getName());
        existing.setEmail(updatedClient.getEmail());
        existing.setPhone(updatedClient.getPhone());
        existing.setValueMonthly(updatedClient.getValueMonthly());
        return clientRepository.save(existing);
    }

    public Double getMonthlyReport(Long userId) {
        Double total = clientRepository.sumValueMonthlyByUserId(userId);
        return total != null ? total : 0.0;
    }
}