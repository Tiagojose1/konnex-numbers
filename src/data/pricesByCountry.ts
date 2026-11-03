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

// 🆕 Taxa de conversão atual (1 USD = 63.88 MZN)
const RATE = 63.88;

// 🆕 Função auxiliar para converter os teus preços de MZN para USD automaticamente
const usd = (mzn: number) => Number((mzn / RATE).toFixed(2));

export const pricesByCountry: Record<string, Record<string, PriceEntry>> = {
  // 🇲🇿 MOÇAMBIQUE (Preços base em MZN, convertidos para USD)
  mz: {
    whatsapp: { available: 838547, variants: { random: { price: usd(200) }, chooseDdi: { price: usd(300) }, custom: { price: usd(350) } } },
    telegram: { available: 1482653, price: usd(150) },
    facebook: { available: 102448, price: usd(150) },
    instagram: { available: 1324981, price: usd(150) },
    
    bci: { available: 1000, price: usd(150) },
    bim: { available: 1000, price: usd(150) },
    millenniumbim: { available: 1000, price: usd(150) },
    standardbank_mz: { available: 1000, price: usd(150) },
    absa_mz: { available: 1000, price: usd(150) },
    bancounico: { available: 1000, price: usd(150) },
    moza: { available: 1000, price: usd(150) },
    
    netflix: { available: 5000, variants: { random: { price: usd(250) }, chooseDdi: { price: usd(300) }, custom: { price: usd(350) } } },
    spotify: { available: 3000, variants: { random: { price: usd(200) }, chooseDdi: { price: usd(250) }, custom: { price: usd(300) } } },
    uber: { available: 10000, variants: { random: { price: usd(150) }, chooseDdi: { price: usd(200) }, custom: { price: usd(300) } } },
    epicgames: { available: 2000, variants: { random: { price: usd(180) }, chooseDdi: { price: usd(230) }, custom: { price: usd(300) } } },
    disney: { available: 1500, variants: { random: { price: usd(220) }, chooseDdi: { price: usd(270) }, custom: { price: usd(320) } } },
    
    anyother: { available: 73936, variants: { random: { price: usd(65) }, chooseDdi: { price: usd(265) }, custom: { price: usd(300) } } },
  },

  // 🇧🇷 BRASIL (Preços base em BRL, convertidos para USD)
  br: {
    whatsapp: { available: 500000, variants: { random: { price: usd(15) }, chooseDdi: { price: usd(20) }, custom: { price: usd(25) } } },
    telegram: { available: 620000, price: usd(10) },
    facebook: { available: 850000, price: usd(10) },
    instagram: { available: 940000, price: usd(10) },
    nubank: { available: 5000, price: usd(10) }, itau: { available: 5000, price: usd(10) }, bradesco: { available: 5000, price: usd(10) },
    bancodobrasil: { available: 5000, price: usd(10) }, caixa: { available: 5000, price: usd(10) }, santander_br: { available: 5000, price: usd(10) },
    inter: { available: 5000, price: usd(10) }, c6bank: { available: 5000, price: usd(10) }, picpay: { available: 5000, price: usd(10) },
    pagbank: { available: 5000, price: usd(10) }, mercadopago: { available: 5000, price: usd(10) },
    netflix: { available: 8000, variants: { random: { price: usd(20) }, chooseDdi: { price: usd(25) }, custom: { price: usd(30) } } },
    spotify: { available: 6000, variants: { random: { price: usd(15) }, chooseDdi: { price: usd(20) }, custom: { price: usd(25) } } },
    uber: { available: 15000, variants: { random: { price: usd(12) }, chooseDdi: { price: usd(18) }, custom: { price: usd(25) } } },
    ifood: { available: 10000, variants: { random: { price: usd(10) }, chooseDdi: { price: usd(15) }, custom: { price: usd(20) } } },
    anyother: { available: 500000, variants: { random: { price: usd(8) }, chooseDdi: { price: usd(15) }, custom: { price: usd(20) } } },
  },

  // 🇵🇹 PORTUGAL (Preços base em EUR, convertidos para USD)
  pt: {
    whatsapp: { available: 300000, variants: { random: { price: usd(3) }, chooseDdi: { price: usd(4) }, custom: { price: usd(5) } } },
    telegram: { available: 180000, price: usd(2) }, facebook: { available: 420000, price: usd(2) },
    millenniumbcp: { available: 2000, price: usd(2) }, novobanco: { available: 2000, price: usd(2) }, cgd: { available: 2000, price: usd(2) }, revolut: { available: 2000, price: usd(2) },
    netflix: { available: 3000, variants: { random: { price: usd(4) }, chooseDdi: { price: usd(5) }, custom: { price: usd(6) } } },
    spotify: { available: 2500, variants: { random: { price: usd(3) }, chooseDdi: { price: usd(4) }, custom: { price: usd(5) } } },
    uber: { available: 5000, variants: { random: { price: usd(3.5) }, chooseDdi: { price: usd(4.5) }, custom: { price: usd(5.5) } } },
    anyother: { available: 300000, variants: { random: { price: usd(2) }, chooseDdi: { price: usd(4) }, custom: { price: usd(5) } } },
  },

  // 🇿🇦 ÁFRICA DO SUL (Preços base em ZAR, convertidos para USD)
  za: {
    whatsapp: { available: 400000, variants: { random: { price: usd(25) }, chooseDdi: { price: usd(45) }, custom: { price: usd(50) } } },
    telegram: { available: 150000, price: usd(20) }, capitec: { available: 3000, price: usd(20) }, fnb: { available: 3000, price: usd(20) }, nedbank: { available: 3000, price: usd(20) },
    anyother: { available: 200000, variants: { random: { price: usd(15) }, chooseDdi: { price: usd(45) }, custom: { price: usd(50) } } },
  },

  // 🇺🇸 ESTADOS UNIDOS (Já estão em USD, não precisa de converter)
  us: {
    whatsapp: { available: 400000, variants: { random: { price: 3 }, chooseDdi: { price: 5 }, custom: { price: 6 } } },
    telegram: { available: 250000, price: 2.5 }, chase: { available: 5000, price: 2.5 }, bankofamerica: { available: 5000, price: 2.5 }, wellsfargo: { available: 5000, price: 2.5 }, citi: { available: 5000, price: 2.5 },
    anyother: { available: 400000, variants: { random: { price: 2.5 }, chooseDdi: { price: 5 }, custom: { price: 6 } } },
  },

  // 🇮🇳 ÍNDIA (Preços base em INR, convertidos para USD)
  in: {
    whatsapp: { available: 900000, variants: { random: { price: usd(12) }, chooseDdi: { price: usd(30) }, custom: { price: usd(35) } } },
    telegram: { available: 500000, price: usd(10) }, hdfc: { available: 5000, price: usd(10) }, icici: { available: 5000, price: usd(10) }, sbi: { available: 5000, price: usd(10) },
    anyother: { available: 500000, variants: { random: { price: usd(10) }, chooseDdi: { price: usd(30) }, custom: { price: usd(35) } } },
  },
};

const DEFAULT_PRICE_MZN: Record<string, number> = {
  social: 150, bank: 180, finance: 160, shopping: 70, games: 80,
  transport: 65, delivery: 70, travel: 120, technology: 100, entertainment: 100, dating: 100, other: 100,
};

export function getPrice(serviceId: string, countryId: string, variant: 'random' | 'chooseDdi' | 'custom' = 'random') {
  const entry = pricesByCountry[countryId]?.[serviceId];
  
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

  const service = services.find((s) => s.id === serviceId);
  const country = countries.find((c) => c.id === countryId);
  if (!service || !country) return null;
  if (service.category === 'bank') return null; 

  const rates: Record<string, number> = { MZN: 1, BRL: 0.086, EUR: 0.014, USD: 0.015, ZAR: 0.28, INR: 1.3 };
  const taxa = rates[country.currency] || 1; 
  const stockAleatorio = Math.floor(Math.random() * (900000 - 50000 + 1)) + 50000;

  if (variant === 'custom') {
    const baseCustomMZN = serviceId === 'whatsapp' ? 350 : 300;
    return { available: stockAleatorio, price: usd(baseCustomMZN * taxa), isDefault: true };
  }

  const baseMZN = DEFAULT_PRICE_MZN[service.category] || 100;
  return { available: stockAleatorio, price: usd(baseMZN * taxa), isDefault: true };
}