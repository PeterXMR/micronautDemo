package com.example.dto;

import io.micronaut.serde.annotation.Serdeable;
import io.micronaut.core.annotation.Introspected;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;

@Serdeable
@Introspected
public class ConversionRequest {

    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be positive")
    private double amount;

    @NotBlank
    private String fromCurrency;

    @NotBlank
    private String toCurrency;

    public ConversionRequest() {
    }

    public ConversionRequest(double amount, String fromCurrency, String toCurrency) {
        this.amount = amount;
        this.fromCurrency = fromCurrency;
        this.toCurrency = toCurrency;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
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
}
