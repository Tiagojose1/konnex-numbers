import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  const body = await request.json();
  const { orderid, sms } = body; // Dados enviados pela SMSPool

  const { data: pedido } = await supabaseAdmin.from('orders').select('*').eq('provider_order_id', orderid).single();

  if (pedido) {
    await supabaseAdmin.from('orders').update({
        status: 'Concluído',
        sms_otp: 'Sucesso',
        codigo_recebido: sms, // O código OTP que o utilizador precisa
      }).eq('id', pedido.id);
  }
  return NextResponse.json({ received: true });
}