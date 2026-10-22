import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { output_TransactionID, output_ResponseCode } = body;

    if (output_ResponseCode === 'INS-0') {
      const { data: transacao } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('id', output_TransactionID)
        .eq('status', 'Pendente')
        .single();

      if (transacao) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('saldo')
          .eq('id', transacao.user_id)
          .single();
          if (!profile) {
  return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
}

        const novoSaldo = parseFloat(profile.saldo) + parseFloat(transacao.valor);
        await supabaseAdmin.from('profiles').update({ saldo: novoSaldo }).eq('id', transacao.user_id);
        await supabaseAdmin.from('transactions').update({ status: 'Aprovado' }).eq('id', transacao.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 });
  }
}