// src/app/api/admin/dados/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usa a chave secreta para ignorar as regras de RLS
);

export async function POST(request: Request) {
  try {
    const { email, userId } = await request.json();

    // 🛡️ VERIFICAÇÃO DE SEGURANÇA: O e-mail tem de ser o do Admin
    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Acesso negado. Não é administrador.' }, { status: 403 });
    }

    // 1. Buscar todos os utilizadores
    const { data: usuarios, error: errUser } = await supabaseAdmin
      .from('profiles')
      .select('id, nome_completo, saldo, currency, created_at')
      .order('created_at', { ascending: false });

    if (errUser) throw errUser;

    // 2. Buscar todos os pedidos de todos os utilizadores
    const { data: pedidos, error: errPedidos } = await supabaseAdmin
      .from('orders')
      .select('*, profiles(nome_completo)')
      .order('data_criacao', { ascending: false })
      .limit(100); // Limita aos últimos 100 pedidos para não sobrecarregar

    if (errPedidos) throw errPedidos;

    // 3. Calcular as métricas do negócio
    let totalSaldo = 0;
    usuarios.forEach(u => totalSaldo += parseFloat(u.saldo) || 0);

    const totalPedidos = pedidos.length;
    const pedidosConcluidos = pedidos.filter(p => p.status === 'Concluído').length;
    const receitaTotal = pedidos.filter(p => p.status === 'Concluído').reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);

    return NextResponse.json({
      sucesso: true,
      usuarios,
      pedidos,
      metricas: {
        totalUtilizadores: usuarios.length,
        totalSaldoEmCustodia: totalSaldo,
        totalPedidos,
        pedidosConcluidos,
        receitaTotal
      }
    });

  } catch (error) {
    console.error('Erro no admin:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados do admin.' }, { status: 500 });
  }
}