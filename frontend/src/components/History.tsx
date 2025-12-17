import React, { useEffect, useState } from 'react'
import './History.css'

interface RateHistory {
  id: number
  btc_usd: number
  btc_eur: number
  timestamp: string
}

function History() {
  const [history, setHistory] = useState<RateHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataPoints, setDataPoints] = useState(0)

  useEffect(() => {
    fetchRateHistory()
    // Refresh every 5 minutes
    const interval = setInterval(fetchRateHistory, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchRateHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/history/last-24h')
      if (!response.ok) throw new Error('Failed to fetch history')

      const data = await response.json()
      if (data.success && data.data) {
        setHistory(data.data)
        setDataPoints(data.data.length)
        setError(null)
      } else {
        setError(data.error || 'No data available')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getMinMaxAvg = (rates: number[]) => {
    if (rates.length === 0) return { min: 0, max: 0, avg: 0 }
    return {
      min: Math.min(...rates),
      max: Math.max(...rates),
      avg: rates.reduce((a, b) => a + b, 0) / rates.length
    }
  }

  const renderChart = (data: RateHistory[], key: 'btc_usd' | 'btc_eur', currency: string, color: string) => {
    if (data.length === 0) return <div className="chart-empty">No data available</div>

    const rates = data.map(r => r[key])
    const { min, max, avg } = getMinMaxAvg(rates)
    const range = max - min || 1
    const current = rates[rates.length - 1]

    // SVG chart dimensions
    const width = 800
    const height = 250
    const padding = 40

    // Calculate points for line chart
    const points = rates.map((rate, idx) => {
      const x = padding + (idx / (rates.length - 1 || 1)) * (width - padding * 2)
      const y = height - padding - ((rate - min) / range) * (height - padding * 2)
      return { x, y, rate }
    })

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    return (
      <div className="chart-card">
        <h3>{currency}</h3>
        <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />

          {/* Area under curve */}
          <defs>
            <linearGradient id={`gradient-${currency}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`} fill={`url(#gradient-${currency})`} />

          {/* Line chart */}
          <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} opacity="0.7" />
          ))}
        </svg>

        <div className="chart-stats">
          <div className="stat">
            <span className="label">Min</span>
            <span className="value">${min.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="label">Max</span>
            <span className="value">${max.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="label">Avg</span>
            <span className="value">${avg.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="label">Current</span>
            <span className="value">${current.toFixed(2)}</span>
          </div>
        </div>
      </div>
    )
  }

  if (loading && history.length === 0) {
    return (
      <div className="history-container">
        <div className="loading">📊 Loading rate history...</div>
      </div>
    )
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>📊 Rate History</h1>
        <p>Last 24 Hours of BTC Exchange Rates</p>
        <button className="refresh-btn" onClick={fetchRateHistory} disabled={loading}>
          {loading ? '🔄 Loading...' : '🔄 Refresh Now'}
        </button>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {history.length > 0 ? (
        <div className="charts-grid">
          {renderChart(history, 'btc_usd', 'BTC/USD', '#00FF00')}
          {renderChart(history, 'btc_eur', 'BTC/EUR', '#FC0377')}
        </div>
      ) : (
        <div className="no-data">
          <p>No historical data available yet.</p>
          <p>Data is collected automatically every 5 minutes. Check back soon!</p>
        </div>
      )}

      <div className="history-footer">
        <p>💡 Charts update automatically every 5 minutes</p>
        <p>📈 Data points collected: {dataPoints}</p>
        {history.length > 0 && (
          <p>⏱️ Time range: {new Date(history[0].timestamp).toLocaleString()} → {new Date(history[history.length - 1].timestamp).toLocaleString()}</p>
        )}
      </div>
    </div>
  )
}

export default History

