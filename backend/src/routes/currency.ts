import { Router, Request, Response } from 'express';
import { currencyService } from '../services/currencyService';
import { Currency } from '../types';

export const currencyRouter = Router();

// GET /api/currency/rates - Get all exchange rates
currencyRouter.get('/rates', async (req: Request, res: Response) => {
  try {
    const rates = await currencyService.getAllRates();
    const lastUpdate = currencyService.getLastUpdateTime();
    
    res.json({
      rates,
      lastUpdated: lastUpdate?.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

// GET /api/currency/convert?amount=100&from=USD&to=EUR
currencyRouter.get('/convert', async (req: Request, res: Response) => {
  try {
    const { amount, from, to } = req.query;
    
    if (!amount || !from || !to) {
      return res.status(400).json({ error: 'Missing required parameters: amount, from, to' });
    }
    
    const numAmount = parseFloat(amount as string);
    if (isNaN(numAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const convertedAmount = await currencyService.convertAmount(
      numAmount,
      from as Currency,
      to as Currency
    );
    
    const rate = await currencyService.getExchangeRate(from as Currency, to as Currency);
    
    res.json({
      originalAmount: numAmount,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      fromCurrency: from,
      toCurrency: to,
      exchangeRate: rate,
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});

// POST /api/currency/refresh - Force refresh exchange rates
currencyRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    await currencyService.fetchExchangeRates();
    res.json({ message: 'Exchange rates refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing exchange rates:', error);
    res.status(500).json({ error: 'Failed to refresh exchange rates' });
  }
});