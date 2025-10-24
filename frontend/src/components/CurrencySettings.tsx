import { useState, useEffect } from 'react';
import { Currency, CURRENCIES } from '../types';
import { settingsService } from '../services/settingsService';
import { currencyService } from '../services/currencyService';

interface CurrencySettingsProps {
  onClose: () => void;
}

export function CurrencySettings({ onClose }: CurrencySettingsProps) {
  const [mainCurrency, setMainCurrency] = useState<Currency>(settingsService.getMainCurrency());
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLastUpdated();
  }, []);

  const loadLastUpdated = async () => {
    try {
      const data = await currencyService.fetchExchangeRates();
      setLastUpdated(data.lastUpdated || 'Unknown');
    } catch (error) {
      console.error('Error loading exchange rates info:', error);
    }
  };

  const handleCurrencyChange = (currency: Currency) => {
    setMainCurrency(currency);
    settingsService.setMainCurrency(currency);
  };

  const handleRefreshRates = async () => {
    setRefreshing(true);
    try {
      await currencyService.refreshRates();
      await loadLastUpdated();
    } catch (error) {
      console.error('Error refreshing rates:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatLastUpdated = (dateString: string) => {
    if (!dateString || dateString === 'Unknown') return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="currency-settings-overlay">
      <div className="currency-settings">
        <div className="settings-header">
          <h2>💱 Currency Settings</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label htmlFor="main-currency">Main Currency</label>
            <p className="setting-description">
              All expenses will be converted to this currency for display and analytics.
            </p>
            <select
              id="main-currency"
              value={mainCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
              className="currency-select"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-group">
            <label>Exchange Rates</label>
            <p className="setting-description">
              Exchange rates are updated automatically. Last update: {formatLastUpdated(lastUpdated)}
            </p>
            <button
              onClick={handleRefreshRates}
              disabled={refreshing}
              className="refresh-btn"
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Rates'}
            </button>
          </div>

          <div className="setting-group">
            <label>How it works</label>
            <div className="info-box">
              <p>• When adding expenses, you can choose any supported currency</p>
              <p>• All amounts are converted to your main currency for consistency</p>
              <p>• Exchange rates are fetched from a reliable API and cached for performance</p>
              <p>• Analytics and totals always show amounts in your main currency</p>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button onClick={onClose} className="done-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}