// src/app/api/admin/gestao/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id, nome_completo, email, saldo, currency, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: transacoes } = await supabaseAdmin
      .from('transactions')
      .select(`*, profiles:user_id (nome_completo, email)`)
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: pedidos } = await supabaseAdmin
      .from('orders')
      .select(`*, profiles:user_id (nome_completo, email)`)
      .order('data_criacao', { ascending: false })
      .limit(50);

    return NextResponse.json({
      users: users || [],
      transacoes: transacoes || [],
      pedidos: pedidos || []
    });
  } catch (error) { // 🆕 Removido o ': any'
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Erro no GET admin:", mensagem);
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, action, valorUSD } = await request.json();

    if (!userId || !action || !valorUSD) {
      return NextResponse.json({ error: 'Dados em falta' }, { status: 400 });
    }

    const { data: profile, error: erroPerfil } = await supabaseAdmin
      .from('profiles')
      .select('saldo')
      .eq('id', userId)
      .single();

    if (erroPerfil) throw new Error('Utilizador não encontrado.');
    if (!profile) return NextResponse.json({ error: 'Perfil não existe' }, { status: 404 });

    let novoSaldo = parseFloat(profile.saldo) || 0;
    const valor = parseFloat(valorUSD);

    if (action === 'add') novoSaldo += valor;
    if (action === 'remove') novoSaldo -= valor;

    const { error: erroUpdate } = await supabaseAdmin
      .from('profiles')
      .update({ saldo: novoSaldo })
      .eq('id', userId);

    if (erroUpdate) throw erroUpdate;

    return NextResponse.json({ success: true, novoSaldo });
  } catch (error) { // 🆕 Removido o ': any'
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Erro no POST admin:", mensagem);
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}