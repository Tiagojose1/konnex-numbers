// app/api/twilio/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// É uma boa prática inicializar o cliente Supabase fora da função para reaproveitar a conexão
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use a service_role key para ignorar o RLS
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    console.log(`Nova mensagem de ${from}: ${body}`);

    const { error } = await supabase.from('messages').insert({
      twilio_sid: messageSid,
      from_number: from,
      body: body,
      direction: 'inbound',
    });

    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
      return new NextResponse('Erro interno', { status: 500 });
    }

    // Resposta obrigatória para a Twilio
    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return new NextResponse('Erro no processamento', { status: 500 });
  }
}