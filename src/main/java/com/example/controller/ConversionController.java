package com.example.controller;

import com.example.dto.ConversionRequest;
import com.example.dto.ConversionResponse;
import com.example.entity.ExchangeRate;
import com.example.service.RateService;
import io.micronaut.http.annotation.*;
import io.micronaut.http.HttpStatus;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.Optional;

@Controller("/api")
public class ConversionController {

    private static final Logger LOG = LoggerFactory.getLogger(ConversionController.class);

    @Inject
    private RateService rateService;

    @Get("/health")
    public Map<String, String> health() {
        return Map.of("status", "healthy", "version", "0.0.1");
    }

    @Get("/currencies")
    public Map<String, Object> getSupportedCurrencies() {
        return Map.of("currencies", new String[]{"BTC", "ETH", "LTC", "XMR", "EUR", "USD"});
    }

    /**
     * GET /api/prices/latest
     * Returns the latest BTC prices from database.
     * Matches Python API response format.
     */
    @Get("/prices/latest")
    public Map<String, Object> getLatestPrices() {
        try {
            Optional<ExchangeRate> usdRate = rateService.getLatestPrice();
            Optional<ExchangeRate> eurRate = rateService.getLatestPriceEur();

            if (usdRate.isEmpty() || eurRate.isEmpty()) {
                return Map.of(
                    "success", false,
                    "error", "No price data available"
                );
            }

            ExchangeRate rateUsd = usdRate.get();
            ExchangeRate rateEur = eurRate.get();

            return Map.of(
                "success", true,
                "data", Map.of(
                    "id", rateUsd.getId(),
                    "btc_usd", rateUsd.getRate(),
                    "btc_eur", rateEur.getRate(),
                    "timestamp", rateUsd.getUpdatedAt().toString()
                )
            );
        } catch (Exception e) {
            LOG.error("Failed to get latest prices", e);
            return Map.of(
                "success", false,
                "error", e.getMessage()
            );
        }
    }

    /**
     * POST /api/convert
     * Convert BTC amount to USD and EUR.
     * Request: { "btc_amount": 0.01 }
     * Response matches Python API format.
     */
    @Post("/convert")
    @Status(HttpStatus.OK)
    public Map<String, Object> convert(@Body Map<String, Object> request) {
        try {
            Object btcAmountObj = request.get("btc_amount");
            double btcAmount = 0;

            if (btcAmountObj instanceof Number) {
                btcAmount = ((Number) btcAmountObj).doubleValue();
            } else if (btcAmountObj instanceof String) {
                btcAmount = Double.parseDouble((String) btcAmountObj);
            }

            if (btcAmount <= 0) {
                return Map.of(
                    "success", false,
                    "error", "BTC amount must be greater than 0"
                );
            }

            // Get latest prices (both USD and EUR)
            Optional<ExchangeRate> usdRateOpt = rateService.getLatestPrice();
            Optional<ExchangeRate> eurRateOpt = rateService.getLatestPriceEur();

            if (usdRateOpt.isEmpty() || eurRateOpt.isEmpty()) {
                return Map.of(
                    "success", false,
                    "error", "No price data available"
                );
            }

            ExchangeRate usdRate = usdRateOpt.get();
            ExchangeRate eurRate = eurRateOpt.get();

            double usdAmount = Math.round(btcAmount * usdRate.getRate() * 100.0) / 100.0;
            double eurAmount = Math.round(btcAmount * eurRate.getRate() * 100.0) / 100.0;

            LOG.info("Converted {} BTC to ${} and €{}", btcAmount, usdAmount, eurAmount);

            return Map.of(
                "success", true,
                "data", Map.of(
                    "btc_amount", btcAmount,
                    "usd_amount", usdAmount,
                    "eur_amount", eurAmount,
                    "rates", Map.of(
                        "btc_usd", usdRate.getRate(),
                        "btc_eur", eurRate.getRate()
                    ),
                    "timestamp", usdRate.getUpdatedAt().toString()
                )
            );
        } catch (Exception e) {
            LOG.error("Conversion failed", e);
            return Map.of(
                "success", false,
                "error", e.getMessage()
            );
        }
    }
}
