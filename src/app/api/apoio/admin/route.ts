// src/app/api/apoio/admin/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import translate from 'google-translate-api-x';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { ticketId, mensagem } = await request.json();

    // 1. Descobrir o idioma do cliente
    const { data: lastUserMsg } = await supabaseAdmin
      .from('support_messages')
      .select('language')
      .eq('ticket_id', ticketId)
      .eq('sender_type', 'user')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const userLang = lastUserMsg?.language || 'pt';

    // 2. Traduzir a resposta do Admin para o idioma do cliente
    let traduzidoParaUser = null;
    if (userLang !== 'pt') {
      try {
        const res = await translate(mensagem, { to: userLang });
        // 🆕 Correção do TypeScript: forçamos o tipo
        traduzidoParaUser = (res as { text: string }).text;
      } catch (e) {
        console.error('Erro ao traduzir resposta do Admin:', e);
      }
    }

    // 3. Gravar a mensagem do Admin
    const { data, error } = await supabaseAdmin
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'admin',
        message: mensagem,
        translated_message: traduzidoParaUser,
        language: 'pt'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}