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

    // Se o pagamento falhou ou não foi bem-sucedido na M-Pesa
    if (output_ResponseCode !== 'INS-0') {
      console.log(`Pagamento falhou com o código: ${output_ResponseCode}`);
      return NextResponse.json({ received: true, status: 'Falhou' });
    }

    // 1. Procurar a transação na base de dados
    const { data: transacao, error: erroTransacao } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', output_TransactionID)
      .eq('status', 'Pendente')
      .single();

    // Se a transação não for encontrada ou já estiver paga, ignoramos (evita pagamentos duplos)
    if (erroTransacao || !transacao) {
      console.warn(`Transação ${output_TransactionID} não encontrada ou já processada.`);
      return NextResponse.json({ received: true, status: 'Ignorado' });
    }

    // 2. Procurar o perfil do utilizador
    const { data: profile, error: erroProfile } = await supabaseAdmin
      .from('profiles')
      .select('saldo')
      .eq('id', transacao.user_id)
      .single();

    if (erroProfile || !profile) {
      console.error(`Utilizador ${transacao.user_id} não encontrado.`);
      return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
    }

    // 3. ⚠️ GARANTIR QUE O VALOR ESTÁ EM USD
    // Se a tua tabela 'transactions' guarda o valor em MZN (Meticais), 
    // tens de converter para USD antes de somar ao saldo.
    // Exemplo assumindo que a taxa é 63.88
    // const valorEmUSD = parseFloat(transacao.valor) / 63.88; 
    
    // Se a tua tabela 'transactions' já guarda o valor em USD (porque o frontend já converteu), 
    // então usa diretamente:
    const valorEmUSD = parseFloat(transacao.valor);

    // 4. Soma o saldo e atualiza o utilizador
    const novoSaldo = (parseFloat(profile.saldo) || 0) + valorEmUSD;

    const { error: erroUpdateSaldo } = await supabaseAdmin
      .from('profiles')
      .update({ saldo: novoSaldo })
      .eq('id', transacao.user_id);

    if (erroUpdateSaldo) throw erroUpdateSaldo;

    // 5. Marca a transação como Aprovada
    await supabaseAdmin
      .from('transactions')
      .update({ status: 'Aprovado' })
      .eq('id', transacao.id);

    // 6. (Opcional) Criar notificação para o utilizador
    await supabaseAdmin.from('notifications').insert({
      user_id: transacao.user_id,
      title: 'Depósito Confirmado',
      message: `O seu depósito de ${valorEmUSD.toFixed(2)} USD foi adicionado à sua conta.`,
      is_read: false
    });

    return NextResponse.json({ received: true, status: 'Aprovado' });

  } catch (error: any) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 });
  }
}