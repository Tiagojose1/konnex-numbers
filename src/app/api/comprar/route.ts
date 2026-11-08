// src/app/api/comprar/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const fivesimKey = process.env.FIVESIM_API_KEY?.trim();

const mapaServicos: Record<string, string> = {
  'WhatsApp': 'whatsapp',
  'Telegram': 'telegram',
  'Instagram & Threads': 'instagram',
  'Insta connect': 'instagram',
  'Facebook': 'facebook',
  'Google / Gmail / YouTube': 'google',
  'Google': 'google',
  'YouTube': 'youtube',
  'TikTok / Douyin': 'tiktok',
  'X (Twitter)': 'twitter',
  'Twitter': 'twitter'
};

const mapaPaises: Record<string, string> = { 
  'Moçambique': 'mozambique', 
  'Brasil': 'brazil', 
  'Portugal': 'portugal',
  'África do Sul': 'southafrica',
  'Estados Unidos': 'usa',
  'Holanda': 'netherlands',
  'Reino Unido': 'england',
  'Alemanha': 'germany',
  'França': 'france'
};

export async function POST(request: Request) {
  try {
    const { userId, servico, pais, preco, isCustom } = await request.json();

    // 1. Rate Limiting (1 Minuto)
    const umMinutoAtras = new Date(Date.now() - 60000).toISOString();
    const { data: ultimoPedido } = await supabaseAdmin
      .from('orders').select('id').eq('user_id', userId).gte('data_criacao', umMinutoAtras).limit(1);

    if (ultimoPedido && ultimoPedido.length > 0) {
      return NextResponse.json({ error: 'Aguarde 1 minuto antes de fazer uma nova compra.' }, { status: 429 });
    }

    // 2. Verificar Saldo
    const { data: profile } = await supabaseAdmin.from('profiles').select('saldo').eq('id', userId).single();
    if (!profile) return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });

    const saldoAtual = parseFloat(profile.saldo) || 0;
    const valorCompra = parseFloat(preco) || 0;

    if (saldoAtual < valorCompra) {
      return NextResponse.json({ error: 'Saldo insuficiente.' }, { status: 400 });
    }

    // 3. Deduzir Saldo IMEDIATAMENTE
    const novoSaldo = saldoAtual - valorCompra;
    await supabaseAdmin.from('profiles').update({ saldo: novoSaldo }).eq('id', userId);

    // 4. LÓGICA DE COMPRA (APENAS 5SIM)
    let numeroVirtual = '';
    let idFornecedor = null;

    try {
      const paisApi = mapaPaises[pais] || 'mozambique';
      const servicoApi = mapaServicos[servico] || servico.toLowerCase().replace(/\s+/g, '');

      if (!fivesimKey) throw new Error('Chave da 5SIM não configurada.');

      const res = await fetch(`https://5sim.net/v1/user/buy/activation/${paisApi}/any/${servicoApi}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${fivesimKey}`, 'Accept': 'application/json' }
      });
      
      const textoResposta = await res.text();
      let data;

      try {
        data = JSON.parse(textoResposta);
      } catch {
        throw new Error(textoResposta);
      }

      if (!res.ok) throw new Error(data.message || data.error || 'Erro na 5SIM');
      
      numeroVirtual = data.phone;
      idFornecedor = data.id.toString();

    } catch (error) {
      // 🆕 DEVOLVE O DINHEIRO APENAS SE A 5SIM FALHAR
      await supabaseAdmin.from('profiles').update({ saldo: saldoAtual }).eq('id', userId);
      
      const mensagemErro = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: `Erro no fornecedor: ${mensagemErro}` }, { status: 500 });
    }

    // 5. Criar Pedido na Base de Dados
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
        is_custom: isCustom || false,
        provider_order_id: idFornecedor,
        provider_name: '5sim'
      })
      .select().single();

    // 🆕 SE DER ERRO AO GUARDAR, NÃO DEVOLVE O DINHEIRO (O NÚMERO JÁ FOI COMPRADO)
    if (pedidoError) {
      console.error('🚨 ERRO CRÍTICO AO GUARDAR PEDIDO (Mas número já comprado):', pedidoError);
      return NextResponse.json({ 
        sucesso: true, 
        mensagem: `Número obtido via 5SIM, mas houve um erro interno no registo. O seu número é: ${numeroVirtual}`,
        novoSaldo 
      });
    }

    // 6. Registar Transação (Para o Histórico do Admin)
    await supabaseAdmin.from('transactions').insert({
      user_id: userId, tipo: 'Compra', valor: -valorCompra, metodo: servico, status: 'Aprovado'
    });

    return NextResponse.json({ 
      sucesso: true, 
      mensagem: `Número real obtido via 5SIM!`, 
      pedido: pedido,
      novoSaldo: novoSaldo 
    });

  } catch (error) {
    console.error(error);
    const mensagemErro = error instanceof Error ? error.message : 'Erro interno do servidor.';
    return NextResponse.json({ error: mensagemErro }, { status: 500 });
  }
}