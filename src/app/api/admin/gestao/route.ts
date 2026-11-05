// src/app/api/admin/gestao/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Estatísticas
    const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
    const { data: profiles } = await supabaseAdmin.from('profiles').select('saldo');
    const saldoTotalUSD = profiles?.reduce((acc, curr) => acc + (parseFloat(curr.saldo) || 0), 0) || 0;
    const { count: totalPedidos } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true });

    // Lista de Utilizadores
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id, nome_completo, email, saldo, currency, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    // 🆕 Transações (Depósitos)
    const { data: transacoes } = await supabaseAdmin
      .from('transactions')
      .select(`
        id, valor, metodo, status, created_at, 
        profiles!user_id (nome_completo, email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    // 🆕 Pedidos (Compras)
    const { data: pedidos } = await supabaseAdmin
      .from('orders')
      .select(`
        id, numero, servico, pais, valor, status, sms_otp, created_at,
        profiles!user_id (nome_completo, email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      stats: { totalUsers, saldoTotalUSD, totalPedidos },
      users: users || [],
      transacoes: transacoes || [],
      pedidos: pedidos || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // ... (código de ajuste de saldo mantém-se igual) ...
}