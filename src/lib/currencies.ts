// src/lib/currencies.ts

// Taxas de câmbio em relação ao MZN (1 MZN = X moeda estrangeira)
export const RATES: Record<string, number> = {
  MZN: 1,
  BRL: 0.086,
  EUR: 0.0144,
  USD: 0.0156,
  ZAR: 0.285,
  AOA: 14.20,
  GBP: 0.0123,
  INR: 1.30,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  MZN: 'MT',
  BRL: 'R$',
  EUR: '€',
  USD: '$',
  ZAR: 'R',
  AOA: 'Kz',
  GBP: '£',
  INR: '₹',
};

export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  'Moçambique': 'MZN',
  'Brasil': 'BRL',
  'Portugal': 'EUR',
  'Estados Unidos': 'USD',
  'África do Sul': 'ZAR',
  'Angola': 'AOA',
  'Reino Unido': 'GBP',
  'Índia': 'INR',
};

// Converter de MZN (base) para a moeda do utilizador
export function converterParaLocal(valorMZN: number, moedaDestino: string): number {
  const rate = RATES[moedaDestino] || 1;
  return valorMZN * rate;
}

// Converter da moeda do utilizador PARA MZN (base)
export function converterParaMZN(valorLocal: number, moedaOrigem: string): number {
  const rate = RATES[moedaOrigem] || 1;
  return valorLocal / rate;
}

// Formatar o valor com símbolo da moeda
export function formatarMoeda(valorMZN: number, moeda: string): string {
  const valorConvertido = converterParaLocal(valorMZN, moeda);
  const simbolo = CURRENCY_SYMBOLS[moeda] || moeda;
  const decimais = ['AOA', 'INR'].includes(moeda) ? 0 : 2;
  return `${simbolo} ${valorConvertido.toFixed(decimais)}`;
}