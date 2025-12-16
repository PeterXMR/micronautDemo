# Quick Start Guide

## 5-Minute Setup

### 1. Prerequisites
- macOS with Docker Desktop installed and running
- Git
- Terminal

### 2. Navigate to Project
```bash
cd /Users/accountname/Desktop/Projects/demo1
```

### 3. Build & Start Stack
```bash
# Build all Docker images (takes ~2 minutes)
docker compose build --no-cache

# Start all services
docker compose up -d

# Check status
docker compose ps
```

### 4. Wait for Services to Be Ready
```bash
# Check backend startup
docker logs -f vexlconverter-app

# When you see "Startup completed in XXXms", press Ctrl+C
```

### 5. Open Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/health

## What You'll See

### Frontend UI
- **Header**: "Vexl Converter" in gradient pink/purple
- **Main Input**: Field to enter BTC amount
- **Outputs**: 
  - USD value (auto-calculated)
  - EUR value (auto-calculated)
  - Current exchange rates below each
- **Controls**:
  - "Switch to Sats" button to toggle BTC/Satoshi units
  - "⇅" button to swap currencies
  - "+ Add Currency" button to add 24+ additional currencies
- **Footer**: MVP v0.0.1 with last update timestamp

### Using the Converter

1. **Enter an amount** (e.g., 0.5 BTC)
   → USD and EUR amounts appear instantly

2. **Add more currencies**
   - Click "+ Add Currency"
   - Select GBP, JPY, CHF, etc.
   - Rates fetch from CoinGecko and display

3. **Switch units**
   - Click "Switch to Sats" to convert to satoshis
   - Click again to convert back to BTC

4. **Auto-refresh**
   - Leave the page open
   - Rates update every 5 minutes automatically

## Accessing the Backend

### Health Check
```bash
curl http://localhost:8080/api/health
# Response: {"status":"OK"}
```

### Get Current Rate
```bash
curl http://localhost:8080/api/rate/BTC/EUR
# Response: {"success":true,"exchangeRate":45000.50,...}
```

### Convert Amount
```bash
curl -X POST http://localhost:8080/api/convert \
  -H 'Content-Type: application/json' \
  -d '{"amount":0.1,"fromCurrency":"BTC","toCurrency":"EUR"}'
# Response: {"success":true,"convertedAmount":4500.05,...}
```

### List Supported Currencies
```bash
curl http://localhost:8080/api/currencies
# Response: {"currencies":["BTC","ETH","LTC","XMR","EUR","USD",...]}
```

## Stopping the Stack

```bash
# Stop all containers (data persists)
docker compose down

# Stop and remove all volumes (WARNING: deletes database)
docker compose down -v
```

## Viewing Logs

```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f app
docker compose logs -f frontend
docker compose logs -f db

# Last 50 lines
docker compose logs --tail=50 app
```

## Local Development (Without Docker)

### Backend
```bash
# Ensure PostgreSQL is running at localhost:5432
# Create database: createdb vexlconverter

cd /Users/accountname/Desktop/Projects/demo1
./mvnw -q -DskipTests package
java -jar target/demo1-0.1.jar
# Backend runs at http://localhost:8080
```

### Frontend
```bash
cd /Users/accountname/Desktop/Projects/demo1/frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
# Vite proxy forwards /api to http://localhost:8080
```

## Troubleshooting

### Docker daemon stopped?
- Open Docker Desktop
- Wait for "Engine running" message
- Re-run: `docker compose up -d`

### Port 8080 already in use?
```bash
# Find what's using port 8080
lsof -i :8080

# Kill it (be careful!)
kill -9 <PID>

# Or change port in docker-compose.yml:
# ports:
#   - "8081:8080"  # Backend on 8081
```

### Database connection fails?
```bash
# Check PostgreSQL is healthy
docker compose logs db

# Manually connect to verify
docker exec vexlconverter-db psql -U postgres -d vexlconverter -c "\dt"
# Should show: exchange_rate table
```

### Frontend shows empty results?
- Open browser DevTools → Network tab
- Check if /api calls are hitting http://localhost:8080
- Check backend logs: `docker logs vexlconverter-app`

### Rates not updating?
- Check internet connectivity (needs CoinGecko API)
- Verify backend logs: `docker logs vexlconverter-app`
- Check database: `docker exec vexlconverter-db psql -U postgres -d vexlconverter -c "SELECT * FROM exchange_rate;"`

## Architecture Overview

```
User Browser (http://localhost:3000)
           ↓
    React Frontend (Nginx)
           ↓
    /api/* (proxy)
           ↓
Java Micronaut Backend (http://localhost:8080)
           ↓
    PostgreSQL Database (localhost:5432)
           ↓
    CoinGecko API (external)
```

## Features at a Glance

| Feature | Status | Notes |
|---------|--------|-------|
| BTC→USD/EUR conversion | ✅ | Real-time, cached, auto-refresh |
| Additional currencies | ✅ | 24+ options (GBP, JPY, CHF, etc.) |
| Unit toggle (BTC/SATS) | ✅ | Instant conversion |
| Swap currencies | ✅ | Click ⇅ button |
| Rate auto-refresh | ✅ | Every 5 minutes |
| Database persistence | ✅ | PostgreSQL with 5-min TTL |
| Dark theme (Vexl style) | ✅ | Pink/purple gradients |
| Mobile responsive | ✅ | Works on tablet/phone |
| Error handling | ✅ | Graceful fallbacks |
| CORS enabled | ✅ | Frontend can call backend |

## Next Steps

1. **Customize**: Edit `src/main/resources/application.properties` to change settings
2. **Extend**: Add more currency pairs in `RateRefreshJob.java`
3. **Monitor**: Set up logging/monitoring in production
4. **Deploy**: Push to Docker Hub, deploy to cloud (AWS, Azure, etc.)

## Support

For issues:
1. Check logs: `docker compose logs -f`
2. Check connectivity: `curl http://localhost:8080/api/health`
3. Verify database: `docker exec vexlconverter-db psql -U postgres -d vexlconverter -c "\d"`

Enjoy your VexlConverter! 🚀

