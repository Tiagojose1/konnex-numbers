// src/app/api/simular-sms/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { pedidoId } = await request.json();
    
    // Gerar um código de 6 dígitos (ex: 512-067)
    const codigoGerado = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'Concluído', 
        sms_otp: 'Sucesso', 
        codigo_recebido: codigoGerado 
      })
      .eq('id', pedidoId);

    if (error) {
      return NextResponse.json({ error: 'Erro ao simular SMS.' }, { status: 500 });
    }

    return NextResponse.json({ sucesso: true, codigo: codigoGerado });

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}