import { Currency, ExchangeRate } from '../types';

// Manual fallback rates (base: USD)
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
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  private getRateKey(from: Currency, to: Currency): string {
    return `${from}-${to}`;
  }

  async fetchExchangeRates(): Promise<void> {
    try {
      // Using exchangerate-api.com (free tier: 1500 requests/month)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      if (data.rates) {
        // Store rates with USD as base
        Object.keys(FALLBACK_RATES).forEach(currency => {
          const rate = data.rates[currency] || FALLBACK_RATES[currency as Currency];
          this.exchangeRates.set(
            this.getRateKey('USD', currency as Currency),
            {
              from: 'USD',
              to: currency as Currency,
              rate,
              lastUpdated: new Date().toISOString(),
            }
          );
        });
        
        this.lastFetch = new Date();
        console.log('Exchange rates updated from API');
      }
    } catch (error) {
      console.warn('Failed to fetch exchange rates from API, using fallback rates:', error);
      this.useFallbackRates();
    }
  }

  private useFallbackRates(): void {
    Object.entries(FALLBACK_RATES).forEach(([currency, rate]) => {
      this.exchangeRates.set(
        this.getRateKey('USD', currency as Currency),
        {
          from: 'USD',
          to: currency as Currency,
          rate,
          lastUpdated: new Date().toISOString(),
        }
      );
    });
    this.lastFetch = new Date();
  }

  private async ensureRatesLoaded(): Promise<void> {
    const now = new Date();
    
    if (!this.lastFetch || (now.getTime() - this.lastFetch.getTime()) > this.CACHE_DURATION) {
      await this.fetchExchangeRates();
    }
  }

  async convertAmount(amount: number, from: Currency, to: Currency): Promise<number> {
    if (from === to) return amount;

    await this.ensureRatesLoaded();

    // Convert from -> USD -> to
    const fromToUsd = from === 'USD' ? 1 : (1 / (this.exchangeRates.get(this.getRateKey('USD', from))?.rate || 1));
    const usdToTarget = this.exchangeRates.get(this.getRateKey('USD', to))?.rate || 1;
    
    return amount * fromToUsd * usdToTarget;
  }

  async getExchangeRate(from: Currency, to: Currency): Promise<number> {
    if (from === to) return 1;

    await this.ensureRatesLoaded();

    const fromToUsd = from === 'USD' ? 1 : (1 / (this.exchangeRates.get(this.getRateKey('USD', from))?.rate || 1));
    const usdToTarget = this.exchangeRates.get(this.getRateKey('USD', to))?.rate || 1;
    
    return fromToUsd * usdToTarget;
  }

  async getAllRates(): Promise<ExchangeRate[]> {
    await this.ensureRatesLoaded();
    return Array.from(this.exchangeRates.values());
  }

  getLastUpdateTime(): Date | null {
    return this.lastFetch;
  }
}

export const currencyService = new CurrencyService();