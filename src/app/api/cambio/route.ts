// src/app/api/cambio/route.ts
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Atualiza o câmbio a cada 1 hora

export async function GET() {
  try {
    // Vai buscar as taxas atualizadas com base no USD
    // (Removida a aspa extra no final da URL)
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } });
    const data = await res.json();

    if (data.result !== 'success') {
      throw new Error('Falha ao obter câmbio da API externa');
    }

    const rates = data.rates;

    // Retorna apenas as moedas que usamos no Konnex
    return NextResponse.json({
      USD: 1,
      MZN: rates.MZN || 63.88,
      EUR: rates.EUR || 0.89,
      BRL: rates.BRL || 5.43,
      ZAR: rates.ZAR || 18.50,
      AOA: rates.AOA || 830.00,
      INR: rates.INR || 83.00,
      NGN: rates.NGN || 1500.00,
      GBP: rates.GBP || 0.79,
      CAD: rates.CAD || 1.36,
      AUD: rates.AUD || 1.52,
      XOF: rates.XOF || 605.00,
    });
  } catch (error) {
    console.error('Erro na API de câmbio, a usar valores de segurança:', error);
    
    // Se a API falhar (ou estiver offline), usa os valores de segurança 
    // para o site continuar a funcionar sem erros para o utilizador.
    return NextResponse.json({
      USD: 1, 
      MZN: 63.88, 
      EUR: 0.89, 
      BRL: 5.43, 
      ZAR: 18.50, 
      AOA: 830.00,
      INR: 83.00,
      NGN: 1500.00,
      GBP: 0.79,
      CAD: 1.36,
      AUD: 1.52,
      XOF: 605.00
    });
  }
}