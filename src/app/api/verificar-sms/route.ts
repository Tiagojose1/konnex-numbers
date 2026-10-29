// src/app/api/verificar-sms/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { pedidoId, userId } = await request.json(); // 🆕 Recebe o userId

    // 1. Buscar as informações do pedido (Blindado contra acesso não autorizado)
    const { data: pedido, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', pedidoId)
      .eq('user_id', userId) // 🆕 Só deixa verificar se o pedido for deste utilizador
      .single();

    if (error || !pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado ou acesso negado.' }, { status: 404 });
    }

    if (pedido.status !== 'Aguardando') {
      return NextResponse.json({ codigo: pedido.codigo_recebido || null });
    }

    let codigoRecebido = null;

    // 2. Perguntar ao fornecedor correto
    if (pedido.provider_name === '5sim') {
      const res = await fetch(`https://5sim.net/v1/user/check/${pedido.provider_order_id}`, {
        headers: { 'Authorization': `Bearer ${process.env.FIVESIM_API_KEY}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (data.sms && data.sms.length > 0) {
        codigoRecebido = data.sms[0].code;
      }

    } else if (pedido.provider_name === 'smspool') {
      const res = await fetch('https://api.smspool.net/sms/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ key: process.env.SMSPOOL_API_KEY!, orderid: pedido.provider_order_id })
      });
      const data = await res.json();
      if (data.status === 3) { // 3 = SMS Recebido
        codigoRecebido = data.sms;
      }
    }

    // 3. Se o código chegou, atualiza a base de dados
    if (codigoRecebido) {
      await supabaseAdmin.from('orders').update({
        status: 'Concluído', 
        sms_otp: 'Sucesso', 
        codigo_recebido: codigoRecebido
      }).eq('id', pedidoId);
    }

    return NextResponse.json({ codigo: codigoRecebido });

  } catch (error) {
    console.error('Erro ao verificar SMS:', error);
    return NextResponse.json({ error: 'Erro ao verificar SMS.' }, { status: 500 });
  }
}