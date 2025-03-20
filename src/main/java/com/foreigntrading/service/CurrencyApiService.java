package com.foreigntrading.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class CurrencyApiService {
    private final RestTemplate restTemplate;

    @Value("${alpha.vantage.api.key}")
    private String apiKey;

    private final Map<String, BigDecimal> exchangeRates = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> lastUpdateTimes = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 60000) // Update every minute
    public void updateExchangeRates() {
        String[] currencyPairs = {
            "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD",
            "USD/CHF", "NZD/USD", "EUR/GBP", "EUR/JPY", "GBP/JPY"
        };

        for (String pair : currencyPairs) {
            try {
                String[] currencies = pair.split("/");
                String url = String.format(
                    "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=%s&to_currency=%s&apikey=%s",
                    currencies[0], currencies[1], apiKey
                );

                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                if (response != null && response.containsKey("Realtime Currency Exchange Rate")) {
                    Map<String, String> rateData = (Map<String, String>) response.get("Realtime Currency Exchange Rate");
                    BigDecimal rate = new BigDecimal(rateData.get("5. Exchange Rate"));
                    updateRate(pair, rate);
                }
            } catch (Exception e) {
                // Log error and continue with other pairs
                System.err.println("Error updating rate for " + pair + ": " + e.getMessage());
            }
        }
    }

    private void updateRate(String pair, BigDecimal rate) {
        exchangeRates.put(pair, rate);
        lastUpdateTimes.put(pair, LocalDateTime.now());
    }

    public BigDecimal getExchangeRate(String baseCurrency, String quoteCurrency) {
        String pair = baseCurrency + "/" + quoteCurrency;
        BigDecimal rate = exchangeRates.get(pair);
        
        if (rate == null) {
            throw new IllegalStateException("Exchange rate not available for " + pair);
        }

        LocalDateTime lastUpdate = lastUpdateTimes.get(pair);
        if (lastUpdate == null || lastUpdate.isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new IllegalStateException("Exchange rate data is stale for " + pair);
        }

        return rate;
    }

    public Map<String, BigDecimal> getAllExchangeRates() {
        return new ConcurrentHashMap<>(exchangeRates);
    }

    public Map<String, Object> getHistoricalData(String baseCurrency, String quoteCurrency, String timeframe) {
        String url = String.format(
            "https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=%s&to_symbol=%s&apikey=%s",
            baseCurrency, quoteCurrency, apiKey
        );

        return restTemplate.getForObject(url, Map.class);
    }

    public Map<String, Object> getTechnicalIndicators(String baseCurrency, String quoteCurrency) {
        String url = String.format(
            "https://www.alphavantage.co/query?function=RSI&symbol=%s%s&interval=5min&apikey=%s",
            baseCurrency, quoteCurrency, apiKey
        );

        return restTemplate.getForObject(url, Map.class);
    }
} 