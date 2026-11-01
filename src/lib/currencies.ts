// src/lib/currencies.ts

// Taxas: 1 USD = X moeda local
export const RATES: Record<string, number> = {
  USD: 1,
  MZN: 63.88,   // 1 USD ≈ 63.88 MZN
  BRL: 5.4379,  // 1 USD ≈ 5.44 BRL
  EUR: 1.1161,  // 1 USD ≈ 1.12 EUR
  ZAR: 18.50,   // 1 USD ≈ 18.50 ZAR (exemplo)
  AOA: 830.00,  // 1 USD ≈ 830 AOA (exemplo)
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  MZN: 'MT',
  BRL: 'R$',
  EUR: '€',
  ZAR: 'R',
  AOA: 'Kz',
};

export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  'Moçambique': 'MZN',
  'Brasil': 'BRL',
  'Portugal': 'EUR',
  'África do Sul': 'ZAR',
  'Angola': 'AOA',
  'Estados Unidos': 'USD',
};

// Converte de USD (base) para a moeda local
export function converterParaLocal(valorUSD: number, moedaDestino: string): number {
  const rate = RATES[moedaDestino] || 1;
  return valorUSD * rate;
}

// Converte da moeda local para USD (base)
export function converterParaUSD(valorLocal: number, moedaOrigem: string): number {
  const rate = RATES[moedaOrigem] || 1;
  return valorLocal / rate;
}

// Formata o valor com o símbolo da moeda local
export function formatarMoeda(valorUSD: number, moeda: string): string {
  const valorConvertido = converterParaLocal(valorUSD, moeda);
  const simbolo = CURRENCY_SYMBOLS[moeda] || moeda;
  return `${simbolo} ${valorConvertido.toFixed(2)}`;
}