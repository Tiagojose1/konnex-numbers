// src/data/pricesByCountry.ts
import { services } from './services';
import { countries } from './countries';

export interface PriceVariant { price: number; }
export interface PriceEntry {
  available: number;
  price?: number;
  variants?: { 
    random: PriceVariant; 
    chooseDdi: PriceVariant; 
    custom?: PriceVariant; 
  };
}

export const pricesByCountry: Record<string, Record<string, PriceEntry>> = {
  // 🇲🇿 MOÇAMBIQUE
  mz: {
    whatsapp: { available: 838547, variants: { random: { price: 200 }, chooseDdi: { price: 300 }, custom: { price: 350 } } },
    telegram: { available: 1482653, price: 150 },
    facebook: { available: 102448, price: 150 },
    bci: { available: 1000, price: 150 },
    bim: { available: 1000, price: 150 },
    millenniumbim: { available: 1000, price: 150 },
    standardbank_mz: { available: 1000, price: 150 },
    absa_mz: { available: 1000, price: 150 },
    bancounico: { available: 1000, price: 150 },
    moza: { available: 1000, price: 150 },
    anyother: { available: 73936, variants: { random: { price: 65 }, chooseDdi: { price: 265 } } },
  },

  // 🇧🇷 BRASIL
  br: {
    whatsapp: { available: 500000, variants: { random: { price: 15 }, chooseDdi: { price: 20 }, custom: { price: 25 } } },
    telegram: { available: 620000, price: 10 },
    facebook: { available: 850000, price: 10 },
    nubank: { available: 5000, price: 10 },
    itau: { available: 5000, price: 10 },
    bradesco: { available: 5000, price: 10 },
    bancodobrasil: { available: 5000, price: 10 },
    caixa: { available: 5000, price: 10 },
    santander_br: { available: 5000, price: 10 },
    inter: { available: 5000, price: 10 },
    c6bank: { available: 5000, price: 10 },
    picpay: { available: 5000, price: 10 },
    pagbank: { available: 5000, price: 10 },
    mercadopago: { available: 5000, price: 10 },
    anyother: { available: 500000, variants: { random: { price: 8 }, chooseDdi: { price: 15 } } },
  },

  // 🇵🇹 PORTUGAL
  pt: {
    whatsapp: { available: 300000, variants: { random: { price: 3 }, chooseDdi: { price: 4 }, custom: { price: 5 } } },
    telegram: { available: 180000, price: 2 },
    millenniumbcp: { available: 2000, price: 2 },
    novobanco: { available: 2000, price: 2 },
    cgd: { available: 2000, price: 2 },
    revolut: { available: 2000, price: 2 },
    anyother: { available: 300000, variants: { random: { price: 2 }, chooseDdi: { price: 4 } } },
  },

  // 🇿🇦 ÁFRICA DO SUL
  za: {
    whatsapp: { available: 400000, variants: { random: { price: 25 }, chooseDdi: { price: 45 } } },
    telegram: { available: 150000, price: 20 },
    capitec: { available: 3000, price: 20 },
    fnb: { available: 3000, price: 20 },
    nedbank: { available: 3000, price: 20 },
    anyother: { available: 200000, variants: { random: { price: 15 }, chooseDdi: { price: 45 } } },
  },

  // 🇺🇸 ESTADOS UNIDOS
  us: {
    whatsapp: { available: 400000, variants: { random: { price: 3 }, chooseDdi: { price: 5 } } },
    telegram: { available: 250000, price: 2.5 },
    chase: { available: 5000, price: 2.5 },
    bankofamerica: { available: 5000, price: 2.5 },
    wellsfargo: { available: 5000, price: 2.5 },
    citi: { available: 5000, price: 2.5 },
    anyother: { available: 400000, variants: { random: { price: 2.5 }, chooseDdi: { price: 5 } } },
  },

  // 🇮🇳 ÍNDIA
  in: {
    whatsapp: { available: 900000, variants: { random: { price: 12 }, chooseDdi: { price: 30 } } },
    telegram: { available: 500000, price: 10 },
    hdfc: { available: 5000, price: 10 },
    icici: { available: 5000, price: 10 },
    sbi: { available: 5000, price: 10 },
    anyother: { available: 500000, variants: { random: { price: 10 }, chooseDdi: { price: 30 } } },
  },
};

// ─── LÓGICA DE PREÇO PADRÃO E STOCK AUTOMÁTICO ───
const DEFAULT_PRICE_MZN: Record<string, number> = {
  social: 150, bank: 180, finance: 160, shopping: 70, games: 80,
  transport: 65, delivery: 70, travel: 120, technology: 100, other: 100,
};

export function getPrice(serviceId: string, countryId: string, variant: 'random' | 'chooseDdi' | 'custom' = 'random') {
  const entry = pricesByCountry[countryId]?.[serviceId];
  
  // 1. Tenta encontrar o preço específico (como Moçambique e Brasil têm)
  if (entry) {
    if (entry.variants) {
      const v = entry.variants[variant];
      if (v) return { available: entry.available, price: v.price, isDefault: false };
      if (variant !== 'custom') return null; 
    }
    if (typeof entry.price === 'number' && variant !== 'custom') {
      return { available: entry.available, price: entry.price, isDefault: false };
    }
  }

  // 2. Se o país não tiver preço específico, aplica o Fallback com STOCK AUTOMÁTICO
  const service = services.find((s) => s.id === serviceId);
  const country = countries.find((c) => c.id === countryId);
  if (!service || !country) return null;

  const rates: Record<string, number> = { MZN: 1, BRL: 0.086, EUR: 0.014, USD: 0.015, ZAR: 0.28, INR: 1.3 };
  const taxa = rates[country.currency] || 1; 

  // Gera um número de stock aleatório entre 50.000 e 900.000 para parecer real
  const stockAleatorio = Math.floor(Math.random() * (900000 - 50000 + 1)) + 50000;

  // 🆕 REGRA DO NÚMERO PERSONALIZADO
  if (variant === 'custom') {
    const baseCustomMZN = serviceId === 'whatsapp' ? 350 : 300;
    const precoCustomLocal = Number((baseCustomMZN * taxa).toFixed(2));
    
    return {
      available: stockAleatorio, // Agora tem stock!
      price: precoCustomLocal,
      isDefault: true
    };
  }

  // Preço Padrão Normal (Aleatório)
  const baseMZN = DEFAULT_PRICE_MZN[service.category] || 100;
  const precoLocal = Number((baseMZN * taxa).toFixed(2));

  return {
    available: stockAleatorio, // Agora tem stock!
    price: precoLocal,
    isDefault: true
  };
}