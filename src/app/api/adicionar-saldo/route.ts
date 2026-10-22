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

    const numeroFormatado = telefone.startsWith('258') ? telefone : `258${telefone}`;

    const { data: transacao, error } = await supabaseAdmin
      .from('transactions')
      .insert({ user_id: userId, tipo: 'Recarga', valor: parseFloat(valor), metodo: metodo || 'M-Pesa', status: 'Pendente' })
      .select().single();

    if (error) throw error;

    const mpesa = new MpesaService({
      apiKey: 'gxS17i8BNYIE99jzago7NTG119W4ECD1', 
      publicKey: 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAmptSWqV7cGUUJJhUBxsMLonux24u+FoTlrb+4Kgc6092JIszmI1QUoMohaDDXSVueXx6IXwYGsjjWY32HGXj1iQhkALXfObJ4DqXn5h6E8y5/xQYNAyd5bpN5Z8r892B6toGzZQVB7qtebH4apDjmvTi5FGZVjVYxalyyQkj4uQbbRQjgCkubSi45Xl4CGtLqZztsKssWz3mcKncgTnq3DHGYYEYiKq0xIj100LGbnvNz20Sgqmw/cH+Bua4GJsWYLEqf/h/yiMgiBbxFxsnwZl0im5vXDlwKPw+QnO2fscDhxZFAwV06bgG0oEoWm9FnjMsfvwm0rUNYFlZ+TOtCEhmhtFp+Tsx9jPCuOd5h2emGdSKD8A6jtwhNa7oQ8RtLEEqwAn44orENa1ibOkxMiiiFpmmJkwgZPOG/zMCjXIrrhDWTDUOZaPx/lEQoInJoE2i43VN/HTGCCw8dKQAwg0jsEXau5ixD0GUothqvuX3B9taoeoFAIvUPEq35YulprMM7ThdKodSHvhnwKG82dCsodRwY428kg2xM/UjiTENog4B6zzZfPhMxFlOSFX4MnrqkAS+8Jamhy1GgoHkEMrsT5+/ofjCx0HjKbT5NuA2V/lmzgJLl3jIERadLzuTYnKGWxVJcGLkWXlEPYLbiaKzbJb2sYxt+Kt5OxQqC1MCAwEAAQ==', 
      serviceProviderCode: '171717',
      origin: 'developer.mpesa.vm.co.mz',
      env: 'sandbox',
    });

    try {
      console.log("A enviar pedido para a M-Pesa...");
      
      // AQUI ESTÁ A CORREÇÃO: O 'as any' no final do objeto
      const resposta = await mpesa.c2b({
        amount: Math.round(parseFloat(valor)),
        number: numeroFormatado, 
        transactionReference: transacao.id,
        thirdPartyReference: transacao.id,
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