// src/app/api/apoio/bot/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { ticketId, mensagemUser } = await request.json();
    const texto = mensagemUser.toLowerCase();
    
    let respostaBete = "";
    let chamarAdmin = false;

    // 🧠 LÓGICA DE CONHECIMENTO DA BETE
    if (texto.includes('olá') || texto.includes('ola') || texto.includes('bom dia') || texto.includes('boa tarde')) {
      respostaBete = "Olá! Sou a Bete. Como posso ajudar? Pode perguntar sobre saldo, reembolso, números ou envio de fotos.";
    } 
    else if (texto.includes('saldo') || texto.includes('depositar') || texto.includes('recarregar') || texto.includes('mpesa') || texto.includes('m-pesa') || texto.includes('emola') || texto.includes('e-mola')) {
      respostaBete = "Para adicionar saldo, vá ao menu 'Saldo' no fundo do ecrã, escolha o valor e selecione M-Pesa ou e-Mola. O saldo entra na hora.";
    } 
    else if (texto.includes('reembolso') || texto.includes('devolver') || texto.includes('dinheiro') || texto.includes('sms não chegou')) {
      respostaBete = "O reembolso é automático. Se o SMS não chegar em 10 minutos, o valor volta para o seu saldo principal. Se não recebeu, por favor anexe uma foto do erro.";
    } 
    else if (texto.includes('número') || texto.includes('numero') || texto.includes('comprar') || texto.includes('whatsapp') || texto.includes('telegram')) {
      respostaBete = "Para comprar, vá ao menu 'Serviços', escolha o país e o aplicativo, e clique em OBTER. Pode escolher um Número Normal ou VIP.";
    } 
    else if (texto.includes('erro') || texto.includes('falhou') || texto.includes('não funciona') || texto.includes('nao funciona')) {
      respostaBete = "Lamento pelo erro. Por favor, descreva o erro e anexe uma foto do ecrã (botão do clipe). Vou registar para um técnico analisar.";
      chamarAdmin = true;
    } 
    else {
      // Fallback: Se a Bete não souber, chama o humano
      respostaBete = "Compreendo a sua situação, mas não tenho essa informação. Já avisei a equipa de suporte (Admin) e um humano irá responder aqui em breve. Obrigado pela paciência!";
      chamarAdmin = true;
    }

    // Se a Bete não soube responder, muda o estado do ticket para "Aguardando Admin"
    if (chamarAdmin) {
      await supabaseAdmin.from('support_tickets').update({ status: 'Aguardando Admin' }).eq('id', ticketId);
    }

    // Guardar a resposta da Bete na base de dados
    await supabaseAdmin.from('support_messages').insert({
      ticket_id: ticketId,
      sender_type: 'bot',
      message: respostaBete
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Erro no bot' }, { status: 500 });
  }
}