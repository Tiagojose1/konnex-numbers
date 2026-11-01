// src/app/api/apoio/bot/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ✅ GET de diagnóstico — abre no navegador para confirmar que a rota existe
export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const keyIsServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('service_role') ||
    // service_role key tem sempre um payload diferente; validamos pelo prefixo eyJ
    (process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ') ?? false);

  return NextResponse.json({
    status: 'ok',
    route: '/api/apoio/bot',
    env: {
      NEXT_PUBLIC_SUPABASE_URL: hasUrl ? '✅ presente' : '❌ FALTA',
      SUPABASE_SERVICE_ROLE_KEY: hasKey ? '✅ presente' : '❌ FALTA',
      keyLooksValid: keyIsServiceRole ? '✅ começa com eyJ' : '❌ inválida',
    },
    hint: 'Se o POST falhar, verifica estes 3 pontos.',
  });
}

export async function POST(request: Request) {
  try {
    // ✅ Validação defensiva de env vars ANTES de tentar ligar
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SUPABASE_URL não configurada na Vercel' },
        { status: 500 }
      );
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY não configurada na Vercel' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const body = await request.json();
    const { ticketId, mensagemUser, imageUrl } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId em falta no body' }, { status: 400 });
    }

    // 1. Gravar a mensagem do Utilizador
    const { data: msgUser, error: erroUser } = await supabaseAdmin
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'user',
        message: mensagemUser || null,
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (erroUser) {
      console.error('Erro INSERT msg user:', erroUser);
      return NextResponse.json(
        { error: 'Erro ao gravar mensagem do utilizador', details: erroUser.message, code: erroUser.code },
        { status: 500 }
      );
    }

    // 2. Lógica de resposta da Bete
    const texto = (mensagemUser || '').toLowerCase();
    let respostaBete = '';
    let chamarAdmin = false;

    if (texto.includes('olá') || texto.includes('ola') || texto.includes('bom dia') || texto.includes('boa tarde') || texto.includes('boa noite')) {
      respostaBete = 'Olá! Sou a Bete. Como posso ajudar? Pode perguntar sobre saldo, reembolso, números ou envio de fotos.';
    } else if (texto.includes('saldo') || texto.includes('depositar') || texto.includes('mpesa') || texto.includes('m-pesa') || texto.includes('emola') || texto.includes('e-mola')) {
      respostaBete = "Para adicionar saldo, vá ao menu 'Saldo', escolha o valor e selecione M-Pesa ou e-Mola. O saldo entra na hora.";
    } else if (texto.includes('reembolso') || texto.includes('devolver') || texto.includes('dinheiro')) {
      respostaBete = 'O reembolso é automático se o SMS não chegar em 10 minutos. O valor volta para o seu saldo principal.';
    } else if (texto.includes('número') || texto.includes('numero') || texto.includes('comprar') || texto.includes('whatsapp') || texto.includes('telegram')) {
      respostaBete = "Para comprar, vá ao menu 'Serviços', escolha o país e o aplicativo, e clique em OBTER.";
    } else if (imageUrl) {
      respostaBete = 'Recebi a sua imagem! Já registei o comprovativo. Um agente humano vai analisar em breve.';
      chamarAdmin = true;
    } else {
      respostaBete = 'Compreendo. Já avisei a equipa de suporte e um humano irá responder em breve.';
      chamarAdmin = true;
    }

    if (chamarAdmin) {
      await supabaseAdmin
        .from('support_tickets')
        .update({ status: 'Aguardando Admin' })
        .eq('id', ticketId);
    }

    // 3. Gravar a resposta da Bete
    const { data: msgBot, error: erroBot } = await supabaseAdmin
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'bot',
        message: respostaBete,
      })
      .select()
      .single();

    if (erroBot) {
      console.error('Erro INSERT msg bot:', erroBot);
      return NextResponse.json(
        { error: 'Erro ao gravar resposta do bot', details: erroBot.message, code: erroBot.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, msgUser, msgBot });
  } catch (error: any) {
    console.error('Erro no bot:', error);
    return NextResponse.json(
      { error: 'Erro no bot', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}