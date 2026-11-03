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

// 🆕 Definição Única de Preços em USD (Dólares)
const PRECO_WHATSAPP = 3.20;
const PRECO_RESTANTE = 2.50;
const PRECO_VIP = 5.51;

// Função auxiliar para criar a estrutura de forma mais limpa
const padrao = (disponivel: number) => ({
  available: disponivel,
  variants: { 
    random: { price: PRECO_RESTANTE }, 
    chooseDdi: { price: PRECO_RESTANTE }, 
    custom: { price: PRECO_VIP } 
  }
});

const padraoWhatsApp = (disponivel: number) => ({
  available: disponivel,
  variants: { 
    random: { price: PRECO_WHATSAPP }, 
    chooseDdi: { price: PRECO_WHATSAPP }, 
    custom: { price: PRECO_VIP } 
  }
});

const precoFixo = (disponivel: number) => ({
  available: disponivel,
  price: PRECO_RESTANTE
});

export const pricesByCountry: Record<string, Record<string, PriceEntry>> = {
  // 🇲🇿 MOÇAMBIQUE
  mz: {
    whatsapp: padraoWhatsApp(838547),
    telegram: precoFixo(1482653),
    facebook: precoFixo(102448),
    instagram: precoFixo(1324981),
    
    bci: precoFixo(1000),
    bim: precoFixo(1000),
    millenniumbim: precoFixo(1000),
    standardbank_mz: precoFixo(1000),
    absa_mz: precoFixo(1000),
    bancounico: precoFixo(1000),
    moza: precoFixo(1000),
    
    netflix: padrao(5000),
    spotify: padrao(3000),
    uber: padrao(10000),
    epicgames: padrao(2000),
    disney: padrao(1500),
    
    anyother: padrao(73936),
  },

  // 🇧🇷 BRASIL
  br: {
    whatsapp: padraoWhatsApp(500000),
    telegram: precoFixo(620000),
    facebook: precoFixo(850000),
    instagram: precoFixo(940000),
    
    nubank: precoFixo(5000),
    itau: precoFixo(5000),
    bradesco: precoFixo(5000),
    bancodobrasil: precoFixo(5000),
    caixa: precoFixo(5000),
    santander_br: precoFixo(5000),
    inter: precoFixo(5000),
    c6bank: precoFixo(5000),
    picpay: precoFixo(5000),
    pagbank: precoFixo(5000),
    mercadopago: precoFixo(5000),
    
    netflix: padrao(8000),
    spotify: padrao(6000),
    uber: padrao(15000),
    ifood: padrao(10000),

    anyother: padrao(500000),
  },

  // 🇵🇹 PORTUGAL
  pt: {
    whatsapp: padraoWhatsApp(300000),
    telegram: precoFixo(180000),
    facebook: precoFixo(420000),
    
    millenniumbcp: precoFixo(2000),
    novobanco: precoFixo(2000),
    cgd: precoFixo(2000),
    revolut: precoFixo(2000),
    
    netflix: padrao(3000),
    spotify: padrao(2500),
    uber: padrao(5000),

    anyother: padrao(300000),
  },

  // 🇿🇦 ÁFRICA DO SUL
  za: {
    whatsapp: padraoWhatsApp(400000),
    telegram: precoFixo(150000),
    capitec: precoFixo(3000),
    fnb: precoFixo(3000),
    nedbank: precoFixo(3000),
    anyother: padrao(200000),
  },

  // 🇺🇸 ESTADOS UNIDOS
  us: {
    whatsapp: padraoWhatsApp(400000),
    telegram: precoFixo(250000),
    chase: precoFixo(5000),
    bankofamerica: precoFixo(5000),
    wellsfargo: precoFixo(5000),
    citi: precoFixo(5000),
    anyother: padrao(400000),
  },

  // 🇮🇳 ÍNDIA
  in: {
    whatsapp: padraoWhatsApp(900000),
    telegram: precoFixo(500000),
    hdfc: precoFixo(5000),
    icici: precoFixo(5000),
    sbi: precoFixo(5000),
    anyother: padrao(500000),
  },
};

export function getPrice(serviceId: string, countryId: string, variant: 'random' | 'chooseDdi' | 'custom' = 'random') {
  const entry = pricesByCountry[countryId]?.[serviceId];
  
  // 1. Retorna o preço específico definido acima
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

  // 2. Fallback de segurança caso um serviço não esteja listado no país
  const service = services.find((s) => s.id === serviceId);
  const country = countries.find((c) => c.id === countryId);
  if (!service || !country) return null;

  if (service.category === 'bank') return null; 

  const stockAleatorio = Math.floor(Math.random() * (900000 - 50000 + 1)) + 50000;

  // Se for personalizado (VIP), usa a regra dos 5.51 USD
  if (variant === 'custom') {
    return { available: stockAleatorio, price: PRECO_VIP, isDefault: true };
  }

  // Se for um serviço novo, verifica se é whatsapp, senão usa a regra dos 2.50 USD
  if (serviceId === 'whatsapp') {
    return { available: stockAleatorio, price: PRECO_WHATSAPP, isDefault: true };
  }

  return { available: stockAleatorio, price: PRECO_RESTANTE, isDefault: true };
}