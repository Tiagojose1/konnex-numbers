// src/app/api/apoio/bot/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import translate from 'google-translate-api-x';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, mensagemUser, imageUrl, userLang = 'pt' } = body;

    if (!ticketId) return NextResponse.json({ error: 'ticketId em falta' }, { status: 400 });

    let textoParaOBot = mensagemUser;
    let traduzidoParaAdmin = null;

    // 1. Traduzir mensagem do Utilizador para PT (se não for PT)
    if (mensagemUser && userLang !== 'pt') {
      try {
        const res = await translate(mensagemUser, { to: 'pt' });
        textoParaOBot = res.text;
        traduzidoParaAdmin = res.text;
      } catch (e) {
        console.error('Erro traduzir msg user:', e);
      }
    }

    // 2. Gravar a mensagem do Utilizador
    const { data: msgUser, error: erroUser } = await supabaseAdmin
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'user',
        message: mensagemUser || null,
        translated_message: traduzidoParaAdmin, // Guarda a tradução PT para o Admin
        language: userLang, // Guarda o idioma original (ex: 'zh')
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (erroUser) throw erroUser;

    // 3. Lógica da Bete (usando o texto já traduzido para PT)
    const texto = (textoParaOBot || '').toLowerCase();
    let respostaBete = '';
    let chamarAdmin = false;

    if (texto.includes('olá') || texto.includes('ola') || texto.includes('bom dia')) {
      respostaBete = 'Olá! Sou a Bete. Como posso ajudar?';
    } else if (texto.includes('saldo') || texto.includes('depositar') || texto.includes('mpesa')) {
      respostaBete = "Para adicionar saldo, vá ao menu 'Saldo'.";
    } else if (texto.includes('reembolso') || texto.includes('devolver')) {
      respostaBete = 'O reembolso é automático se o SMS não chegar em 10 minutos.';
    } else if (texto.includes('número') || texto.includes('comprar')) {
      respostaBete = "Para comprar, vá ao menu 'Serviços'.";
    } else {
      respostaBete = 'Compreendo. Já avisei a equipa de suporte e um humano irá responder em breve.';
      chamarAdmin = true;
    }

    if (chamarAdmin) {
      await supabaseAdmin.from('support_tickets').update({ status: 'Aguardando Admin' }).eq('id', ticketId);
    }

    // 4. Traduzir a resposta da Bete para o idioma do Utilizador
    let respostaTraduzida = null;
    if (userLang !== 'pt') {
      try {
        const resBot = await translate(respostaBete, { to: userLang });
        respostaTraduzida = resBot.text;
      } catch (e) {
        console.error('Erro traduzir resposta Bete:', e);
      }
    }

    // 5. Gravar a resposta da Bete
    const { data: msgBot, error: erroBot } = await supabaseAdmin
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'bot',
        message: respostaBete,
        translated_message: respostaTraduzida,
        language: 'pt'
      })
      .select()
      .single();

    if (erroBot) throw erroBot;

    return NextResponse.json({ success: true, msgUser, msgBot });
  } catch (error: any) {
    console.error('Erro no bot:', error);
    return NextResponse.json({ error: 'Erro no bot', details: error?.message }, { status: 500 });
  }
}