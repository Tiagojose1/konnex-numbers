/* eslint-disable @next/next/no-img-element */
// src/app/apoio/page.tsx
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Mensagem {
  id: string;
  sender_type: 'user' | 'bot' | 'admin';
  message: string | null;
  translated_message: string | null;
  language: string | null;
  image_url: string | null;
  created_at: string;
}

export default function ApoioPage() {
  const [chatAberto, setChatAberto] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [abrindoChat, setAbrindoChat] = useState(false);
  const [userLang, setUserLang] = useState('pt'); // Armazena o idioma
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historico, chatAberto]);

  const abrirChat = async () => {
    if (chatAberto) return setChatAberto(false);

    setAbrindoChat(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return toast.error('Faça login para abrir o chat.');

      // Tenta adivinhar o idioma pela moeda do perfil (opcional)
      const { data: profile } = await supabase.from('profiles').select('currency').eq('id', session.user.id).single();
      if (profile?.currency === 'CNY') setUserLang('zh');
      else if (profile?.currency === 'INR') setUserLang('hi');
      else if (profile?.currency === 'USD') setUserLang('en');

      let { data: ticket } = await supabase.from('support_tickets').select('*').eq('user_id', session.user.id).in('status', ['Bot', 'Aguardando Admin', 'Em Atendimento']).order('created_at', { ascending: false }).limit(1).maybeSingle();

      if (!ticket) {
        const { data: novoTicket } = await supabase.from('support_tickets').insert({ user_id: session.user.id, status: 'Bot' }).select().single();
        ticket = novoTicket;
        await supabase.from('support_messages').insert({ ticket_id: ticket.id, sender_type: 'bot', message: 'Olá! Sou a Bete. Como posso ajudar?' });
      }

      setTicketId(ticket.id);
      const { data: msgs } = await supabase.from('support_messages').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
      if (msgs) setHistorico(msgs);
      setChatAberto(true);
    } catch (error: any) {
      toast.error('Falha ao abrir o chat');
    } finally {
      setAbrindoChat(false);
    }
  };

  useEffect(() => {
    if (!ticketId) return;
    const canal = supabase.channel(`chat-${ticketId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${ticketId}` }, (payload) => {
      const novaMsg = payload.new as Mensagem;
      setHistorico(prev => prev.find(m => m.id === novaMsg.id) ? prev : [...prev, novaMsg]);
    }).subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [ticketId]);

  const handleEnviarMensagem = async () => {
    if (!mensagem.trim()) return;
    if (!ticketId) return toast.info('Aguarde...');
    setLoading(true);
    const textoEnviado = mensagem;
    setMensagem('');

    try {
      const res = await fetch('/api/apoio/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, mensagemUser: textoEnviado, userLang }) // Envia o idioma do user
      });

      if (!res.ok) throw new Error('Erro no servidor');
      const dados = await res.json();
      
      setHistorico(prev => {
        const novas = [...prev];
        if (dados.msgUser && !novas.find(m => m.id === dados.msgUser.id)) novas.push(dados.msgUser);
        if (dados.msgBot && !novas.find(m => m.id === dados.msgBot.id)) novas.push(dados.msgBot);
        return novas;
      });
    } catch (error: any) {
      toast.error('Erro ao enviar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24 font-sans text-white">
      <header className="bg-[#0f172a] px-6 py-5 border-b border-slate-800 sticky top-0 z-50">
        <h1 className="text-xl font-bold text-white">Apoio ao Cliente</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg mb-6 border border-slate-700">
          <h4 className="text-2xl font-extrabold mb-4 text-cyan-400">Bete</h4>
          <button onClick={abrirChat} className="bg-blue-600 text-white text-sm font-bold py-2 px-6 rounded-lg hover:bg-blue-500 disabled:opacity-70" disabled={abrindoChat}>
            {abrindoChat ? 'A carregar...' : (chatAberto ? 'Fechar Chat' : 'Iniciar Chat')}
          </button>
        </div>

        {chatAberto && (
          <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 mb-8 flex flex-col h-[450px]">
            <div className="bg-[#0f172a] p-4 flex items-center justify-between border-b border-slate-700">
              <h3 className="font-bold text-white text-sm">Bete</h3>
              <button onClick={() => setChatAberto(false)} className="text-slate-400 hover:text-white text-xl">&times;</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-900 space-y-4">
              {historico.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.sender_type === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 
                    msg.sender_type === 'admin' ? 'bg-green-600 text-white rounded-bl-none' : 
                    'bg-slate-700 border border-slate-600 text-slate-100 rounded-bl-none'
                  }`}>
                    {msg.sender_type === 'admin' && <span className="block text-[10px] font-bold text-green-200 mb-1">Admin</span>}
                    
                    {/* Mensagem Original */}
                    {msg.message && <p>{msg.message}</p>}
                    
                    {/* Tradução */}
                    {msg.translated_message && (
                      <p className="mt-2 pt-2 border-t border-white/20 text-xs italic opacity-80">
                        {msg.translated_message}
                      </p>
                    )}
                    
                    {msg.image_url && <img src={msg.image_url} alt="Anexo" className="mt-2 rounded-lg max-h-32 object-cover" />}
                  </div>
                </div>
              ))}
              {loading && <p className="text-xs text-slate-400 text-center animate-pulse">A enviar...</p>}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center gap-2">
              <input 
                type="text" 
                value={mensagem} 
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Escreva aqui..." 
                className="flex-1 bg-slate-900 text-white p-2 rounded-lg text-sm border border-slate-700 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleEnviarMensagem()}
                disabled={loading}
              />
              <button onClick={handleEnviarMensagem} disabled={loading || !mensagem.trim()} className="bg-blue-600 text-white p-2 px-4 rounded-lg font-bold text-sm hover:bg-blue-500 disabled:opacity-50 transition-colors">
                {loading ? '...' : 'Enviar'}
              </button>
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold text-white mb-4 mt-8">Perguntas mais frequentes</h2>
        {/* ... (O resto do teu código do FAQ e da NavBar mantém-se igual) ... */}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 flex justify-around py-2 px-2 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-slate-400 p-2 hover:text-white transition-colors">
          <span className="text-xl">🏠</span><span className="text-[10px] font-medium mt-1">Início</span>
        </Link>
        {/* ... (Restantes ícones da navbar) ... */}
      </div>
    </div>
  );
}