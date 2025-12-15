# VexlConverter - Java Micronaut Implementation

## Project Overview
This project implements a crypto-to-fiat currency converter matching the functionality of https://github.com/PeterXMR/vexlconverter, using:
- **Backend**: Java Micronaut (REST API)
- **Frontend**: React + TypeScript + Vite (matching the original UI exactly)
- **Database**: PostgreSQL 16
- **Containerization**: Docker + Docker Compose

## Architecture

### Stack
```
┌─────────────────────────────┐
│    Frontend (React/Vite)    │  Port 3000 (Nginx)
├─────────────────────────────┤
│  Backend (Micronaut 4.10)   │  Port 8080 (Tomcat)
├─────────────────────────────┤
│   PostgreSQL 16             │  Port 5432
└─────────────────────────────┘
```

### Services

#### 1. Database Service (PostgreSQL)
- Container: `vexlconverter-db`
- Port: 5432
- Database: `vexlconverter`
- User: `postgres` / Password: `postgres`
- Schema: `exchange_rate` table with BTC->USD/EUR/Custom currency rates
- Persistence: Docker volume `pgdata`

#### 2. Backend Service (Java Micronaut)
- Container: `vexlconverter-app`
- Port: 8080
- Runtime: JRE 21
- Features:
  - REST API endpoints for conversion and rate fetching
  - Scheduled rate refresh every 5 minutes (configurable)
  - Cache freshness checking (5-minute TTL)
  - Fallback to CoinGecko API when rates are stale or missing
  - CORS configured for frontend

#### 3. Frontend Service (React)
- Container: `vexlconverter-frontend`
- Port: 3000
- Served via Nginx
- Features:
  - BTC/ETH/LTC/XMR converter UI
  - Real-time rate display
  - Support for 24+ additional currencies
  - 5-minute auto-refresh of rates
  - Responsive design with dark theme (Vexl brand colors)

## API Endpoints

### Health
```
GET /api/health
→ { "status": "OK" }
```

### Get Current Rate
```
GET /api/rate/{from}/{to}
→ { "success": true, "exchangeRate": 45000.50, "fromCurrency": "BTC", "toCurrency": "EUR" }
```

### Convert Amount
```
POST /api/convert
Body: { "amount": 0.1, "fromCurrency": "BTC", "toCurrency": "EUR" }
→ { "success": true, "convertedAmount": 4500.05, "exchangeRate": 45000.50, ... }
```

### Get Supported Currencies
```
GET /api/currencies
→ { "currencies": ["BTC", "ETH", "LTC", "XMR", "EUR", "USD", ...] }
```

## Running Locally

### Prerequisites
- Docker Desktop (running)
- macOS or Linux
- Git

### Start the Stack
```bash
cd /Users/accountname/Desktop/Projects/demo1

# Build all images
docker compose build --no-cache

# Start all services
docker compose up -d

# Verify all services are running
docker compose ps
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/*
- **Database**: localhost:5432 (postgres/postgres)

### Stop the Stack
```bash
docker compose down
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app      # Backend
docker compose logs -f frontend # Frontend
docker compose logs -f db       # Database
```

## Local Development

### Backend Development
```bash
cd /Users/accountname/Desktop/Projects/demo1

# Build
./mvnw -q -DskipTests package

# Run locally (requires PostgreSQL running at localhost:5432)
java -jar target/demo1-0.1.jar
```

### Frontend Development
```bash
cd /Users/accountname/Desktop/Projects/demo1/frontend

# Install dependencies
npm install

# Start dev server (Vite proxy forwards /api to http://localhost:8080)
npm run dev
# → http://localhost:5173

# Build for production
npm run build
```

## Database Schema

### exchange_rate Table
```sql
CREATE TABLE exchange_rate (
  id BIGSERIAL PRIMARY KEY,
  from_currency VARCHAR(10) NOT NULL,
  to_currency VARCHAR(10) NOT NULL,
  rate DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE (from_currency, to_currency)
);

CREATE INDEX idx_exchange_rate_pair ON exchange_rate (from_currency, to_currency);
CREATE INDEX idx_exchange_rate_updated_at ON exchange_rate (updated_at);
```

## Configuration

### Environment Variables (Docker)
Set in `docker-compose.yml`:
```yaml
DATASOURCES_DEFAULT_URL: jdbc:postgresql://db:5432/vexlconverter
DATASOURCES_DEFAULT_USERNAME: postgres
DATASOURCES_DEFAULT_PASSWORD: postgres
DATASOURCES_DEFAULT_DIALECT: POSTGRES
MICRONAUT_SERVER_PORT: 8080
```

### Application Properties
File: `src/main/resources/application.properties`
- Datasource and JPA/Hibernate configuration
- CORS settings for frontend
- Scheduled task configuration (5-minute refresh)

## Features Implemented

### Backend
✅ REST API with Micronaut 4.10
✅ PostgreSQL persistence with Hibernate JPA
✅ Rate caching with 5-minute freshness TTL
✅ Scheduled refresh job (every 5 minutes)
✅ Fallback to CoinGecko API for live rates
✅ Support for BTC→USD/EUR conversions
✅ Extensible for additional currency pairs
✅ Error handling and validation
✅ CORS enabled for frontend

### Frontend
✅ React + TypeScript + Vite
✅ Matching VexlConverter UI design (1:1 parity)
✅ Dark theme with Vexl brand colors (#FC0377, #9400FF)
✅ BTC/SATS unit toggling
✅ Swap currency functionality
✅ Add/remove custom currencies (24+ options)
✅ Auto-refresh rates every 5 minutes
✅ Responsive design (mobile + desktop)
✅ Loading states and error handling
✅ Footer with version and last update timestamp

## Known Limitations & Future Improvements

### Phase 1 (Current)
- BTC→USD/EUR conversions only (can extend via backend config)
- CoinGecko API integration (free tier, rate limits apply)
- In-memory scheduler (could use dedicated queue for production)

### Phase 2 (Optional)
- Add support for more crypto pairs (ETH, LTC, XMR, etc.)
- Implement rate history and charts
- Add caching layer (Redis) for distributed setups
- Implement JWT authentication
- Add admin panel for rate management
- Set up CI/CD pipeline (GitHub Actions)
- Add metrics and monitoring (Prometheus, Grafana)

## Troubleshooting

### Backend not starting
```bash
# Check logs
docker logs vexlconverter-app

# Ensure PostgreSQL is healthy
docker logs vexlconverter-db

# Restart the stack
docker compose restart
```

### Rates not fetching
- Check internet connectivity (CoinGecko API access)
- Verify database connection in app logs
- Check PostgreSQL for exchange_rate table

### Frontend not loading
```bash
# Clear browser cache and reload
# or check Nginx logs
docker logs vexlconverter-frontend
```

### Port conflicts
If ports 3000, 5173, 8080, or 5432 are in use:
```bash
# Change in docker-compose.yml (port_on_host:port_in_container)
ports:
  - "3001:80"  # Frontend on 3001 instead of 3000
```

## Testing

### API Smoke Tests
```bash
# Health check
curl http://localhost:8080/api/health

# Get rate
curl http://localhost:8080/api/rate/BTC/EUR

# Convert
curl -X POST http://localhost:8080/api/convert \
  -H 'Content-Type: application/json' \
  -d '{"amount":0.1,"fromCurrency":"BTC","toCurrency":"EUR"}'

# Currencies list
curl http://localhost:8080/api/currencies
```

### E2E Test
1. Open http://localhost:3000 in browser
2. See "Vexl Converter" header with gradient
3. Enter BTC amount (e.g., 0.5)
4. See USD/EUR values auto-calculated
5. Click "+ Add Currency" and add GBP or JPY
6. Verify rate updates every 5 minutes
7. Click "Switch to Sats" to toggle units
8. Refresh page; data persists from DB

## File Structure
```
demo1/
├── docker-compose.yml         # Full stack orchestration
├── Dockerfile                 # Backend build
├── src/main/java/
│   └── com/example/
│       ├── controller/        # REST endpoints
│       ├── service/           # Business logic (RateService, etc.)
│       ├── repository/        # JPA repositories
│       ├── entity/            # JPA entities (ExchangeRate)
│       ├── jobs/              # Scheduled tasks (RateRefreshJob)
│       └── config/            # Configuration classes
├── src/main/resources/
│   └── application.properties # Backend config
└── frontend/
    ├── Dockerfile            # Frontend build
    ├── vite.config.ts        # Vite dev proxy config
    ├── tsconfig.json         # TypeScript config
    ├── src/
    │   ├── App.tsx           # Root component
    │   ├── App.css           # Dark gradient background
    │   ├── main.tsx          # Entry point
    │   ├── index.css         # Global styles
    │   └── components/
    │       ├── Converter.tsx  # Main converter UI (1:1 with original)
    │       └── Converter.css  # Styling (matches VexlConverter)
    └── public/               # Static assets
```

## Deployment

### Docker Hub (Optional)
```bash
# Build and tag images
docker tag demo1-app myrepo/vexlconverter-backend:latest
docker tag demo1-frontend myrepo/vexlconverter-frontend:latest

# Push
docker push myrepo/vexlconverter-backend:latest
docker push myrepo/vexlconverter-frontend:latest
```

### Production Notes
- Use environment-specific config files (application-prod.properties)
- Configure proper PostgreSQL backups
- Set up monitoring and alerting
- Use health checks for load balancers
- Implement rate limiting on API endpoints
- Use managed PostgreSQL (AWS RDS, Azure Database, etc.) in production
- Configure CDN for frontend assets

## Support & Contact
For issues or feature requests, refer to the original project:
https://github.com/PeterXMR/vexlconverter

## License
Follows the same license as the original VexlConverter project.

