package com.admindesk.Admindesk.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Spent")
public class Spent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descriptor;
    private Double price;
    private LocalDate data;

    private String type;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}