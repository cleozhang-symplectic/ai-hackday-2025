import { Currency } from '../types';

interface ConversionResult {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  exchangeRate: number;
}

interface ExchangeRatesResponse {
  rates: Array<{
    from: Currency;
    to: Currency;
    rate: number;
    lastUpdated: string;
  }>;
  lastUpdated: string;
}

// Fallback exchange rates (base: USD) - approximate rates
const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.85,
  CAD: 1.37,
  AUD: 1.52,
  CHF: 0.91,
  CNY: 7.31,
  INR: 83.12,
  SGD: 1.34,
  HKD: 7.80,
  NZD: 1.64,
};

class CurrencyService {
  private cache: Map<string, { rate: number; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour
  private readonly API_BASE = '/api/currency';

  private getCacheKey(from: Currency, to: Currency): string {
    return `${from}-${to}`;
  }

  async fetchExchangeRates(): Promise<ExchangeRatesResponse> {
    const response = await fetch(`${this.API_BASE}/rates`);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    return response.json();
  }

  async getExchangeRate(from: Currency, to: Currency): Promise<number> {
    if (from === to) return 1;

    const cacheKey = this.getCacheKey(from, to);
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.rate;
    }

    try {
      const response = await fetch(`${this.API_BASE}/convert?amount=1&from=${from}&to=${to}`);
      if (!response.ok) {
        throw new Error('Failed to get exchange rate');
      }
      
      const data: ConversionResult = await response.json();
      const rate = data.exchangeRate;
      
      this.cache.set(cacheKey, { rate, timestamp: now });
      return rate;
    } catch (error) {
      console.error(`Error fetching exchange rate from ${from} to ${to}:`, error);
      console.warn('Currency API is not available. Using fallback rates.');
      
      // Use fallback rates for more realistic conversions
      return this.getFallbackRate(from, to);
    }
  }

  private getFallbackRate(from: Currency, to: Currency): number {
    if (from === to) return 1;
    
    // Convert from -> USD -> to using fallback rates
    const fromToUsd = from === 'USD' ? 1 : (1 / FALLBACK_RATES[from]);
    const usdToTarget = FALLBACK_RATES[to];
    
    return fromToUsd * usdToTarget;
  }

  async convertAmount(amount: number, from: Currency, to: Currency): Promise<number> {
    if (from === to) return amount;
    
    const rate = await this.getExchangeRate(from, to);
    return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
  }

  async refreshRates(): Promise<void> {
    try {
      await fetch(`${this.API_BASE}/refresh`, { method: 'POST' });
      this.cache.clear(); // Clear cache to force fresh fetches
    } catch (error) {
      console.error('Error refreshing exchange rates:', error);
    }
  }

  formatAmount(amount: number, currency: Currency): string {
    const currencyInfo = this.getCurrencyInfo(currency);
    
    // Use Intl.NumberFormat for proper currency formatting
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      // Fallback if the currency is not supported by Intl
      return `${currencyInfo.symbol}${amount.toFixed(2)}`;
    }
  }

  private getCurrencyInfo(currency: Currency) {
    const currencyMap = {
      USD: { symbol: '$' },
      EUR: { symbol: '€' },
      GBP: { symbol: '£' },
      JPY: { symbol: '¥' },
      CAD: { symbol: 'C$' },
      AUD: { symbol: 'A$' },
      CHF: { symbol: 'CHF' },
      CNY: { symbol: '¥' },
      INR: { symbol: '₹' },
      SGD: { symbol: 'S$' },
      HKD: { symbol: 'HK$' },
      NZD: { symbol: 'NZ$' },
    };
    
    return currencyMap[currency] || { symbol: currency };
  }
}

export const currencyService = new CurrencyService();