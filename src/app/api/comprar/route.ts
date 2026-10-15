// src/app/api/comprar/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Taxas para converter moeda local em MZN (base)
const RATES: Record<string, number> = {
  MZN: 1, BRL: 0.086, EUR: 0.0144, USD: 0.0156, ZAR: 0.285,
  AOA: 14.20, GBP: 0.0123, INR: 1.30,
};

export async function POST(request: Request) {
  try {
    const { userId, servico, pais, preco, currency } = await request.json();

    // Se a currency foi enviada e não é MZN, converte o preço para MZN
    let precoEmMZN = parseFloat(preco) || 0;
    if (currency && currency !== 'MZN' && RATES[currency]) {
      precoEmMZN = precoEmMZN / RATES[currency];
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('saldo')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
    }

    const saldoAtual = parseFloat(profile.saldo) || 0;

    if (saldoAtual < precoEmMZN) {
      return NextResponse.json({ error: 'Saldo insuficiente.' }, { status: 400 });
    }

    const novoSaldo = saldoAtual - precoEmMZN;
    await supabaseAdmin
      .from('profiles')
      .update({ saldo: novoSaldo })
      .eq('id', userId);

    // GERAR O NÚMERO VIRTUAL COMPLETO POR PAÍS
    let numeroVirtual = '';
    if (pais === 'Moçambique') {
      const prefixosMZ = ['82', '83', '84', '85', '86', '87'];
      const prefixoAleatorio = prefixosMZ[Math.floor(Math.random() * prefixosMZ.length)];
      numeroVirtual = `258${prefixoAleatorio}${Math.floor(1000000 + Math.random() * 9000000)}`;
    } else if (pais === 'Brasil') {
      numeroVirtual = `55${'11'}9${Math.floor(10000000 + Math.random() * 90000000)}`;
    } else if (pais === 'Portugal') {
      const prefixosPT = ['91', '92', '93', '96'];
      const prefixoAleatorio = prefixosPT[Math.floor(Math.random() * prefixosPT.length)];
      numeroVirtual = `351${prefixoAleatorio}${Math.floor(1000000 + Math.random() * 9000000)}`;
    } else {
      numeroVirtual = `000${Math.floor(100000000 + Math.random() * 900000000)}`;
    }

    const { data: pedido, error: pedidoError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        numero: numeroVirtual,
        status: 'Aguardando',
        sms_otp: 'Pendente',
        pais: pais,
        servico: servico,
        valor: precoEmMZN, // Guardamos SEMPRE em MZN
      })
      .select()
      .single();

    if (pedidoError) {
      return NextResponse.json({ error: 'Erro ao criar pedido.' }, { status: 500 });
    }

    // Registar a transação
    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      tipo: 'Compra',
      valor: -precoEmMZN,
      metodo: servico,
      status: 'Aprovado'
    });

    return NextResponse.json({ 
      sucesso: true, 
      mensagem: 'Número obtido com sucesso!', 
      pedido: pedido,
      novoSaldo: novoSaldo 
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}