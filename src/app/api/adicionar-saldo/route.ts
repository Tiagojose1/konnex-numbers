export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MpesaService } from 'mpesa-mz-sdk'; 
import { RATES } from '@/lib/currencies'; // 🆕 Importa as taxas de câmbio

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 🆕 Recebemos a moeda do utilizador (ex: 'MZN', 'BRL', 'EUR')
    const { userId, valor, metodo, telefone, currency } = await request.json();

    if (!telefone && metodo === 'M-Pesa') {
      return NextResponse.json({ error: 'O número de telefone é obrigatório.' }, { status: 400 });
    }

    // Formata o número (para Moçambique: 258 + 9 dígitos)
    const numeroFormatado = telefone.startsWith('258') ? telefone : `258${telefone}`;

    // Gera referência curta
    const referenciaCurta = `KNX${Date.now().toString().slice(-8)}`;

    const { data: transacao, error } = await supabaseAdmin
      .from('transactions')
      .insert({ 
        user_id: userId, 
        tipo: 'Recarga', 
        valor: parseFloat(valor), // O valor guardado na base de dados é SEMPRE em USD
        metodo: metodo || 'M-Pesa', 
        status: 'Pendente',
        referencia: referenciaCurta
      })
      .select().single();

    if (error) throw error;

    const mpesa = new MpesaService({
      apiKey: process.env.MPESA_API_KEY!, 
      publicKey: process.env.MPESA_PUBLIC_KEY!, 
      serviceProviderCode: '171717',
      origin: 'developer.mpesa.vm.co.mz',
      env: 'sandbox',
    });

    try {
      console.log("A enviar pedido para a M-Pesa...");
      
      // 🆕 CONVERSÃO GLOBAL: Descobre a taxa do país do utilizador
      const taxaDoPais = RATES[currency] || 1; 
      
      // 🆕 Multiplica o valor em USD pela taxa local e arredonda para inteiro
      const valorNaMoedaLocal = Math.round(parseFloat(valor) * taxaDoPais); 

      console.log(`Valor USD: ${valor} | Moeda: ${currency} | Taxa: ${taxaDoPais} | Valor a cobrar: ${valorNaMoedaLocal}`);

      const resposta = await mpesa.c2b({
  amount: valorNaMoedaLocal,
  number: numeroFormatado, 
  transactionReference: referenciaCurta,
  thirdPartyReference: referenciaCurta,
  serviceProviderCode: '171717',
  origin: 'developer.mpesa.vm.co.mz',
  
  // 🆕 ADICIONA ESTA LINHA (O link para onde a M-Pesa vai avisar do sucesso)
  input_CallbackURL: 'https://konnex-numbers.vercel.app/api/webhook/mpesa' 
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