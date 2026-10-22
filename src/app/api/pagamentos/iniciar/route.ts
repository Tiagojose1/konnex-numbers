import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, valor, telefone } = await request.json();

    // 1. Registar transação pendente
    const { data: transacao, error } = await supabaseAdmin
      .from('transactions')
      .insert({ 
        user_id: userId, 
        tipo: 'Recarga', 
        valor: parseFloat(valor), 
        metodo: 'M-Pesa', 
        status: 'Pendente' 
      })
      .select().single();

    if (error) throw error;

    // 2. Preparar a encriptação
    const publicKey = process.env.MPESA_PUBLIC_KEY!.replace(/\\n/g, '\n');
    const apiKey = process.env.MPESA_API_KEY!;
    
    const buffer = Buffer.from(apiKey, 'utf8');
    const encrypted = crypto.publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      buffer
    );
    const bearerToken = encrypted.toString('base64');

    // 3. Chamar a API do M-Pesa (Sandbox)
    const respostaApi = await fetch('https://api.sandbox.vm.co.mz:18352/ipg/v1/c2bPayment/singleStage/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
        'Origin': '*',
      },
      body: JSON.stringify({
        input_TransactionReference: transacao.id,
        input_CustomerMSISDN: telefone, 
        input_Amount: valor.toString(),
        input_ThirdPartyReference: transacao.id,
        input_ServiceProviderCode: '171717', 
      }),
    });

    const dados = await respostaApi.json();

    // 4. Verificar a resposta
    if (dados.output_ResponseCode === 'INS-0') {
      return NextResponse.json({ 
        sucesso: true, 
        mensagem: 'Pedido enviado! Verifique o seu telemóvel e insira o PIN.',
        transacao_id: transacao.id 
      });
    } else {
      await supabaseAdmin.from('transactions').update({ status: 'Falhado' }).eq('id', transacao.id);
      return NextResponse.json({ error: 'M-Pesa recusou o pedido. Verifique o número.' }, { status: 400 });
    }

  } catch (error) {
    console.error("Erro no depósito:", error);
    return NextResponse.json({ error: 'Erro interno ao comunicar com a M-Pesa.' }, { status: 500 });
  }
}