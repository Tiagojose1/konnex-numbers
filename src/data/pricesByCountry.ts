// src/data/pricesByCountry.ts

export interface PriceVariant { price: number; }
export interface PriceEntry {
  available: number;
  price?: number;
  variants?: { random: PriceVariant; chooseDdi: PriceVariant; };
}

const ddiPrice = (randomPrice: number) => Math.min(300, randomPrice + 200);

export const pricesByCountry: Record<string, Record<string, PriceEntry>> = {
  // 🇲🇿 MOÇAMBIQUE
  mz: {
    whatsapp: { available: 838547, variants: { random: { price: 200 }, chooseDdi: { price: 300 } } },
    telegram: { available: 1482653, price: 150 },
    facebook: { available: 102448, price: 150 },
    bci: { available: 1000, price: 150 },
    bim: { available: 1000, price: 150 },
    millenniumbim: { available: 1000, price: 150 },
    standardbank_mz: { available: 1000, price: 150 },
    absa_mz: { available: 1000, price: 150 },
    bancounico: { available: 1000, price: 150 },
    moza: { available: 1000, price: 150 },
    anyother: { available: 73936, variants: { random: { price: 65 }, chooseDdi: { price: ddiPrice(65) } } },
  },

  // 🇧🇷 BRASIL
  br: {
    whatsapp: { available: 500000, variants: { random: { price: 15 }, chooseDdi: { price: 20 } } },
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
    whatsapp: { available: 300000, variants: { random: { price: 3 }, chooseDdi: { price: 4 } } },
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

  // 🇦🇴 ANGOLA
  ao: {
    whatsapp: { available: 100000, variants: { random: { price: 150 }, chooseDdi: { price: 200 } } },
    telegram: { available: 50000, price: 100 },
    bai: { available: 1000, price: 100 },
    bfa: { available: 1000, price: 100 },
    bic_ao: { available: 1000, price: 100 },
    anyother: { available: 100000, variants: { random: { price: 100 }, chooseDdi: { price: 200 } } },
  },

  // 🇳🇬 NIGÉRIA
  ng: {
    whatsapp: { available: 200000, variants: { random: { price: 50 }, chooseDdi: { price: 80 } } },
    telegram: { available: 100000, price: 30 },
    accessbank: { available: 2000, price: 30 },
    gtbank: { available: 2000, price: 30 },
    zenithbank: { available: 2000, price: 30 },
    anyother: { available: 200000, variants: { random: { price: 30 }, chooseDdi: { price: 80 } } },
  },

  // 🇬🇧 REINO UNIDO
  gb: {
    whatsapp: { available: 300000, variants: { random: { price: 4 }, chooseDdi: { price: 6 } } },
    telegram: { available: 200000, price: 3 },
    barclays: { available: 5000, price: 3 },
    hsbc: { available: 5000, price: 3 },
    lloyds: { available: 5000, price: 3 },
    monzo: { available: 5000, price: 3 },
    anyother: { available: 300000, variants: { random: { price: 3 }, chooseDdi: { price: 6 } } },
  },
};

export function getPrice(serviceId: string, countryId: string, variant: 'random' | 'chooseDdi' = 'random') {
  const entry = pricesByCountry[countryId]?.[serviceId];
  if (!entry) return null;
  if (entry.variants) {
    const v = entry.variants[variant];
    if (!v) return null;
    return { available: entry.available, price: v.price, variant };
  }
  return { available: entry.available, price: entry.price };
}