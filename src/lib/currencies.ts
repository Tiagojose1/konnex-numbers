// src/lib/currencies.ts

export const RATES: Record<string, number> = {
  USD: 1,
  MZN: 63.88,   
  BRL: 5.4379,  
  EUR: 1.1161,  
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

// Mostra o valor no ecrã convertido para a moeda do utilizador
export function formatarMoeda(valorUSD: number, moeda: string): string {
  const rate = RATES[moeda] || 1;
  const valorConvertido = valorUSD * rate;
  const simbolo = CURRENCY_SYMBOLS[moeda] || moeda;
  return `${simbolo} ${valorConvertido.toFixed(2)}`;
}

// Converte o que o utilizador digita (MT) de volta para USD (para a base de dados)
export function converterParaUSD(valorLocal: number, moedaOrigem: string): number {
  const rate = RATES[moedaOrigem] || 1;
  return valorLocal / rate;
}