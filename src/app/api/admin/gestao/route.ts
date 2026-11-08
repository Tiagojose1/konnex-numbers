// src/app/api/admin/gestao/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Lista de Utilizadores
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id, nome_completo, email, saldo, currency, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    // 2. Histórico de Depósitos (Transações)
    const { data: transacoes } = await supabaseAdmin
      .from('transactions')
      .select(`
        id, valor, metodo, status, created_at, 
        profiles!user_id (nome_completo)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    // 3. Histórico de Compras (Pedidos)
    const { data: pedidos } = await supabaseAdmin
      .from('orders')
      .select(`
        id, numero, servico, pais, valor, status, sms_otp, created_at,
        profiles!user_id (nome_completo)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      users: users || [],
      transacoes: transacoes || [],
      pedidos: pedidos || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, action, valorUSD } = await request.json();
    const valor = parseFloat(valorUSD);

    if (isNaN(valor) || valor <= 0) {
      return NextResponse.json({ error: 'Valor inválido.' }, { status: 400 });
    }

    // 1. Buscar o perfil atual
    const { data: profile, error: errProfile } = await supabaseAdmin
      .from('profiles')
      .select('saldo')
      .eq('id', userId)
      .single();

    if (errProfile || !profile) throw new Error('Utilizador não encontrado.');

    // 2. Calcular o novo saldo
    let novoSaldo = parseFloat(profile.saldo) || 0;
    if (action === 'add') novoSaldo += valor;
    if (action === 'remove') novoSaldo -= valor;
    if (novoSaldo < 0) novoSaldo = 0;

    // 3. Atualizar na base de dados
    const { error: errUpdate } = await supabaseAdmin
      .from('profiles')
      .update({ saldo: novoSaldo })
      .eq('id', userId);

    if (errUpdate) throw errUpdate;

    return NextResponse.json({ success: true, novoSaldo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}