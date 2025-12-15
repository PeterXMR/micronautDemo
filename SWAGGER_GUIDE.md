# Swagger/OpenAPI Integration Guide

## Overview
Swagger UI has been successfully integrated into the Vexl Converter API. This provides interactive API documentation that allows you to test endpoints directly from your browser.

## Accessing Swagger UI

Once the application is running, access the Swagger UI at:

### Local Development
```
http://localhost:8080/swagger-ui/index.html
```

### OpenAPI Specification
The OpenAPI JSON specification is available at:
```
http://localhost:8080/swagger/demo1-1.0.yml
```

## Features

### 1. Interactive API Documentation
- View all available endpoints
- See request/response schemas
- Test API calls directly from the browser
- View example requests and responses

### 2. Documented Endpoints

#### POST /api/convert
- **Summary**: Convert data between formats
- **Description**: Converts input data from one format to another
- **Supported Formats**: hex, base64, binary, decimal, ascii
- **Request Body**:
  ```json
  {
    "input": "48656c6c6f",
    "fromFormat": "hex",
    "toFormat": "base64"
  }
  ```
- **Response**:
  ```json
  {
    "output": "SGVsbG8=",
    "success": true,
    "error": null
  }
  ```

#### GET /api/health
- **Summary**: Health check
- **Description**: Returns the health status of the API
- **Response**: `{"status":"OK"}`

#### GET /api/formats
- **Summary**: Get supported formats
- **Description**: Returns a list of all supported conversion formats
- **Response**: `{"formats":["hex","base64","binary","decimal","ascii"]}`

## Configuration

### Dependencies Added to pom.xml
```xml
<dependency>
    <groupId>io.micronaut.openapi</groupId>
    <artifactId>micronaut-openapi</artifactId>
    <scope>compile</scope>
</dependency>
<dependency>
    <groupId>io.swagger.core.v3</groupId>
    <artifactId>swagger-annotations</artifactId>
    <scope>compile</scope>
</dependency>
```

### Application Configuration (application.properties)
```properties
# OpenAPI/Swagger Configuration
micronaut.router.static-resources.swagger.paths=classpath:META-INF/swagger
micronaut.router.static-resources.swagger.mapping=/swagger/**
micronaut.router.static-resources.swagger-ui.paths=classpath:META-INF/swagger/views/swagger-ui
micronaut.router.static-resources.swagger-ui.mapping=/swagger-ui/**
```

## Annotations Used

### Controller Level
```java
@Controller("/api")
@Tag(name = "Conversion", description = "Data format conversion operations")
public class ConversionController {
    // ...
}
```

### Endpoint Level
```java
@Post("/convert")
@Operation(
    summary = "Convert data between formats",
    description = "Converts input data from one format to another"
)
@ApiResponses(value = {
    @ApiResponse(
        responseCode = "200",
        description = "Conversion successful",
        content = @Content(schema = @Schema(implementation = ConversionResponse.class))
    ),
    @ApiResponse(
        responseCode = "400",
        description = "Invalid input or unsupported format"
    )
})
public ConversionResponse convert(@Valid @Body ConversionRequest request) {
    // ...
}
```

### DTO Level
```java
@Schema(description = "Request object for data format conversion")
public class ConversionRequest {
    
    @Schema(description = "Input data to be converted", example = "48656c6c6f")
    private String input;
    
    @Schema(description = "Source format", example = "hex", 
            allowableValues = {"hex", "base64", "binary", "decimal", "ascii"})
    private String fromFormat;
    
    @Schema(description = "Target format", example = "base64",
            allowableValues = {"hex", "base64", "binary", "decimal", "ascii"})
    private String toFormat;
}
```

## API Information

The OpenAPI specification includes:

- **Title**: Vexl Converter API
- **Version**: 1.0
- **Description**: API for converting data between various formats
- **Server**: http://localhost:8080
- **License**: MIT

## Using Swagger UI

### 1. Start the Application
```bash
./mvnw mn:run
```

### 2. Open Swagger UI
Navigate to: http://localhost:8080/swagger-ui/index.html

### 3. Test an Endpoint
1. Click on an endpoint to expand it
2. Click "Try it out"
3. Fill in the request parameters
4. Click "Execute"
5. View the response

### Example Test Case
1. Expand **POST /api/convert**
2. Click **Try it out**
3. Enter this request body:
   ```json
   {
     "input": "Hello",
     "fromFormat": "ascii",
     "toFormat": "hex"
   }
   ```
4. Click **Execute**
5. See the response:
   ```json
   {
     "output": "48656c6c6f",
     "success": true,
     "error": null
   }
   ```

## Benefits of Swagger Integration

1. **Interactive Documentation**: Test API calls without external tools
2. **Automatic Generation**: Documentation is generated from code annotations
3. **Always Up-to-Date**: Docs sync with code changes
4. **Standard Format**: OpenAPI is industry standard
5. **Client Generation**: Can generate client SDKs from the spec
6. **Team Collaboration**: Easy for frontend developers to understand backend API

## Customization

### Modify API Information
Edit `src/main/java/com/example/config/OpenApiConfiguration.java`:

```java
@OpenAPIDefinition(
    info = @Info(
        title = "Your API Title",
        version = "1.0",
        description = "Your API Description",
        contact = @Contact(
            name = "Your Name",
            email = "your.email@example.com"
        )
    )
)
```

### Add More Endpoint Documentation
Add annotations to controller methods:

```java
@Operation(summary = "Your summary", description = "Your description")
@ApiResponse(responseCode = "200", description = "Success response")
```

### Document Request/Response Models
Add `@Schema` annotations to DTOs:

```java
@Schema(description = "Field description", example = "example value")
private String fieldName;
```

## Files Modified/Created

### Created:
- `src/main/java/com/example/config/OpenApiConfiguration.java` - OpenAPI configuration

### Modified:
- `pom.xml` - Added OpenAPI dependencies
- `application.properties` - Added Swagger UI configuration
- `ConversionController.java` - Added Swagger annotations
- `ConversionRequest.java` - Added Schema annotations
- `ConversionResponse.java` - Added Schema annotations

## Troubleshooting

### Swagger UI Not Loading
1. Ensure application is running
2. Check URL: http://localhost:8080/swagger-ui/index.html
3. Check console for errors
4. Verify dependencies in pom.xml

### OpenAPI Spec Not Generated
1. Run `./mvnw clean compile` to trigger annotation processing
2. Check `target/classes/META-INF/swagger/` directory

### Endpoints Not Showing
1. Ensure controller has `@Controller` annotation
2. Verify `@Operation` annotations on methods
3. Rebuild project: `./mvnw clean compile`

## Additional Resources

- [Micronaut OpenAPI Documentation](https://micronaut-projects.github.io/micronaut-openapi/latest/guide/)
- [Swagger Documentation](https://swagger.io/docs/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)

## Quick Reference

| Resource | URL |
|----------|-----|
| Swagger UI | http://localhost:8080/swagger-ui/index.html |
| OpenAPI Spec (YAML) | http://localhost:8080/swagger/demo1-1.0.yml |
| API Base URL | http://localhost:8080/api |
| Health Check | http://localhost:8080/api/health |

---

**Note**: Swagger UI is automatically available in development. For production, you may want to secure or disable it based on your security requirements.

