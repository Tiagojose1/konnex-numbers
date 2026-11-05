export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MpesaService } from 'mpesa-mz-sdk'; 
import { RATES } from '@/lib/currencies';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, valor, metodo, telefone, currency } = await request.json();

    if (!telefone && metodo === 'M-Pesa') {
      return NextResponse.json({ error: 'O número de telefone é obrigatório.' }, { status: 400 });
    }

    // Formata o número (para Moçambique: 258 + 9 dígitos)
    const numeroFormatado = telefone.startsWith('258') ? telefone : `258${telefone}`;

    // Gera referência curta
    const referenciaCurta = `KNX${Date.now().toString().slice(-8)}`;

    // 1. Grava a transação como Pendente
    const { data: transacao, error } = await supabaseAdmin
      .from('transactions')
      .insert({ 
        user_id: userId, 
        tipo: 'Recarga', 
        valor: parseFloat(valor), 
        metodo: metodo || 'M-Pesa', 
        status: 'Pendente',
        referencia: referenciaCurta
      })
      .select().single();

    if (error) throw error;

    // 2. Inicializa a M-Pesa (Aqui vão as chaves e a origem)
    const mpesa = new MpesaService({
      apiKey: process.env.MPESA_API_KEY!, 
      publicKey: process.env.MPESA_PUBLIC_KEY!, 
      serviceProviderCode: '171717',
      origin: 'developer.mpesa.vm.co.mz',
      env: 'sandbox',
    });

    try {
      console.log("A enviar pedido para a M-Pesa...");
      
      // Converte USD para Moeda Local e arredonda
      const taxaDoPais = RATES[currency] || 1; 
      const valorNaMoedaLocal = Math.round(parseFloat(valor) * taxaDoPais); 

      console.log(`Valor USD: ${valor} | Moeda: ${currency} | Taxa: ${taxaDoPais} | Valor a cobrar: ${valorNaMoedaLocal}`);

      // 3. Envia o pedido (Apenas os dados da transação)
      const resposta = await mpesa.c2b({
        amount: valorNaMoedaLocal,
        number: numeroFormatado, 
        transactionReference: referenciaCurta,
        thirdPartyReference: referenciaCurta,
      });

      console.log("Resposta da M-Pesa:", resposta);

      return NextResponse.json({ 
        sucesso: true, 
        mensagem: 'Pedido enviado! Verifique o seu telemóvel e insira o PIN.',
        transacao_id: transacao.id 
      });

    } catch (mpesaError: any) {
      console.error('--- ERRO DA M-PESA ---');
      console.error(mpesaError); 
      await supabaseAdmin.from('transactions').update({ status: 'Falhado' }).eq('id', transacao.id);
      return NextResponse.json({ error: 'Erro M-Pesa: ' + (mpesaError.message || 'Erro') }, { status: 400 });
    }

  } catch (error) {
    console.error('--- ERRO GERAL ---', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}