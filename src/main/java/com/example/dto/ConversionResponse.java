package com.example.dto;

import io.micronaut.serde.annotation.Serdeable;
import io.micronaut.core.annotation.Introspected;

@Serdeable
@Introspected
public class ConversionResponse {

    private double convertedAmount;

    private double exchangeRate;

    private String fromCurrency;

    private String toCurrency;

    private double originalAmount;

    private boolean success;

    private String error;

    public ConversionResponse() {
    }

    public ConversionResponse(double convertedAmount, double exchangeRate, String fromCurrency,
                           String toCurrency, double originalAmount, boolean success, String error) {
        this.convertedAmount = convertedAmount;
        this.exchangeRate = exchangeRate;
        this.fromCurrency = fromCurrency;
        this.toCurrency = toCurrency;
        this.originalAmount = originalAmount;
        this.success = success;
        this.error = error;
    }

    public static ConversionResponse success(double convertedAmount, double exchangeRate,
                                           String fromCurrency, String toCurrency, double originalAmount) {
        return new ConversionResponse(convertedAmount, exchangeRate, fromCurrency, toCurrency,
                                    originalAmount, true, null);
    }

    public static ConversionResponse failure(String error) {
        return new ConversionResponse(0, 0, null, null, 0, false, error);
    }

    // Getters and setters
    public double getConvertedAmount() {
        return convertedAmount;
    }

    public void setConvertedAmount(double convertedAmount) {
        this.convertedAmount = convertedAmount;
    }

    public double getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(double exchangeRate) {
        this.exchangeRate = exchangeRate;
    }

    public String getFromCurrency() {
        return fromCurrency;
    }

    public void setFromCurrency(String fromCurrency) {
        this.fromCurrency = fromCurrency;
    }

    public String getToCurrency() {
        return toCurrency;
    }

    public void setToCurrency(String toCurrency) {
        this.toCurrency = toCurrency;
    }

    public double getOriginalAmount() {
        return originalAmount;
    }

    public void setOriginalAmount(double originalAmount) {
        this.originalAmount = originalAmount;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
