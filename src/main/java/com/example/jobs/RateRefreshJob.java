package com.example.jobs;

import com.example.entity.RateHistory;
import com.example.repository.RateHistoryRepository;
import com.example.service.RateService;
import io.micronaut.scheduling.annotation.Scheduled;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Scheduled job to refresh BTC prices every 5 minutes.
 * Fetches from CoinGecko API, stores in PostgreSQL, and saves to history.
 * Matches Python scheduler.py behavior.
 */
@Singleton
public class RateRefreshJob {

    private static final Logger LOG = LoggerFactory.getLogger(RateRefreshJob.class);

    @Inject
    RateService rateService;

    @Inject
    RateHistoryRepository rateHistoryRepository;

    /**
     * Scheduled task: runs every 5 minutes (300 seconds).
     * Fetches and stores BTC prices in USD and EUR, plus saves to history.
     */
    @Scheduled(fixedDelay = "5m", initialDelay = "10s")
    void refresh() {
        LOG.info("🔄 Refreshing BTC prices from CoinGecko...");
        try {
            rateService.fetchAndStorePrices();

            // Also save to history table for charting
            rateService.getCurrentRates().ifPresent(rates -> {
                RateHistory history = new RateHistory(rates.get("usd"), rates.get("eur"));
                rateHistoryRepository.save(history);
                LOG.info("📊 Saved to history: USD=${}, EUR=€{}", rates.get("usd"), rates.get("eur"));
            });

            LOG.info("✓ Price refresh completed successfully");
        } catch (Exception e) {
            LOG.error("✗ Price refresh failed", e);
        }
    }
}
