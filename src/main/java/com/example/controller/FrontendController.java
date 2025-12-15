package com.example.controller;

import io.micronaut.core.io.ResourceLoader;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Produces;
import jakarta.inject.Inject;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Controller("/")
public class FrontendController {

    @Inject
    ResourceLoader resourceLoader;

    @Get("/")
    @Produces(MediaType.TEXT_HTML)
    public String index() {
        try {
            // Read the static HTML file
            InputStream resourceStream = resourceLoader.getResourceAsStream("classpath:static/index.html")
                    .orElseThrow(() -> new RuntimeException("Resource not found"));
            return new String(resourceStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "<html><body><h1>Vexl Converter</h1><p>Frontend loading...</p><p>Error: " + e.getMessage() + "</p></body></html>";
        }
    }

    @Get("/index.html")
    @Produces(MediaType.TEXT_HTML)
    public String indexHtml() {
        return index(); // Reuse the same method
    }
}
