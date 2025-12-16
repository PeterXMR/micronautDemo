# Project File Structure & Key Files

## Root Directory
```
/Users/accountname/Desktop/Projects/demo1/
```

## Critical Files for Running

### Docker Orchestration (Required to Start Stack)
```
docker-compose.yml          ← Run: docker compose up -d
Dockerfile                  ← Backend build (Java)
frontend/Dockerfile         ← Frontend build (Node/Nginx)
```

### Backend Configuration (Required to Connect to DB)
```
src/main/resources/application.properties
  - datasources.default.url=jdbc:postgresql://localhost:5432/vexlconverter
  - datasources.default.username=postgres
  - datasources.default.password=postgres
  - jpa.default.enabled=true
  - micronaut.scheduled.enabled=true
```

### Frontend Configuration (Required for Dev Server)
```
frontend/vite.config.ts     ← Dev proxy + build config
frontend/tsconfig.json      ← TypeScript settings
frontend/src/main.tsx       ← React entry point
```

---

## Complete File Tree

### Backend Source Code
```
src/main/java/com/example/
├── Application.java                    ← Entry point (Micronaut.run)
├── controller/
│   ├── ConversionController.java       ← REST endpoints
│   └── FrontendController.java
├── service/
│   ├── RateService.java                ← Core logic (cache, fetch, upsert)
│   └── CryptoConversionService.java
├── repository/
│   └── ExchangeRateRepository.java     ← Micronaut Data JPA
├── entity/
│   └── ExchangeRate.java               ← JPA entity
├── dto/
│   ├── ConversionRequest.java
│   └── ConversionResponse.java
├── jobs/
│   └── RateRefreshJob.java             ← Scheduled 5-min refresh
└── config/
    └── (placeholder for config beans if needed)
```

### Backend Configuration
```
src/main/resources/
├── application.properties               ← Database, JPA, CORS, scheduler
├── logback.xml                         ← Logging configuration
└── static/
    └── index.html                      ← Optional static frontend
```

### Backend Tests
```
src/test/java/com/example/
├── Demo1Test.java
├── controller/
│   └── ConversionControllerTest.java
└── service/
    └── CryptoConversionServiceTest.java
```

### Frontend Source Code
```
frontend/src/
├── App.tsx                             ← Root component
├── App.css                             ← Dark gradient background
├── main.tsx                            ← React entry point
├── index.css                           ← Global styles
├── lib/
│   └── api.ts                          ← API client (convert, getRate, getCurrencies)
└── components/
    ├── Converter.tsx                   ← Main converter UI (1:1 VexlConverter)
    └── Converter.css                   ← Styling
```

### Frontend Configuration
```
frontend/
├── Dockerfile                          ← Build: Node → Nginx
├── package.json                        ← npm dependencies (React, Vite, TypeScript)
├── vite.config.ts                      ← Dev server + proxy
├── tsconfig.json                       ← TypeScript compilation
├── .gitignore
├── dist/                               ← Build output (npm run build)
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.css
│   │   └── index-*.js
│   └── ...
└── node_modules/                       ← npm packages
```

### Build Output
```
target/
├── classes/                            ← Compiled .class files
├── generated-sources/
├── demo1-0.1.jar                       ← Main backend JAR (executable)
├── original-demo1-0.1.jar
└── ...
```

### Documentation
```
PROJECT_SUMMARY.md                      ← Complete overview (you're reading this!)
QUICKSTART.md                           ← 5-minute setup guide
IMPLEMENTATION_GUIDE.md                 ← Technical deep-dive
COMPLETION_CHECKLIST.md                 ← Feature checklist
README.md                               ← Original project README
API_README.md                           ← API documentation
SWAGGER_GUIDE.md                        ← API docs via Swagger
```

### Docker Assets
```
docker-compose.yml                      ← Orchestrate db + app + frontend
Dockerfile                              ← Backend containerization
frontend/Dockerfile                     ← Frontend containerization
```

### Database
```
(No files—PostgreSQL runs in Docker container)
- Data stored in Docker volume: demo1_pgdata
- Tables: exchange_rate
- Persists across container restarts
```

---

## How to Navigate

### To Start Everything
1. `cd /Users/accountname/Desktop/Projects/demo1`
2. `docker compose up -d`
3. Visit http://localhost:3000

### To Modify Backend
1. Edit: `src/main/java/com/example/service/RateService.java`
2. Rebuild: `./mvnw -q -DskipTests package`
3. Redeploy: `docker compose build app && docker compose up -d app`

### To Modify Frontend
1. Edit: `frontend/src/components/Converter.tsx` (or .css)
2. Rebuild: `cd frontend && npm run build`
3. Redeploy: `docker compose build frontend && docker compose up -d frontend`

### To Change Configuration
1. Edit: `src/main/resources/application.properties`
2. Rebuild backend as above

---

## Size Summary
```
Backend JAR:        ~35 MB (target/demo1-0.1.jar)
Frontend dist:      ~150 KB (frontend/dist/)
Docker images:
  - demo1-app:        ~400 MB (Java 21 JRE + Micronaut)
  - demo1-frontend:   ~40 MB (Nginx Alpine + React assets)
  - postgres:16       ~200 MB (PostgreSQL image, pulled from registry)
```

---

## Git Status
```
Tracked files:
  ✅ src/main/java/**/*.java
  ✅ src/main/resources/*.properties
  ✅ frontend/src/**/*.tsx (or .ts, .css)
  ✅ docker-compose.yml
  ✅ Dockerfile (both root and frontend/)
  ✅ pom.xml
  ✅ frontend/package.json

Untracked (build artifacts):
  ❌ target/
  ❌ frontend/dist/
  ❌ frontend/node_modules/
  ❌ .mvn/
```

---

## Key Dependencies

### Backend (pom.xml)
- `io.micronaut:micronaut-core:4.10.4`
- `io.micronaut.data:micronaut-data-hibernate-jpa:4.10.4`
- `io.micronaut.sql:micronaut-jdbc-hikari`
- `org.postgresql:postgresql` (runtime)
- `jakarta.persistence:jakarta.persistence-api`

### Frontend (package.json)
- `react@^18.3`
- `typescript@^5.6`
- `vite@^5.4`
- `@vitejs/plugin-react@^4.3`

---

## Important Paths to Remember

| What | Path |
|------|------|
| Backend source | `src/main/java/com/example/` |
| Backend config | `src/main/resources/application.properties` |
| Frontend source | `frontend/src/` |
| Frontend config | `frontend/vite.config.ts` |
| Docker compose | `./docker-compose.yml` |
| Docker build (backend) | `./Dockerfile` |
| Docker build (frontend) | `./frontend/Dockerfile` |
| Built JAR | `target/demo1-0.1.jar` |
| Built frontend | `frontend/dist/` |

---

## Makefile-like Commands (Bash Aliases)

Create these in your `.bashrc` or `.zshrc`:

```bash
alias vexl-start='cd /Users/accountname/Desktop/Projects/demo1 && docker compose up -d'
alias vexl-stop='cd /Users/accountname/Desktop/Projects/demo1 && docker compose down'
alias vexl-logs='cd /Users/accountname/Desktop/Projects/demo1 && docker compose logs -f'
alias vexl-build='cd /Users/accountname/Desktop/Projects/demo1 && docker compose build --no-cache'
alias vexl-backend='cd /Users/accountname/Desktop/Projects/demo1 && ./mvnw -q -DskipTests package'
alias vexl-frontend='cd /Users/accountname/Desktop/Projects/demo1/frontend && npm run build'
```

Then:
```bash
vexl-build   # Build all images
vexl-start   # Start stack
vexl-logs    # View logs
vexl-stop    # Stop stack
```

---

## Quick Reference

### API Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/rate/{from}/{to}` | Get exchange rate |
| POST | `/api/convert` | Convert amount |
| GET | `/api/currencies` | List currencies |

### Ports
| Service | Port | Access |
|---------|------|--------|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 8080 | http://localhost:8080 |
| Database | 5432 | localhost:5432 (postgres/postgres) |
| Frontend (dev) | 5173 | http://localhost:5173 |

### Database
| Field | Value |
|-------|-------|
| Host | localhost (or `db` in Docker) |
| Port | 5432 |
| Database | vexlconverter |
| User | postgres |
| Password | postgres |
| Table | exchange_rate |

---

This file structure is organized for scalability and maintainability. All components are independent and can be updated without affecting others (except for API contracts).

