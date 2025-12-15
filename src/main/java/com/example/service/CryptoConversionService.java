package com.example.service;

import com.example.dto.ConversionResponse;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.client.HttpClient;
import io.micronaut.http.client.annotation.Client;
import io.micronaut.http.uri.UriBuilder;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.Map;

@Singleton
public class CryptoConversionService {

    private static final Logger LOG = LoggerFactory.getLogger(CryptoConversionService.class);

    private final HttpClient httpClient;

    public CryptoConversionService(@Client("https://api.coingecko.com") HttpClient httpClient) {
        this.httpClient = httpClient;
    }

    public ConversionResponse convert(double amount, String fromCurrency, String toCurrency) {
        try {
            LOG.info("Converting {} {} to {}", amount, fromCurrency, toCurrency);

            // For simplicity, handle BTC to fiat conversions
            if ("BTC".equalsIgnoreCase(fromCurrency)) {
                return convertFromBTC(amount, toCurrency);
            } else if ("EUR".equalsIgnoreCase(toCurrency) || "USD".equalsIgnoreCase(toCurrency)) {
                return convertToFiat(amount, fromCurrency, toCurrency);
            } else {
                return ConversionResponse.failure("Unsupported currency conversion: " + fromCurrency + " to " + toCurrency);
            }

        } catch (Exception e) {
            LOG.error("Error during conversion", e);
            return ConversionResponse.failure("Conversion failed: " + e.getMessage());
        }
    }

    private ConversionResponse convertFromBTC(double amount, String toCurrency) {
        try {
            // CoinGecko API: Get BTC price in target currency
            URI uri = UriBuilder.of("/api/v3/simple/price")
                    .queryParam("ids", "bitcoin")
                    .queryParam("vs_currencies", toCurrency.toLowerCase())
                    .build();

            HttpRequest<?> request = HttpRequest.GET(uri);
            Map<String, Object> response = httpClient.toBlocking().retrieve(request, Map.class);

            if (response.containsKey("bitcoin")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> bitcoinData = (Map<String, Object>) response.get("bitcoin");
                Object rateValue = bitcoinData.get(toCurrency.toLowerCase());
                Double rate = null;

                if (rateValue instanceof Double) {
                    rate = (Double) rateValue;
                } else if (rateValue instanceof Integer) {
                    rate = ((Integer) rateValue).doubleValue();
                } else if (rateValue instanceof Number) {
                    rate = ((Number) rateValue).doubleValue();
                }

                if (rate != null) {
                    double convertedAmount = amount * rate;
                    return ConversionResponse.success(convertedAmount, rate, "BTC", toCurrency.toUpperCase(), amount);
                }
            }

            return ConversionResponse.failure("Could not fetch BTC exchange rate");

        } catch (Exception e) {
            LOG.error("Error fetching BTC price", e);
            return ConversionResponse.failure("Failed to fetch BTC price: " + e.getMessage());
        }
    }

    private ConversionResponse convertToFiat(double amount, String fromCurrency, String toCurrency) {
        try {
            // For other cryptos to fiat, we'd need their CoinGecko IDs
            // For now, return a placeholder
            return ConversionResponse.failure("Crypto to fiat conversion not fully implemented yet. Use BTC as fromCurrency.");

        } catch (Exception e) {
            LOG.error("Error in crypto to fiat conversion", e);
            return ConversionResponse.failure("Conversion failed: " + e.getMessage());
        }
    }
}
