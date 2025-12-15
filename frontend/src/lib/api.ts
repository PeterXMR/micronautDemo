/**
 * API Client for VexlConverter
 * All /api/* requests are proxied through Nginx to backend:8080
 */

function apiUrl(path: string) {
  // Use relative paths - Nginx will proxy to backend:8080
  return path
}

/**
 * Get latest BTC prices from backend (BTC/USD and BTC/EUR)
 */
export async function getLatestPrices() {
  const res = await fetch(apiUrl('/api/prices/latest'))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<{
    success: boolean
    data?: {
      id: number
      btc_usd: number
      btc_eur: number
      timestamp: string
    }
    error?: string
  }>
}

/**
 * Convert BTC amount to USD and EUR
 * Matches Python API: { "btc_amount": 0.01 }
 */
export async function convert(btcAmount: number) {
  const res = await fetch(apiUrl('/api/convert'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ btc_amount: btcAmount })
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<{
    success: boolean
    data?: {
      btc_amount: number
      usd_amount: number
      eur_amount: number
      rates: {
        btc_usd: number
        btc_eur: number
      }
      timestamp: string
    }
    error?: string
  }>
}

/**
 * Get supported currencies
 */
export async function getCurrencies() {
  const res = await fetch(apiUrl('/api/currencies'))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<{ currencies: string[] }>
}

/**
 * Health check
 */
export async function health() {
  const res = await fetch(apiUrl('/api/health'))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<{ status: string; version: string }>
}

