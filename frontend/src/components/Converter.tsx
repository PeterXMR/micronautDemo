import React, { useEffect, useState, useRef } from 'react'
import { convert, getLatestPrices } from '../lib/api'
import './Converter.css'

interface Currency {
  code: string
  symbol: string
  name: string
  rate?: number
  amount?: string
}

interface RatesData {
  btc_usd: number
  btc_eur: number
}


function Converter() {
  const [btcAmount, setBtcAmount] = useState('')
  const [usdAmount, setUsdAmount] = useState('')
  const [eurAmount, setEurAmount] = useState('')
  const [rates, setRates] = useState<RatesData>({ btc_usd: 0, btc_eur: 0 })
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unit, setUnit] = useState<'BTC' | 'SATS'>('BTC')
  const [additionalCurrencies, setAdditionalCurrencies] = useState<Currency[]>([])
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  const SATS_PER_BTC = 100000000
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const availableCurrencies: Currency[] = [
    { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'PYG', symbol: '₲', name: 'Paraguayan Guarani' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  ]

  useEffect(() => {
    fetchLatestPrices()
    const interval = setInterval(fetchLatestPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchLatestPrices = async () => {
    try {
      // Fetch both USD and EUR rates in one call
      const data = await getLatestPrices()
      if (!cancelled && data.success && data.data) {
        setRates({
          btc_usd: data.data.btc_usd || 0,
          btc_eur: data.data.btc_eur || 0
        })
        setLastUpdate(new Date())
        setError(null)
      } else if (!cancelled && !data.success) {
        setError(data.error || 'Failed to fetch prices')
      }
    } catch (err) {
      if (!cancelled) {
        setError('Failed to fetch latest prices')
        console.error(err)
      }
    }
  }

  const performConversion = async (btcValue: number) => {
    if (!btcValue || btcValue <= 0) {
      setUsdAmount('')
      setEurAmount('')
      setAdditionalCurrencies(prev => prev.map(curr => ({ ...curr, amount: '' })))
      return
    }

    const input = inputRef.current
    const start = input?.selectionStart
    const end = input?.selectionEnd

    setLoading(true)
    try {
      const data = await convert(btcValue)

      if (data.success && data.data) {
        setUsdAmount(data.data.usd_amount.toString())
        setEurAmount(data.data.eur_amount.toString())

        if (additionalCurrencies.length > 0) {
          await fetchAdditionalRates(btcValue)
        }

        setError(null)
        setTimeout(() => {
          if (input && document.activeElement !== input) {
            input.focus()
            if (start !== null && end !== null) {
              input.setSelectionRange(start, end)
            }
          }
        }, 0)
      } else {
        setError(data.error || 'Conversion failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
      console.error(err)
      setTimeout(() => {
        if (input) input.focus()
      }, 0)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdditionalRates = async (btcValue: number) => {
    try {
      const currencyCodes = additionalCurrencies.map(c => c.code.toLowerCase()).join(',')
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currencyCodes}`
      )
      if (!response.ok) throw new Error('Failed to fetch rates')
      const data = await response.json()

      if (data && data.bitcoin) {
        setAdditionalCurrencies(prev =>
          prev.map(curr => ({
            ...curr,
            rate: data.bitcoin[curr.code.toLowerCase()] || 0,
            amount: ((data.bitcoin[curr.code.toLowerCase()] || 0) * btcValue).toFixed(2)
          }))
        )
      }
    } catch (err) {
      console.error('Failed to fetch additional rates:', err)
    }
  }

  const addCurrency = (currency: Currency) => {
    if (!additionalCurrencies.find(c => c.code === currency.code)) {
      setAdditionalCurrencies(prev => [...prev, { ...currency, rate: 0, amount: '' }])
      setShowCurrencyPicker(false)

      if (btcAmount && !isNaN(parseFloat(btcAmount)) && parseFloat(btcAmount) > 0) {
        const btcValue = unit === 'SATS' ? parseFloat(btcAmount) / SATS_PER_BTC : parseFloat(btcAmount)
        performConversion(btcValue)
      }
    }
  }

  const removeCurrency = (currencyCode: string) => {
    setAdditionalCurrencies(prev => prev.filter(c => c.code !== currencyCode))
  }

  const handleBtcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    if (value === '') {
      setBtcAmount('')
      setUsdAmount('')
      setEurAmount('')
      return
    }

    if (unit === 'BTC') {
      if (!/^\d*\.?\d{0,8}$/.test(value)) {
        return
      }
    } else {
      if (!/^\d*$/.test(value)) {
        return
      }
    }

    setBtcAmount(value)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    const numValue = parseFloat(value)

    if (!isNaN(numValue) && numValue > 0) {
      const btcValue = unit === 'SATS' ? numValue / SATS_PER_BTC : numValue

      debounceTimer.current = setTimeout(() => {
        performConversion(btcValue)
      }, 800)
    } else {
      setUsdAmount('')
      setEurAmount('')
    }
  }

  const toggleUnit = () => {
    const newUnit = unit === 'BTC' ? 'SATS' : 'BTC'
    setUnit(newUnit)

    if (btcAmount && btcAmount !== '' && !isNaN(parseFloat(btcAmount))) {
      const currentValue = parseFloat(btcAmount)
      if (newUnit === 'SATS') {
        const satsValue = Math.round(currentValue * SATS_PER_BTC)
        setBtcAmount(satsValue.toString())
      } else {
        const btcValue = currentValue / SATS_PER_BTC
        setBtcAmount(btcValue.toFixed(8).replace(/\.?0+$/, ''))
      }
    }

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 0)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <div className="converter">
      <div className="header">
        <h1>Vexl Converter</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="converter-box">
        <h2>Convert BTC</h2>

        <div className="input-section">
          <div className="input-header">
            <label htmlFor="btc-input">
              <span className="icon">₿</span>
              Enter {unit} Amount
            </label>
            <button className="unit-toggle" onClick={toggleUnit} type="button">
              Switch to {unit === 'BTC' ? 'Sats' : 'BTC'}
            </button>
          </div>
          <input
            ref={inputRef}
            id="btc-input"
            type="text"
            inputMode="decimal"
            value={btcAmount}
            onChange={handleBtcChange}
            placeholder={unit === 'BTC' ? '0.00001' : '1000'}
            autoComplete="off"
            autoFocus
          />
          <div className="info-text">
            {unit === 'BTC'
              ? '1 BTC = 100,000,000 satoshis'
              : '1 BTC = 100,000,000 satoshis'}
          </div>
        </div>

        <div className="arrow">↓</div>

        <div className="output-section">
          <div className="output-field">
            <label>
              <span className="icon">$</span>
              USD Value
            </label>
            <input
              type="text"
              className="output-input"
              value={usdAmount || '\u00A0'}
              readOnly
              placeholder="0.00"
            />
            <div className="btc-rate">{rates.btc_usd > 0 ? `1 BTC = $${formatNumber(rates.btc_usd)}` : '\u00A0'}</div>
          </div>

          <div className="output-field">
            <label>
              <span className="icon">€</span>
              EUR Value
            </label>
            <input
              type="text"
              className="output-input"
              value={eurAmount || '\u00A0'}
              readOnly
              placeholder="0.00"
            />
            <div className="btc-rate">{rates.btc_eur > 0 ? `1 BTC = €${formatNumber(rates.btc_eur)}` : '\u00A0'}</div>
          </div>
        </div>

        {additionalCurrencies.map((currency) => (
          <div key={currency.code} className="output-section additional-currency">
            <div className="output-field output-field-additional">
              <label>
                <span className="icon">{currency.symbol}</span>
                {currency.name} ({currency.code})
                <button
                  className="remove-currency-btn"
                  onClick={() => removeCurrency(currency.code)}
                  type="button"
                  title="Remove currency"
                >
                  ✕
                </button>
              </label>
              <input
                type="text"
                className="output-input"
                value={currency.amount || '\u00A0'}
                readOnly
                placeholder="0.00"
              />
              <div className="btc-rate">
                {currency.rate && currency.rate > 0 ? `1 BTC = ${currency.symbol}${formatNumber(currency.rate)}` : '\u00A0'}
              </div>
            </div>
          </div>
        ))}

        <div className="add-currency-section">
          <button
            className="add-currency-btn"
            onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
            type="button"
          >
            + Add Currency
          </button>
        </div>

        {showCurrencyPicker && (
          <div className="currency-picker">
            <h3>Select Currency</h3>
            <div className="currency-list">
              {availableCurrencies
                .filter(curr => !additionalCurrencies.find(c => c.code === curr.code))
                .map((currency) => (
                  <button
                    key={currency.code}
                    className="currency-option"
                    onClick={() => addCurrency(currency)}
                    type="button"
                  >
                    <span className="currency-symbol">{currency.symbol}</span>
                    <span className="currency-info">
                      <strong>{currency.code}</strong> - {currency.name}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {loading && <div className="loading">Converting...</div>}
      </div>

      <div className="footer">
        <p className="footer-version">MVP v0.0.1</p>
        {lastUpdate && (
          <p className="footer-update">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  )
}

export default Converter

