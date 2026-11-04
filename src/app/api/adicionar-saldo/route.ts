export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MpesaService } from 'mpesa-mz-sdk'; 

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, valor, metodo, telefone } = await request.json();

    if (!telefone && metodo === 'M-Pesa') {
      return NextResponse.json({ error: 'O número de telefone é obrigatório.' }, { status: 400 });
    }

    // 🆕 Formata o número corretamente (Moçambique: 258 + 9 dígitos)
    const numeroFormatado = telefone.startsWith('258') ? telefone : `258${telefone}`;

    // 🆕 Gera uma referência curta e única para a M-Pesa (máx. 20 caracteres)
    const referenciaCurta = `KNX-${Date.now().toString().slice(-8)}`;

    const { data: transacao, error } = await supabaseAdmin
      .from('transactions')
      .insert({ 
        user_id: userId, 
        tipo: 'Recarga', 
        valor: parseFloat(valor), 
        metodo: metodo || 'M-Pesa', 
        status: 'Pendente',
        referencia: referenciaCurta // 🆕 Guarda a referência curta
      })
      .select().single();

    if (error) throw error;

    // 🆕 As chaves devem estar nas variáveis de ambiente da Vercel
    const mpesa = new MpesaService({
      apiKey: process.env.MPESA_API_KEY!, 
      publicKey: process.env.MPESA_PUBLIC_KEY!, 
      serviceProviderCode: '171717',
      origin: 'developer.mpesa.vm.co.mz',
      env: 'sandbox', // Muda para 'production' quando fores a sério
    });

    try {
      console.log("A enviar pedido para a M-Pesa...");
      
      const resposta = await mpesa.c2b({
        amount: parseFloat(valor), // 🆕 Envia o valor com decimais (ex: 3.20)
        number: numeroFormatado, 
        transactionReference: referenciaCurta, // 🆕 Usa a referência curta
        thirdPartyReference: referenciaCurta, // 🆕 Usa a referência curta
        serviceProviderCode: '171717',
        origin: 'developer.mpesa.vm.co.mz'
      } as any);

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