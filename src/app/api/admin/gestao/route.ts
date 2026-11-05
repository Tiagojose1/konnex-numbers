// src/app/api/admin/gestao/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🆕 GET: Vai buscar as estatísticas e a lista de utilizadores
export async function GET() {
  try {
    // 1. Total de Utilizadores
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Dinheiro Total (USD) em todas as carteiras
    const { data: profiles } = await supabaseAdmin.from('profiles').select('saldo');
    const saldoTotalUSD = profiles?.reduce((acc, curr) => acc + (parseFloat(curr.saldo) || 0), 0) || 0;

    // 3. Total de Pedidos (compras)
    const { count: totalPedidos } = await supabaseAdmin
      .from('orders') 
      .select('*', { count: 'exact', head: true });

    // 4. Lista de Utilizadores (últimos 50)
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id, nome_completo, email, saldo, currency, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      stats: { totalUsers, saldoTotalUSD, totalPedidos },
      users: users || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🆕 POST: Adicionar ou remover saldo manualmente a um utilizador
export async function POST(request: Request) {
  try {
    const { userId, action, valorUSD } = await request.json();

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('saldo')
      .eq('id', userId)
      .single();

    if (!profile) return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });

    let novoSaldo = parseFloat(profile.saldo) || 0;
    if (action === 'add') novoSaldo += parseFloat(valorUSD);
    if (action === 'remove') novoSaldo -= parseFloat(valorUSD);

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ saldo: novoSaldo })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, novoSaldo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}