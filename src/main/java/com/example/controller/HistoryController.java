package com.example.controller;

import com.example.entity.RateHistory;
import com.example.repository.RateHistoryRepository;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.QueryValue;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Controller("/api/history")
public class HistoryController {

    private static final Logger LOG = LoggerFactory.getLogger(HistoryController.class);

    @Inject
    private RateHistoryRepository rateHistoryRepository;

    /**
     * GET /api/history/last-24h
     * Returns all rate history from the last 24 hours
     */
    @Get("/last-24h")
    public Map<String, Object> getLast24Hours() {
        try {
            Instant twentyFourHoursAgo = Instant.now().minusSeconds(24 * 60 * 60);
            List<RateHistory> history = rateHistoryRepository.findByTimestampGreaterThanOrderByTimestampAsc(twentyFourHoursAgo);

            if (history.isEmpty()) {
                return Map.of(
                    "success", false,
                    "error", "No rate history available yet. Data will be collected every 5 minutes."
                );
            }

            List<Map<String, Object>> data = history.stream().map(rate -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", rate.getId());
                map.put("btc_usd", rate.getBtcUsd());
                map.put("btc_eur", rate.getBtcEur());
                map.put("timestamp", rate.getTimestamp().toString());
                return map;
            }).toList();

            LOG.info("Retrieved {} rate history records from last 24 hours", history.size());

            return Map.of(
                "success", true,
                "data", data
            );
        } catch (Exception e) {
            LOG.error("Failed to retrieve rate history", e);
            return Map.of(
                "success", false,
                "error", e.getMessage()
            );
        }
    }

    /**
     * GET /api/history/total
     * Returns total count of rate history records
     */
    @Get("/total")
    public Map<String, Object> getTotal() {
        try {
            long total = rateHistoryRepository.count();
            return Map.of(
                "success", true,
                "total", total
            );
        } catch (Exception e) {
            LOG.error("Failed to count rate history", e);
            return Map.of(
                "success", false,
                "error", e.getMessage()
            );
        }
    }

    /**
     * GET /api/rate-history?hours=24
     * Returns rate history for the specified number of hours
     */
    @Get("/rate-history")
    public Map<String, Object> getRateHistory(@QueryValue(defaultValue = "24") int hours) {
        try {
            Instant cutoffTime = Instant.now().minusSeconds((long) hours * 60 * 60);
            List<RateHistory> history = rateHistoryRepository.findByTimestampAfter(cutoffTime);

            if (history.isEmpty()) {
                return Map.of(
                    "success", false,
                    "error", "No rate history available yet. Data is collected every 5 minutes."
                );
            }

            List<Map<String, Object>> data = history.stream()
                .map(rate -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", rate.getId());
                    map.put("btc_usd", rate.getBtcUsd());
                    map.put("btc_eur", rate.getBtcEur());
                    map.put("timestamp", rate.getTimestamp().toString());
                    return map;
                })
                .toList();

            LOG.info("Retrieved {} rate history records from last {} hours", history.size(), hours);

            return Map.of(
                "success", true,
                "data", data
            );
        } catch (Exception e) {
            LOG.error("Failed to retrieve rate history", e);
            return Map.of(
                "success", false,
                "error", e.getMessage()
            );
        }
    }
}

