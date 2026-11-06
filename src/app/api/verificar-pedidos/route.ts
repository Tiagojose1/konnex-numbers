// src/app/api/cron/verificar-pedidos/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const fivesimKey = process.env.FIVESIM_API_KEY?.trim();

export async function GET(request: Request) {
  // 🆕 Segurança: Apenas a Vercel pode chamar esta rota
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Procurar pedidos "Aguardando" há mais de 15 minutos
    const quinzeMinutosAtras = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: pedidosExpirados } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('status', 'Aguardando')
      .lt('data_criacao', quinzeMinutosAtras);

    if (!pedidosExpirados || pedidosExpirados.length === 0) {
      return NextResponse.json({ mensagem: 'Nenhum pedido expirado.', reembolsados: 0 });
    }

    let reembolsados = 0;

    for (const pedido of pedidosExpirados) {
      try {
        // 2. Cancelar na 5SIM (se foi de lá) para receber o dinheiro de volta
        if (pedido.provider_name === '5sim' && pedido.provider_order_id && fivesimKey) {
          await fetch(`https://5sim.net/v1/user/cancel/${pedido.provider_order_id}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${fivesimKey}`, 'Accept': 'application/json' }
          });
        }

        // 3. Devolver o saldo ao utilizador
        const { data: profile } = await supabaseAdmin.from('profiles').select('saldo').eq('id', pedido.user_id).single();
        if (profile) {
          const novoSaldo = (parseFloat(profile.saldo) || 0) + parseFloat(pedido.valor);
          await supabaseAdmin.from('profiles').update({ saldo: novoSaldo }).eq('id', pedido.user_id);
        }

        // 4. Marcar pedido como Cancelado e devolver o dinheiro
        await supabaseAdmin.from('orders').update({ status: 'Cancelado' }).eq('id', pedido.id);
        
        // 5. Registar transação de reembolso
        await supabaseAdmin.from('transactions').insert({
          user_id: pedido.user_id,
          tipo: 'Reembolso',
          valor: parseFloat(pedido.valor),
          metodo: pedido.servico,
          status: 'Aprovado'
        });

        reembolsados++;
      } catch (err) {
        console.error(`Erro ao reembolsar pedido ${pedido.id}:`, err);
      }
    }

    return NextResponse.json({ mensagem: 'Verificação concluída.', reembolsados });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}