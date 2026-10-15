// src/app/api/adicionar-saldo/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, valor, metodo } = await request.json();
    console.log('--- NOVA RECARGA ---');
    console.log('Dados:', { userId, valor, metodo });

    // 1. Buscar o perfil do utilizador
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('saldo')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
    }

    // 2. Converter e somar (IMPORTANTE: sempre parseFloat!)
    const saldoAtual = parseFloat(profile.saldo) || 0;
    const valorRecarga = parseFloat(valor) || 0;
    const novoSaldo = saldoAtual + valorRecarga;

    console.log(`Saldo: ${saldoAtual} + ${valorRecarga} = ${novoSaldo}`);

    // 3. Atualizar o saldo na base de dados
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ saldo: novoSaldo })
      .eq('id', userId);

    if (updateError) {
      console.error('Erro ao atualizar saldo:', updateError);
      return NextResponse.json({ error: 'Erro ao atualizar saldo.' }, { status: 500 });
    }

    // 4. Registar a transação no histórico
    const { error: transacaoError } = await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      tipo: 'Recarga',
      valor: valorRecarga,
      metodo: metodo,
      status: 'Aprovado'
    });

    if (transacaoError) {
      console.error('Erro ao registar transação:', transacaoError);
    }

    console.log('--- RECARGA CONCLUÍDA ---');
    return NextResponse.json({
      sucesso: true,
      mensagem: `Recarga de ${valorRecarga.toFixed(2)} MT aprovada!`,
      novoSaldo: novoSaldo
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}