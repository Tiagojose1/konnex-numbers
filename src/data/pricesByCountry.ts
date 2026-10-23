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
    custom?: PriceVariant; // 🆕 Adicionado aqui
  };
}

export const pricesByCountry: Record<string, Record<string, PriceEntry>> = {
  // ... (MANTENHA AQUI OS SEUS DADOS DE mz, br, pt, za, in, us) ...
  // Mas atualize o WhatsApp de Moçambique para incluir o custom:
  mz: {
    whatsapp: { 
      available: 838547, 
      variants: { 
        random: { price: 200 }, 
        chooseDdi: { price: 300 },
        custom: { price: 350 } // 🆕 Regra do WhatsApp: 350
      } 
    },
    telegram: { available: 1482653, price: 150 },
    // ... restantes serviços de Moçambique ...
  },
  // ...
};

// ─── LÓGICA DE PREÇO PADRÃO ───
const DEFAULT_PRICE_MZN: Record<string, number> = {
  social: 150, bank: 180, finance: 160, shopping: 70, games: 80,
  transport: 65, delivery: 70, travel: 120, technology: 100, other: 100,
};

export function getPrice(serviceId: string, countryId: string, variant: 'random' | 'chooseDdi' | 'custom' = 'random') {
  const entry = pricesByCountry[countryId]?.[serviceId];
  
  // 1. Tenta encontrar o preço específico
  if (entry) {
    if (entry.variants) {
      const v = entry.variants[variant];
      if (v) return { available: entry.available, price: v.price, isDefault: false };
      
      // Se pedir 'custom' e não estiver definido no objeto específico, usa o fallback abaixo
      if (variant === 'custom') {
         // Lógica para custom específico
      } else {
         return null; 
      }
    }
    if (typeof entry.price === 'number' && variant !== 'custom') {
      return { available: entry.available, price: entry.price, isDefault: false };
    }
  }

  // 2. Se não encontrar, aplica o Preço Padrão (Fallback)
  const service = services.find((s) => s.id === serviceId);
  const country = countries.find((c) => c.id === countryId);
  if (!service || !country) return null;

  const rates: Record<string, number> = { MZN: 1, BRL: 0.086, EUR: 0.014, USD: 0.015, ZAR: 0.28, INR: 1.3 };
  const taxa = rates[country.currency] || 1; 

  // 🆕 REGRA DO NÚMERO PERSONALIZADO
  if (variant === 'custom') {
    // Se for WhatsApp é 350 MZN, senão é 300 MZN (valores base)
    const baseCustomMZN = serviceId === 'whatsapp' ? 350 : 300;
    const precoCustomLocal = Number((baseCustomMZN * taxa).toFixed(2));
    
    return {
      available: 0, // 0 = Sem stock confirmado
      price: precoCustomLocal,
      isDefault: true
    };
  }

  // Preço Padrão Normal (Aleatório)
  const baseMZN = DEFAULT_PRICE_MZN[service.category] || 100;
  const precoLocal = Number((baseMZN * taxa).toFixed(2));

  return {
    available: 0,
    price: precoLocal,
    isDefault: true
  };
}