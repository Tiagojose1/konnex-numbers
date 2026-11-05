// src/app/api/webhook/emola/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // ⚠️ NOTA: Estes campos mudam conforme a documentação oficial da Movitel (e-Mola).
    // Este é um exemplo genérico que deves adaptar quando tiveres as chaves reais.
    const { transaction_id, status, reference } = body;

    if (status !== 'SUCCESS') {
      return NextResponse.json({ received: true, status: 'Ignorado' });
    }

    // Procurar a transação na base de dados pela referência
    const { data: transacao, error: erroTransacao } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('referencia', reference)
      .eq('status', 'Pendente')
      .single();

    if (erroTransacao || !transacao) {
      return NextResponse.json({ received: true, status: 'Não encontrada' });
    }

    // Buscar o perfil do utilizador
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('saldo')
      .eq('id', transacao.user_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
    }

    // Atualizar o saldo (o valor em USD já está na tabela)
    const valorEmUSD = parseFloat(transacao.valor);
    const novoSaldo = (parseFloat(profile.saldo) || 0) + valorEmUSD;

    await supabaseAdmin
      .from('profiles')
      .update({ saldo: novoSaldo })
      .eq('id', transacao.user_id);

    // Marcar como Aprovado
    await supabaseAdmin
      .from('transactions')
      .update({ status: 'Aprovado' })
      .eq('id', transacao.id);

    return NextResponse.json({ received: true, status: 'Aprovado' });

  } catch (error) {
    console.error('Erro no webhook e-Mola:', error);
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 });
  }
}