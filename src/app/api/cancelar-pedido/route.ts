// src/app/api/cancelar-pedido/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { pedidoId, userId } = await request.json();

    // 1. Verificar se o pedido pertence ao utilizador e está pendente
    const { data: pedido, error: erroPedido } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', pedidoId)
      .eq('user_id', userId)
      .eq('status', 'Aguardando')
      .single();

    if (erroPedido || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado ou já processado.' }, { status: 404 });
    }

    // 2. Devolver o saldo ao utilizador
    const { data: profile } = await supabaseAdmin.from('profiles').select('saldo').eq('id', userId).single();
    const saldoAtual = parseFloat(profile?.saldo) || 0;
    const novoSaldo = saldoAtual + parseFloat(pedido.valor);

    await supabaseAdmin.from('profiles').update({ saldo: novoSaldo }).eq('id', userId);

    // 3. Marcar pedido como Cancelado e atualizar o status do SMS
    await supabaseAdmin.from('orders').update({ 
      status: 'Cancelado',
      sms_otp: 'Cancelado' 
    }).eq('id', pedidoId);

    return NextResponse.json({ success: true, mensagem: 'Pedido cancelado e valor reembolsado!' });
    
  } catch (error: unknown) { // 🆕 Mudança de 'any' para 'unknown'
    console.error('Erro ao cancelar pedido:', error);
    
    // 🆕 Verificação segura para extrair a mensagem do erro
    const mensagemErro = error instanceof Error ? error.message : 'Erro interno no servidor.';
    
    return NextResponse.json({ error: mensagemErro }, { status: 500 });
  }
}