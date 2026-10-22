// src/data/paymentMethods.ts

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: string;
  currency: string;
  provider?: string;
  fee: number;
}

export interface MethodCategory {
  id: string;
  name: string;
  description: string;
}

export const paymentMethods: PaymentMethod[] = [
  // ─── Mobile Money (África) ───
  { id: 'mpesa',      name: 'M-Pesa',            icon: '📱', type: 'mobile_money', currency: 'MZN', provider: 'vodacom',   fee: 0.02 },
  { id: 'emola',      name: 'e-Mola',            icon: '📲', type: 'mobile_money', currency: 'MZN', provider: 'movitel',   fee: 0.02 },
  { id: 'mkesh',      name: 'mKesh',             icon: '💠', type: 'mobile_money', currency: 'MZN', provider: 'tmcel',     fee: 0.02 },

  // ─── Cartões bancários ───
  { id: 'visa',       name: 'Visa',              icon: '💳', type: 'card', currency: 'USD', fee: 0.029 },
  { id: 'mastercard', name: 'Mastercard',        icon: '💳', type: 'card', currency: 'USD', fee: 0.029 },
  { id: 'amex',       name: 'American Express',  icon: '💳', type: 'card', currency: 'USD', fee: 0.035 },
  { id: 'virtual',    name: 'Cartão Virtual',    icon: '🪪', type: 'card', currency: 'USD', fee: 0.02 },

  // ─── Carteiras digitais ───
  { id: 'paypal',     name: 'PayPal',            icon: '🅿️', type: 'wallet', currency: 'USD', fee: 0.034 },
  { id: 'applepay',   name: 'Apple Pay',         icon: '🍎', type: 'wallet', currency: 'USD', fee: 0.029 },
  { id: 'googlepay',  name: 'Google Pay',        icon: '🅶', type: 'wallet', currency: 'USD', fee: 0.029 },

  // ─── Transferência bancária ───
  { id: 'bank_transfer', name: 'Transferência Bancária', icon: '🏦', type: 'bank', currency: 'MZN', fee: 0.01 },
  { id: 'sepa',       name: 'SEPA / IBAN',       icon: '🇪🇺', type: 'bank', currency: 'EUR', fee: 0.008 },
  { id: 'pix',        name: 'PIX',               icon: '⚡', type: 'bank', currency: 'BRL', fee: 0.001 },

  // ─── Criptomoedas ───
  { id: 'bitcoin',    name: 'Bitcoin',           icon: '₿',  type: 'crypto', currency: 'BTC', fee: 0.01 },
  { id: 'ethereum',   name: 'Ethereum',          icon: 'Ξ',  type: 'crypto', currency: 'ETH', fee: 0.012 },
  { id: 'usdt',       name: 'USDT (Tether)',     icon: '💵', type: 'crypto', currency: 'USDT', fee: 0.005 },
  { id: 'usdc',       name: 'USDC (Circle)',     icon: '🔵', type: 'crypto', currency: 'USDC', fee: 0.005 },
  { id: 'bnb',        name: 'BNB Chain',         icon: '🟡', type: 'crypto', currency: 'BNB', fee: 0.01 },
  { id: 'solana',     name: 'Solana',            icon: '◎',  type: 'crypto', currency: 'SOL', fee: 0.008 },
];

export const methodCategories: MethodCategory[] = [
  { id: 'mobile_money', name: 'Mobile Money',       description: 'M-Pesa, e-Mola e mais' },
  { id: 'card',         name: 'Cartões',             description: 'Visa, Mastercard, Amex' },
  { id: 'wallet',       name: 'Carteiras digitais',  description: 'PayPal, Apple Pay...' },
  { id: 'bank',         name: 'Transferência',       description: 'IBAN, SEPA, banco local' },
  { id: 'crypto',       name: 'Criptomoedas',        description: 'BTC, ETH, USDT, USDC' },
];