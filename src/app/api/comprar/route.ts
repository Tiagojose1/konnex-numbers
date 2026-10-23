// src/app/api/comprar/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Recebe os dados do frontend, incluindo o isCustom
    const { userId, servico, pais, preco, isCustom } = await request.json();

    // 2. Buscar o perfil do utilizador para verificar o saldo
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('saldo')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
    }

    const saldoAtual = parseFloat(profile.saldo) || 0;
    const valorCompra = parseFloat(preco) || 0;

    // 3. Verificar se tem saldo suficiente
    if (saldoAtual < valorCompra) {
      return NextResponse.json({ error: 'Saldo insuficiente. Adicione saldo à sua conta.' }, { status: 400 });
    }

    // 4. Deduzir o saldo do utilizador
    const novoSaldo = saldoAtual - valorCompra;
    await supabaseAdmin
      .from('profiles')
      .update({ saldo: novoSaldo })
      .eq('id', userId);

    // 5. Gerar o número virtual
    let numeroVirtual = '';
    
    if (isCustom) {
      // Se for personalizado, geramos um número que mostra que é VIP (num sistema real, aqui pediríamos à API da Twilio um número específico)
      numeroVirtual = `+258 84 (VIP) ${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
      // Se for aleatório, usamos a lógica normal (Moçambique, Brasil, etc)
      if (pais === 'Moçambique') {
        const prefixosMZ = ['82', '83', '84', '85', '86', '87'];
        const prefixoAleatorio = prefixosMZ[Math.floor(Math.random() * prefixosMZ.length)];
        numeroVirtual = `258${prefixoAleatorio}${Math.floor(1000000 + Math.random() * 9000000)}`;
      } else if (pais === 'Brasil') {
        numeroVirtual = `55${'11'}9${Math.floor(10000000 + Math.random() * 90000000)}`;
      } else if (pais === 'Portugal') {
        const prefixosPT = ['91', '92', '93', '96'];
        const prefixoAleatorio = prefixosPT[Math.floor(Math.random() * prefixosPT.length)];
        numeroVirtual = `351${prefixoAleatorio}${Math.floor(1000000 + Math.random() * 9000000)}`;
      } else {
        numeroVirtual = `000${Math.floor(100000000 + Math.random() * 900000000)}`;
      }
    }

    // 6. Criar o pedido na base de dados
    const { data: pedido, error: pedidoError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        numero: numeroVirtual,
        status: 'Aguardando',
        sms_otp: 'Pendente',
        pais: pais,
        servico: servico,
        valor: valorCompra,
        is_custom: isCustom, // 🆕 Guardamos que foi personalizado
      })
      .select()
      .single();

    if (pedidoError) {
      // Se falhar, devolvemos o dinheiro (rollback)
      await supabaseAdmin.from('profiles').update({ saldo: saldoAtual }).eq('id', userId);
      return NextResponse.json({ error: 'Erro ao criar pedido.' }, { status: 500 });
    }

    // 7. Registar a transação no histórico
    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      tipo: 'Compra',
      valor: -valorCompra, // Valor negativo porque é uma saída
      metodo: servico,
      status: 'Aprovado'
    });

    // 8. Devolver sucesso para o frontend
    return NextResponse.json({ 
      sucesso: true, 
      mensagem: 'Número obtido com sucesso!', 
      pedido: pedido,
      novoSaldo: novoSaldo 
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}