// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: profiles } = await supabaseAdmin.from('profiles').select('saldo');
    const saldoTotalUsuarios = profiles?.reduce((acc, curr) => acc + (parseFloat(curr.saldo) || 0), 0) || 0;

    const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });

    // 🆕 A tua receita (soma de todas as compras concluídas)
    const { data: pedidosConcluidos } = await supabaseAdmin
      .from('orders')
      .select('valor')
      .eq('status', 'Concluído');
      
    const receitaPlataforma = pedidosConcluidos?.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0) || 0;

    const { count: totalPedidos } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true });

    // Dados do gráfico (últimos 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const { data: vendas } = await supabaseAdmin
      .from('orders')
      .select('data_criacao, valor')
      .gte('data_criacao', seteDiasAtras.toISOString())
      .eq('status', 'Concluído');

    const vendasPorDia: Record<string, number> = {};
    vendas?.forEach(v => {
      const dia = new Date(v.data_criacao).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
      vendasPorDia[dia] = (vendasPorDia[dia] || 0) + parseFloat(v.valor);
    });

    const graficoData = Object.keys(vendasPorDia).map(dia => ({ dia, valor: vendasPorDia[dia] }))
      .sort((a, b) => {
        const [d1, m1] = a.dia.split('/').map(Number);
        const [d2, m2] = b.dia.split('/').map(Number);
        return (m1 * 31 + d1) - (m2 * 31 + d2);
      });

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      saldoTotalUsuarios,
      receitaPlataforma,
      totalPedidos: totalPedidos || 0,
      graficoData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}