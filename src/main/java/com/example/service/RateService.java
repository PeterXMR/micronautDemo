package com.example.service;

import com.example.entity.ExchangeRate;
import com.example.repository.ExchangeRateRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import io.micronaut.http.HttpRequest;
import io.micronaut.http.client.HttpClient;
import io.micronaut.http.client.annotation.Client;
import io.micronaut.http.uri.UriBuilder;
import jakarta.inject.Singleton;

@Singleton
public class RateService {

    private static final Logger LOG = LoggerFactory.getLogger(RateService.class);

    private final HttpClient httpClient;
    private final ExchangeRateRepository repository;

    public RateService(@Client("https://api.coingecko.com") HttpClient httpClient,
                       ExchangeRateRepository repository) {
        this.httpClient = httpClient;
        this.repository = repository;
    }

    /**
     * Get latest BTC prices (USD and EUR) from database.
     * This mimics the Python app's approach: store single latest price.
     */
    public Optional<ExchangeRate> getLatestPrice() {
        // For BTC/USD (we'll store this as the "latest" price)
        return repository.findByFromCurrencyAndToCurrency("BTC", "USD");
    }

    /**
     * Get latest BTC/EUR price from database.
     */
    public Optional<ExchangeRate> getLatestPriceEur() {
        return repository.findByFromCurrencyAndToCurrency("BTC", "EUR");
    }

    /**
     * Fetch latest BTC prices from CoinGecko for USD and EUR.
     * Store both as separate records (or just USD as primary).
     */
    public void fetchAndStorePrices() {
        try {
            Map<String, Double> rates = fetchBtcPrices();
            if (rates != null && !rates.isEmpty()) {
                Double btcUsd = rates.get("usd");
                Double btcEur = rates.get("eur");

                if (btcUsd != null) {
                    upsertRate("BTC", "USD", btcUsd);
                    LOG.info("Updated BTC/USD rate: {}", btcUsd);
                }
                if (btcEur != null) {
                    upsertRate("BTC", "EUR", btcEur);
                    LOG.info("Updated BTC/EUR rate: {}", btcEur);
                }
            }
        } catch (Exception e) {
            LOG.error("Failed to fetch and store prices", e);
        }
    }

    /**
     * Fetch BTC prices in USD and EUR from CoinGecko API.
     */
    private Map<String, Double> fetchBtcPrices() {
        try {
            URI uri = UriBuilder.of("/api/v3/simple/price")
                    .queryParam("ids", "bitcoin")
                    .queryParam("vs_currencies", "usd,eur")
                    .build();
            HttpRequest<?> request = HttpRequest.GET(uri);
            Map<String, Object> response = httpClient.toBlocking().retrieve(request, Map.class);

            if (response.containsKey("bitcoin")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> bitcoinData = (Map<String, Object>) response.get("bitcoin");
                Map<String, Double> rates = Map.of(
                    "usd", ((Number) bitcoinData.get("usd")).doubleValue(),
                    "eur", ((Number) bitcoinData.get("eur")).doubleValue()
                );
                return rates;
            }
        } catch (Exception e) {
            LOG.error("Failed to fetch BTC prices from CoinGecko", e);
        }
        return null;
    }

    /**
     * Upsert a rate into database.
     * Deletes existing and inserts new to avoid detached entity issues.
     */
    public ExchangeRate upsertRate(String from, String to, double rate) {
        String fromUpper = from.toUpperCase();
        String toUpper = to.toUpperCase();
        // Delete existing to avoid detached entity issues
        repository.findByFromCurrencyAndToCurrency(fromUpper, toUpper).ifPresent(repository::delete);
        // Create and save new entity
        ExchangeRate entity = new ExchangeRate(fromUpper, toUpper, rate, Instant.now());
        return repository.save(entity);
    }

    /**
     * Convert BTC amount to target currency using latest stored rate.
     * Mimics Python: btc_amount * rate
     */
    public Optional<Map<String, Object>> convertBtc(double btcAmount, String toCurrency) {
        if (btcAmount <= 0) {
            return Optional.empty();
        }

        try {
            String toUpper = toCurrency.toUpperCase();
            Optional<ExchangeRate> rateOpt = repository.findByFromCurrencyAndToCurrency("BTC", toUpper);

            if (rateOpt.isEmpty()) {
                // Try to fetch fresh rate if not in DB
                LOG.warn("No cached rate for BTC/{}, fetching fresh", toUpper);
                fetchAndStorePrices();
                rateOpt = repository.findByFromCurrencyAndToCurrency("BTC", toUpper);
            }

            if (rateOpt.isPresent()) {
                ExchangeRate rate = rateOpt.get();
                double convertedAmount = btcAmount * rate.getRate();

                // Build response matching Python API format
                Map<String, Object> result = Map.ofEntries(
                    Map.entry("btc_amount", btcAmount),
                    Map.entry(toUpper.toLowerCase() + "_amount", Math.round(convertedAmount * 100.0) / 100.0),
                    Map.entry("rates", Map.of("btc_" + toUpper.toLowerCase(), rate.getRate())),
                    Map.entry("timestamp", rate.getUpdatedAt().toString())
                );
                return Optional.of(result);
            }
        } catch (Exception e) {
            LOG.error("Conversion failed for {} {}", btcAmount, toCurrency, e);
        }

        return Optional.empty();
    }
}

