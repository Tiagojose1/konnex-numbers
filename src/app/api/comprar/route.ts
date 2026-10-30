// src/app/api/comprar/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const fivesimKey = process.env.FIVESIM_API_KEY?.trim();
const smspoolKey = process.env.SMSPOOL_API_KEY?.trim();

export async function POST(request: Request) {
  try {
    const { userId, servico, pais, preco, isCustom } = await request.json();

    // 1. Rate Limiting
    const trintaSegundosAtras = new Date(Date.now() - 30000).toISOString();
    const { data: ultimoPedido } = await supabaseAdmin
      .from('orders').select('id').eq('user_id', userId).gte('data_criacao', trintaSegundosAtras).limit(1);

    if (ultimoPedido && ultimoPedido.length > 0) {
      return NextResponse.json({ error: 'Aguarde 30 segundos antes de fazer uma nova compra.' }, { status: 429 });
    }

    // 2. Verificar Saldo
    const { data: profile } = await supabaseAdmin.from('profiles').select('saldo').eq('id', userId).single();
    if (!profile) return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });

    const saldoAtual = parseFloat(profile.saldo) || 0;
    const valorCompra = parseFloat(preco) || 0;

    if (saldoAtual < valorCompra) {
      return NextResponse.json({ error: 'Saldo insuficiente.' }, { status: 400 });
    }

    // 3. Deduzir Saldo
    const novoSaldo = saldoAtual - valorCompra;
    await supabaseAdmin.from('profiles').update({ saldo: novoSaldo }).eq('id', userId);

    // 4. LÓGICA DE COMPRA REAL
    let numeroVirtual = '';
    let idFornecedor = null;
    let fornecedorUsado = '';

    try {
      const mapaPaises: Record<string, string> = { 
        'Moçambique': 'mozambique', 
        'Brasil': 'brazil', 
        'Portugal': 'portugal',
        'África do Sul': 'southafrica',
        'Estados Unidos': 'usa'
      };
      const paisApi = mapaPaises[pais] || 'mozambique';

      if (servico === 'WhatsApp' && fivesimKey) {
        fornecedorUsado = '5sim';
        
        const res = await fetch(`https://5sim.net/v1/user/buy/activation/${paisApi}/any/whatsapp`, {
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

        if (!res.ok) throw new Error(data.message || 'Erro na 5SIM');
        
        numeroVirtual = data.phone;
        idFornecedor = data.id.toString();

      } else if (smspoolKey) {
        fornecedorUsado = 'smspool';
        const paisCod = pais === 'Moçambique' ? 'MZ' : pais === 'Brasil' ? 'BR' : pais === 'Portugal' ? 'PT' : pais === 'África do Sul' ? 'ZA' : 'US';
        
        const res = await fetch('https://api.smspool.net/purchase/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            key: smspoolKey,
            country: paisCod,
            service: servico.toLowerCase().replace(' ', '')
          })
        });

        const textoResposta = await res.text();
        let data;

        try {
          data = JSON.parse(textoResposta);
        } catch {
          throw new Error(textoResposta);
        }

        if (!res.ok || data.success === 0) throw new Error(data.message || 'Erro na SMSPool');

        numeroVirtual = data.number;
        idFornecedor = data.order_id;

      } else {
        throw new Error('Nenhum fornecedor de SMS configurado.');
      }

    } catch (error: unknown) { // 🆕 Substituído 'any' por 'unknown'
      // Devolve o dinheiro ao utilizador
      await supabaseAdmin.from('profiles').update({ saldo: saldoAtual }).eq('id', userId);
      
      // 🆕 Verificação segura do tipo de erro
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
        is_custom: isCustom,
        provider_order_id: idFornecedor,
        provider_name: fornecedorUsado
      })
      .select().single();

    if (pedidoError) {
      await supabaseAdmin.from('profiles').update({ saldo: saldoAtual }).eq('id', userId);
      return NextResponse.json({ error: 'Erro ao guardar pedido.' }, { status: 500 });
    }

    // 6. Registar Transação
    await supabaseAdmin.from('transactions').insert({
      user_id: userId, tipo: 'Compra', valor: -valorCompra, metodo: servico, status: 'Aprovado'
    });

    return NextResponse.json({ 
      sucesso: true, 
      mensagem: `Número real obtido via ${fornecedorUsado}!`, 
      pedido: pedido,
      novoSaldo: novoSaldo 
    });

  } catch (error: unknown) { // 🆕 Substituído 'any' no catch principal também
    console.error(error);
    const mensagemErro = error instanceof Error ? error.message : 'Erro interno do servidor.';
    return NextResponse.json({ error: mensagemErro }, { status: 500 });
  }
}