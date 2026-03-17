package com.admindesk.Admindesk.service;

import com.admindesk.Admindesk.entity.Spent;
import com.admindesk.Admindesk.repository.SpentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpentService {

    @Autowired
    private SpentRepository spentRepository;

    public Spent save(Spent spent) {
        return spentRepository.save(spent);
    }

    public List<Spent> listByUser(Long userId) {
        return spentRepository.findByUserId(userId);
    }

    public void delete(Long id) {
        spentRepository.deleteById(id);
    }

    public Spent update(Long id, Spent updated) {
        Spent existing = spentRepository.findById(id).orElseThrow();
        existing.setDescriptor(updated.getDescriptor());
        existing.setPrice(updated.getPrice());
        existing.setData(updated.getData());
        existing.setType(updated.getType());
        return spentRepository.save(existing);
    }
}