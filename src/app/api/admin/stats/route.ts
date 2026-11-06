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
      .from('orders') 
      .select('*', { count: 'exact', head: true });

    // 4. 🆕 Dados para o Gráfico (Vendas dos últimos 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const { data: vendas } = await supabaseAdmin
      .from('orders')
      .select('data_criacao, valor')
      .gte('data_criacao', seteDiasAtras.toISOString())
      .eq('status', 'Concluído'); // Só conta as vendas concluídas

    // Agrupar as vendas por dia
    const vendasPorDia: Record<string, number> = {};
    
    vendas?.forEach(venda => {
      const dia = new Date(venda.data_criacao).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
      vendasPorDia[dia] = (vendasPorDia[dia] || 0) + parseFloat(venda.valor);
    });

    // Formatar os dados para o gráfico (ordenados por data)
    const graficoData = Object.keys(vendasPorDia).map(dia => ({
      dia: dia,
      valor: vendasPorDia[dia]
    })).sort((a, b) => {
      const [diaA, mesA] = a.dia.split('/').map(Number);
      const [diaB, mesB] = b.dia.split('/').map(Number);
      return (mesA * 31 + diaA) - (mesB * 31 + diaB);
    });

    return NextResponse.json({
      totalUsers,
      saldoTotalUSD,
      totalPedidos,
      graficoData // 🆕 Enviar os dados para o gráfico
    });

  } catch (error: any) {
    console.error('Erro na API de stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}