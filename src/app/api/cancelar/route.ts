// src/app/api/cancelar/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, pedidoId, valor } = await request.json();

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('saldo')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
    }

    const saldoAtual = parseFloat(profile.saldo) || 0;
    const valorReembolso = parseFloat(valor) || 0;
    const novoSaldo = saldoAtual + valorReembolso;

    await supabaseAdmin
      .from('profiles')
      .update({ saldo: novoSaldo })
      .eq('id', userId);

    await supabaseAdmin
      .from('orders')
      .update({ status: 'Cancelado', sms_otp: 'Expirado' })
      .eq('id', pedidoId);

    // Registar o reembolso no histórico (NOVO!)
    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      tipo: 'Reembolso',
      valor: valorReembolso, // Valor positivo porque é uma entrada
      metodo: 'Cancelamento',
      status: 'Aprovado'
    });

    return NextResponse.json({ 
      sucesso: true, 
      mensagem: `Pedido cancelado! ${valorReembolso.toFixed(2)} MT devolvidos.`,
      novoSaldo: novoSaldo 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}