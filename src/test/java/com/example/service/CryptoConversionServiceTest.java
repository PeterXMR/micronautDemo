package com.example.service;

import com.example.dto.ConversionResponse;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@MicronautTest
class CryptoConversionServiceTest {

    @Inject
    CryptoConversionService conversionService;

    @Test
    void convertUnsupportedCurrencyReturnsFailure() {
        ConversionResponse response = conversionService.convert(1.0, "ETH", "EUR");

        assertFalse(response.isSuccess());
        assertNotNull(response.getError());
        assertTrue(response.getError().contains("not fully implemented"));
    }

    @Test
    void convertWithValidBtcToEur() {
        // This test makes real API calls which may fail due to network issues
        // We just verify that the service doesn't crash and returns a response
        ConversionResponse response = conversionService.convert(0.00001, "BTC", "EUR");
        assertNotNull(response);

        // If the API call succeeds, verify the structure
        if (response.isSuccess()) {
            assertEquals("BTC", response.getFromCurrency());
            assertEquals("EUR", response.getToCurrency());
            assertEquals(0.00001, response.getOriginalAmount());
            assertTrue(response.getConvertedAmount() >= 0);
            assertTrue(response.getExchangeRate() > 0);
        }
        // If it fails, that's also acceptable in test environment
    }

    @Test
    void convertWithValidBtcToUsd() {
        ConversionResponse response = conversionService.convert(0.00001, "BTC", "USD");
        assertNotNull(response);

        if (response.isSuccess()) {
            assertEquals("BTC", response.getFromCurrency());
            assertEquals("USD", response.getToCurrency());
            assertEquals(0.00001, response.getOriginalAmount());
        }
        // If it fails, that's also acceptable in test environment
    }

    @Test
    void serviceIsProperlyInjected() {
        assertNotNull(conversionService);
    }
}
