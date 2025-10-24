import { Currency, UserSettings, CURRENCIES } from '../types';

const SETTINGS_KEY = 'expense-tracker-settings';
const DEFAULT_SETTINGS: UserSettings = {
  mainCurrency: 'USD',
};

class SettingsService {
  private settings: UserSettings;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Error loading settings from localStorage:', error);
    }
    return DEFAULT_SETTINGS;
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

  getMainCurrency(): Currency {
    return this.settings.mainCurrency;
  }

  setMainCurrency(currency: Currency): void {
    this.settings.mainCurrency = currency;
    this.saveSettings();
    // Notify all listeners about the currency change
    this.listeners.forEach(listener => listener());
  }

  addCurrencyChangeListener(listener: () => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  getMainCurrencyInfo() {
    return CURRENCIES.find(c => c.code === this.settings.mainCurrency) || CURRENCIES[0];
  }

  getAllSettings(): UserSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<UserSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }
}

export const settingsService = new SettingsService();