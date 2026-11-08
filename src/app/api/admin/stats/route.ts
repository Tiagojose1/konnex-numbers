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

    // 2. Saldo Total (Carteiras)
    const { data: profiles } = await supabaseAdmin.from('profiles').select('saldo');
    const saldoTotalUSD = profiles?.reduce((acc, curr) => acc + (parseFloat(curr.saldo) || 0), 0) || 0;

    // 3. Receita Total (Vendas)
    const { data: pedidosConcluidos } = await supabaseAdmin
      .from('orders')
      .select('valor')
      .eq('status', 'Concluído');
      
    const receitaTotal = pedidosConcluidos?.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0) || 0;
    const totalPedidos = pedidosConcluidos?.length || 0;

    // 4. Dados do Gráfico (Últimos 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const { data: vendas } = await supabaseAdmin
      .from('orders')
      .select('data_criacao, valor')
      .gte('data_criacao', seteDiasAtras.toISOString())
      .eq('status', 'Concluído');

    const vendasPorDia: Record<string, number> = {};
    
    vendas?.forEach(venda => {
      const dia = new Date(venda.data_criacao).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
      vendasPorDia[dia] = (vendasPorDia[dia] || 0) + parseFloat(venda.valor);
    });

    const graficoData = Object.keys(vendasPorDia).map(dia => ({
      dia: dia,
      valor: vendasPorDia[dia]
    }));

    return NextResponse.json({
      totalUsers,
      saldoTotalUSD,
      receitaTotal,
      totalPedidos,
      graficoData
    });

  } catch (error) { // 🆕 Removido o ': any'
    // 🆕 Verificação segura do erro
    const mensagemErro = error instanceof Error ? error.message : 'Erro desconhecido no servidor';
    console.error("Erro na API de stats:", mensagemErro);
    
    return NextResponse.json({ error: mensagemErro }, { status: 500 });
  }
}