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

// 🆕 REGRA GLOBAL DE PREÇOS (Sempre em USD)
const PRECO_WHATSAPP = 3.20;
const PRECO_RESTANTE = 2.50;
const PRECO_VIP = 5.51;

// Criamos os moldes de preço para reutilizar
const padraoWhatsApp = (disponivel: number) => ({
  available: disponivel,
  variants: { 
    random: { price: PRECO_WHATSAPP }, 
    chooseDdi: { price: PRECO_WHATSAPP }, 
    custom: { price: PRECO_VIP } 
  }
});

const padraoGeral = (disponivel: number) => ({
  available: disponivel,
  variants: { 
    random: { price: PRECO_RESTANTE }, 
    chooseDdi: { price: PRECO_RESTANTE }, 
    custom: { price: PRECO_VIP } 
  }
});

const precoFixoGeral = (disponivel: number) => ({
  available: disponivel,
  price: PRECO_RESTANTE
});

// 1. Criamos o objeto com os países que têm bancos locais manuais
const basePricesByCountry: Record<string, Record<string, PriceEntry>> = {
  // 🇲🇿 MOÇAMBIQUE
  mz: {
    whatsapp: padraoWhatsApp(838547),
    telegram: precoFixoGeral(1482653), facebook: precoFixoGeral(102448), instagram: precoFixoGeral(1324981),
    bci: precoFixoGeral(1000), bim: precoFixoGeral(1000), millenniumbim: precoFixoGeral(1000),
    standardbank_mz: precoFixoGeral(1000), absa_mz: precoFixoGeral(1000), bancounico: precoFixoGeral(1000), moza: precoFixoGeral(1000),
    netflix: padraoGeral(5000), spotify: padraoGeral(3000), uber: padraoGeral(10000), epicgames: padraoGeral(2000), disney: padraoGeral(1500),
    anyother: padraoGeral(73936),
  },

  // 🇧🇷 BRASIL
  br: {
    whatsapp: padraoWhatsApp(500000),
    telegram: precoFixoGeral(620000), facebook: precoFixoGeral(850000), instagram: precoFixoGeral(940000),
    nubank: precoFixoGeral(5000), itau: precoFixoGeral(5000), bradesco: precoFixoGeral(5000), bancodobrasil: precoFixoGeral(5000),
    caixa: precoFixoGeral(5000), santander_br: precoFixoGeral(5000), inter: precoFixoGeral(5000), c6bank: precoFixoGeral(5000),
    picpay: precoFixoGeral(5000), pagbank: precoFixoGeral(5000), mercadopago: precoFixoGeral(5000),
    netflix: padraoGeral(8000), spotify: padraoGeral(6000), uber: padraoGeral(15000), ifood: padraoGeral(10000),
    anyother: padraoGeral(500000),
  },

  // 🇵🇹 PORTUGAL
  pt: {
    whatsapp: padraoWhatsApp(300000),
    telegram: precoFixoGeral(180000), facebook: precoFixoGeral(420000),
    millenniumbcp: precoFixoGeral(2000), novobanco: precoFixoGeral(2000), cgd: precoFixoGeral(2000), revolut: precoFixoGeral(2000),
    netflix: padraoGeral(3000), spotify: padraoGeral(2500), uber: padraoGeral(5000),
    anyother: padraoGeral(300000),
  },

  // 🇿🇦 ÁFRICA DO SUL
  za: {
    whatsapp: padraoWhatsApp(400000), telegram: precoFixoGeral(150000),
    capitec: precoFixoGeral(3000), fnb: precoFixoGeral(3000), nedbank: precoFixoGeral(3000),
    anyother: padraoGeral(200000),
  },

  // 🇺🇸 ESTADOS UNIDOS
  us: {
    whatsapp: padraoWhatsApp(400000), telegram: precoFixoGeral(250000),
    chase: precoFixoGeral(5000), bankofamerica: precoFixoGeral(5000), wellsfargo: precoFixoGeral(5000), citi: precoFixoGeral(5000),
    anyother: padraoGeral(400000),
  },

  // 🇮🇳 ÍNDIA
  in: {
    whatsapp: padraoWhatsApp(900000), telegram: precoFixoGeral(500000),
    hdfc: precoFixoGeral(5000), icici: precoFixoGeral(5000), sbi: precoFixoGeral(5000),
    anyother: padraoGeral(500000),
  },
};

// 2. Preenchemos o resto do mundo automaticamente (Todos os países do countries.ts)
export const pricesByCountry: Record<string, Record<string, PriceEntry>> = { ...basePricesByCountry };

countries.forEach((country) => {
  if (!pricesByCountry[country.id]) {
    const stockAleatorio = Math.floor(Math.random() * (900000 - 50000 + 1)) + 50000;
    
    pricesByCountry[country.id] = {
      whatsapp: padraoWhatsApp(stockAleatorio),
      telegram: precoFixoGeral(stockAleatorio),
      facebook: precoFixoGeral(stockAleatorio),
      instagram: precoFixoGeral(stockAleatorio),
      netflix: padraoGeral(stockAleatorio),
      spotify: padraoGeral(stockAleatorio),
      uber: padraoGeral(stockAleatorio),
      anyother: padraoGeral(stockAleatorio),
    };
  }
});

// 3. A regra automática de cálculo de preço (MANTIDA INTACTA)
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

  // 🆕 Fallback Automático para QUALQUER OUTRO PAÍS/SERVIÇO (A regra global fica aqui garantida!)
  const service = services.find((s) => s.id === serviceId);
  const country = countries.find((c) => c.id === countryId);
  if (!service || !country) return null;

  if (service.category === 'bank') return null; 

  const stockAleatorio = Math.floor(Math.random() * (900000 - 50000 + 1)) + 50000;

  if (variant === 'custom') {
    return { available: stockAleatorio, price: PRECO_VIP, isDefault: true };
  }

  if (serviceId === 'whatsapp') {
    return { available: stockAleatorio, price: PRECO_WHATSAPP, isDefault: true };
  }

  return { available: stockAleatorio, price: PRECO_RESTANTE, isDefault: true };
}