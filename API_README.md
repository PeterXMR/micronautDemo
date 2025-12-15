# Vexl Converter - Java/Micronaut Backend

A backend implementation for the Vexl Converter application built with Java 21 and Micronaut Framework 4.10.4.

## Features

- Convert between multiple data formats:
  - **Hexadecimal** (hex)
  - **Base64** (base64)
  - **Binary** (binary)
  - **Decimal** (decimal)
  - **ASCII** (ascii)

- RESTful API endpoints
- CORS enabled for React frontend
- Input validation
- Comprehensive error handling

## API Endpoints

### POST /api/convert
Convert data between formats.

**Request Body:**
```json
{
  "input": "48656c6c6f",
  "fromFormat": "hex",
  "toFormat": "base64"
}
```

**Response:**
```json
{
  "output": "SGVsbG8=",
  "success": true,
  "error": null
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "OK"
}
```

### GET /api/formats
Get list of supported formats.

**Response:**
```json
{
  "formats": ["hex", "base64", "binary", "decimal", "ascii"]
}
```

## Getting Started

### Prerequisites
- Java 21 or later
- Maven 3.8+

### Build the Project
```bash
./mvnw clean package
```

### Run the Application
```bash
./mvnw mn:run
```

The server will start on `http://localhost:8080`

### Run Tests
```bash
./mvnw test
```

## Frontend Integration

This backend is designed to work with a React frontend. The CORS configuration allows requests from:
- `http://localhost:3000` (Create React App default)
- `http://localhost:5173` (Vite default)

### Example Frontend Usage

```javascript
const convertData = async (input, fromFormat, toFormat) => {
  const response = await fetch('http://localhost:8080/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input,
      fromFormat,
      toFormat
    })
  });
  
  return await response.json();
};

// Usage
const result = await convertData('48656c6c6f', 'hex', 'ascii');
console.log(result.output); // "Hello"
```

## Supported Conversion Examples

### Hex to Base64
```
Input: "48656c6c6f"
Output: "SGVsbG8="
```

### ASCII to Hex
```
Input: "Hello"
Output: "48656c6c6f"
```

### Binary to Decimal
```
Input: "01001000"
Output: "72"
```

### Base64 to ASCII
```
Input: "SGVsbG8="
Output: "Hello"
```

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── example/
│   │           ├── Application.java           # Main application entry point
│   │           ├── controller/
│   │           │   └── ConversionController.java  # REST API endpoints
│   │           ├── service/
│   │           │   └── ConversionService.java     # Conversion logic
│   │           └── dto/
│   │               ├── ConversionRequest.java     # Request DTO
│   │               └── ConversionResponse.java    # Response DTO
│   └── resources/
│       ├── application.properties         # Application configuration
│       └── logback.xml                   # Logging configuration
└── test/
    └── java/
        └── com/
            └── example/
                └── controller/
                    └── ConversionControllerTest.java  # API tests
```

## Configuration

The application can be configured via `src/main/resources/application.properties`:

```properties
# Server port
micronaut.server.port=8080

# CORS Configuration
micronaut.server.cors.enabled=true
micronaut.server.cors.configurations.web.allowedOrigins[0]=http://localhost:3000
```

## Error Handling

The API returns error responses in the following format:

```json
{
  "output": null,
  "success": false,
  "error": "Invalid hex string length"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Technologies Used

- **Java 21** - Programming language
- **Micronaut 4.10.4** - Framework
- **Maven** - Build tool
- **JUnit 5** - Testing framework
- **SLF4J/Logback** - Logging

## Support

For issues or questions, please open an issue on the GitHub repository.

