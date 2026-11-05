// src/lib/currencies.ts

export let RATES: Record<string, number> = {
  USD: 1,
  MZN: 63.88,   
  BRL: 5.4379,  
  EUR: 0.89,  // 🆕 Corrigido: 1 USD = 0.89 EUR (ou 1 EUR = 1.12 USD)
  ZAR: 18.50,   
  AOA: 830.00,  
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  MZN: 'MT',
  BRL: 'R$',
  EUR: '€',
  ZAR: 'R',
  AOA: 'Kz',
};

// 🆕 Atualiza as taxas com os valores da internet
export function setRates(newRates: Record<string, number>) {
  RATES = { ...RATES, ...newRates };
}

export function formatarMoeda(valorUSD: number, moeda: string): string {
  const rate = RATES[moeda] || 1;
  const valorConvertido = valorUSD * rate;
  const simbolo = CURRENCY_SYMBOLS[moeda] || moeda;
  return `${simbolo} ${valorConvertido.toFixed(2)}`;
}

export function converterParaUSD(valorLocal: number, moedaOrigem: string): number {
  const rate = RATES[moedaOrigem] || 1;
  return valorLocal / rate;
}