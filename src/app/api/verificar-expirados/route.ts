// src/app/api/verificar-expirados/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEMPO_EXPIRACAO_MINUTOS = 10;

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const { data: pedidos, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'Aguardando');

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar pedidos.' }, { status: 500 });
    }

    if (!pedidos || pedidos.length === 0) {
      return NextResponse.json({ sucesso: true, reembolsados: 0 });
    }

    const agora = new Date().getTime();
    const expirados = pedidos.filter((pedido) => {
      const dataCriacao = new Date(pedido.data_criacao).getTime();
      const diferencaMinutos = (agora - dataCriacao) / 1000 / 60;
      return diferencaMinutos >= TEMPO_EXPIRACAO_MINUTOS;
    });

    if (expirados.length === 0) {
      return NextResponse.json({ sucesso: true, reembolsados: 0 });
    }

    let totalReembolsado = 0;

    for (const pedido of expirados) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('saldo')
        .eq('id', userId)
        .single();

      if (!profile) continue;

      const saldoAtual = parseFloat(profile.saldo) || 0;
      const valorPedido = parseFloat(pedido.valor) || 0;
      const novoSaldo = saldoAtual + valorPedido;

      await supabaseAdmin
        .from('profiles')
        .update({ saldo: novoSaldo })
        .eq('id', userId);

      await supabaseAdmin
        .from('orders')
        .update({ status: 'Reembolsado', sms_otp: 'Expirado' })
        .eq('id', pedido.id);

      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        tipo: 'Reembolso Automático',
        valor: valorPedido,
        metodo: pedido.servico,
        status: 'Aprovado'
      });

      totalReembolsado += valorPedido;
    }

    return NextResponse.json({ 
      sucesso: true, 
      reembolsados: expirados.length,
      totalReembolsado: totalReembolsado
    });

  } catch (error) {
    console.error('Erro ao verificar expirados:', error); // <-- Correção aqui
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}