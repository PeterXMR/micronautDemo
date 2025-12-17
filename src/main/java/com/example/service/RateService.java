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
                return Map.of(
                    "usd", ((Number) bitcoinData.get("usd")).doubleValue(),
                    "eur", ((Number) bitcoinData.get("eur")).doubleValue()
                );
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
    public void upsertRate(String from, String to, double rate) {
        String fromUpper = from.toUpperCase();
        String toUpper = to.toUpperCase();
        // Delete existing to avoid detached entity issues
        repository.findByFromCurrencyAndToCurrency(fromUpper, toUpper).ifPresent(repository::delete);
        // Create and save new entity
        ExchangeRate entity = new ExchangeRate(fromUpper, toUpper, rate, Instant.now());
        repository.save(entity);
    }


    /**
     * Get current BTC rates (USD and EUR) from database as a map
     */
    public Optional<Map<String, Double>> getCurrentRates() {
        Optional<ExchangeRate> usd = getLatestPrice();
        Optional<ExchangeRate> eur = getLatestPriceEur();

        if (usd.isPresent() && eur.isPresent()) {
            return Optional.of(Map.of(
                "usd", usd.get().getRate(),
                "eur", eur.get().getRate()
            ));
        }
        return Optional.empty();
    }
}

