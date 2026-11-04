// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Total de Utilizadores
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Dinheiro Total na Carteira de todos os utilizadores (em USD)
    const { data: profiles } = await supabaseAdmin.from('profiles').select('saldo');
    const saldoTotalUSD = profiles?.reduce((acc, curr) => acc + (parseFloat(curr.saldo) || 0), 0) || 0;

    // 3. Total de Compras (Pedidos)
    const { count: totalPedidos } = await supabaseAdmin
      .from('orders') // ⚠️ Garante que a tua tabela de pedidos se chama 'orders'. Se for outra, muda aqui.
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      totalUsers,
      saldoTotalUSD,
      totalPedidos
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}