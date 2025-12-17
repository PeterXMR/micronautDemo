package com.example.entity;

import io.micronaut.data.annotation.DateCreated;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "rate_history")
public class RateHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double btcUsd;

    @Column(nullable = false)
    private Double btcEur;

    @DateCreated
    @Column(nullable = false)
    private Instant timestamp;

    public RateHistory() {
    }

    public RateHistory(Double btcUsd, Double btcEur) {
        this.btcUsd = btcUsd;
        this.btcEur = btcEur;
        this.timestamp = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getBtcUsd() {
        return btcUsd;
    }

    public void setBtcUsd(Double btcUsd) {
        this.btcUsd = btcUsd;
    }

    public Double getBtcEur() {
        return btcEur;
    }

    public void setBtcEur(Double btcEur) {
        this.btcEur = btcEur;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}

