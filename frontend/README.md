# Vexl Converter Frontend (React/Vite)

## Dev Run

```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

Backend must be running at http://localhost:8080; proxy is set for /api.

## Build & Serve from Micronaut

```bash
cd frontend
npm run build:copy
```
This copies `dist/` to `src/main/resources/public` in the backend. Micronaut will serve the built React app at `http://localhost:8080/`.

## API
- POST /api/convert { amount, fromCurrency, toCurrency }
- GET /api/health
- GET /api/currencies

# Frontend

This is a React + Vite frontend for the converter.

## Local development

- Backend: start at http://localhost:8080
- Frontend: start dev server

```bash
npm install
npm run dev
```

Vite proxy forwards `/api` to the backend.

## Production build

```bash
npm run build
npm run preview
```

## Docker

- Build and run via docker-compose from project root
- Frontend container listens on http://localhost:3000
- API calls target the backend at http://localhost:8080 (same compose network)

To override API base URL at build-time:

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run build
```
