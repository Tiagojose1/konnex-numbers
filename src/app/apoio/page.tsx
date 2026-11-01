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
  // --- ESTADOS DO FAQ ---
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const [pesquisaFaq, setPesquisaFaq] = useState('');

  // --- ESTADOS DO CHAT ---
  const [chatAberto, setChatAberto] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [imagemAnexada, setImagemAnexada] = useState<File | null>(null);
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [abrindoChat, setAbrindoChat] = useState(false);
  const [userLang, setUserLang] = useState('pt'); // Idioma do utilizador
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- DADOS DO FAQ ---
  const faqs = [
    { pergunta: 'Como funciona o reembolso?', resposta: 'Se o SMS não chegar dentro de 10 minutos, o valor é devolvido automaticamente ao seu saldo principal.' },
    { pergunta: 'Quais os métodos de pagamento?', resposta: 'Aceitamos M-Pesa, e-Mola, Cartão de Crédito e Transferência.' },
    { pergunta: 'O que é um número virtual?', resposta: 'É um número temporário que recebe SMS, sem precisar de chip físico.' },
  ];

  const faqsFiltrados = faqs.filter(faq => 
    faq.pergunta.toLowerCase().includes(pesquisaFaq.toLowerCase()) || 
    faq.resposta.toLowerCase().includes(pesquisaFaq.toLowerCase())
  );

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

      let { data: ticket } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', ['Bot', 'Aguardando Admin', 'Em Atendimento'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!ticket) {
        const { data: novoTicket, error: erroTicket } = await supabase
          .from('support_tickets')
          .insert({ user_id: session.user.id, status: 'Bot' })
          .select()
          .single();

        if (erroTicket) throw erroTicket;
        ticket = novoTicket;
        
        await supabase.from('support_messages').insert({
          ticket_id: ticket.id,
          sender_type: 'bot',
          message: 'Olá! Sou a Bete. Como posso ajudar?'
        });
      }

      setTicketId(ticket.id);

      const { data: msgs } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });
        
      if (msgs) setHistorico(msgs);
      setChatAberto(true);

    } catch (error: any) {
      console.error("Erro ao abrir chat:", error);
      toast.error(`Erro: ${error.message || 'Falha ao abrir o chat'}`);
    } finally {
      setAbrindoChat(false);
    }
  };

  useEffect(() => {
    if (!ticketId) return;

    const canal = supabase.channel(`chat-${ticketId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${ticketId}` }, 
      (payload) => {
        const novaMsg = payload.new as Mensagem;
        setHistorico(prev => {
          if (prev.find(m => m.id === novaMsg.id)) return prev;
          return [...prev, novaMsg];
        });
      }).subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [ticketId]);

  const handleEnviarMensagem = async () => {
    if (!mensagem.trim() && !imagemAnexada) return;
    if (!ticketId) return toast.info('A preparar o chat... Aguarde um segundo.');
    
    setLoading(true);
    const textoEnviado = mensagem;
    const imgAtual = imagemAnexada;
    
    setMensagem('');
    setImagemAnexada(null);

    try {
      let urlImagem = null;
      if (imgAtual) {
        const fileExt = imgAtual.name.split('.').pop();
        const fileName = `suporte-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, imgAtual);
        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
          urlImagem = data.publicUrl;
        }
      }

      const res = await fetch('/api/apoio/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, mensagemUser: textoEnviado, imageUrl: urlImagem, userLang })
      });

      if (!res.ok) {
        const erroTexto = await res.text();
        throw new Error(`Falha no servidor: ${erroTexto}`);
      }

      const dados = await res.json();
      if (dados.error) throw new Error(dados.error);

      setHistorico(prev => {
        const novas = [...prev];
        if (dados.msgUser && !novas.find(m => m.id === dados.msgUser.id)) novas.push(dados.msgUser);
        if (dados.msgBot && !novas.find(m => m.id === dados.msgBot.id)) novas.push(dados.msgBot);
        return novas;
      });

    } catch (error: any) {
      console.error("ERRO DETALHADO DO CHAT:", error);
      toast.error(error.message || 'Erro ao enviar a mensagem.');
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
        
        {/* CARD DA BETE */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg mb-6 relative overflow-hidden text-white border border-slate-700">
          <div className="relative z-10">
            <h4 className="text-2xl font-extrabold mb-4 text-cyan-400">Bete</h4>
            <button 
              onClick={abrirChat} 
              disabled={abrindoChat}
              className="bg-blue-600 text-white text-sm font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-500 transition-colors disabled:opacity-70"
            >
              {abrindoChat ? 'A carregar...' : (chatAberto ? 'Fechar Chat' : 'Iniciar Chat')}
            </button>
          </div>
          <div className="absolute right-2 bottom-2 text-7xl opacity-20">🤖</div>
        </div>

        {/* JANELA DO CHAT */}
        {chatAberto && (
          <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 mb-8 overflow-hidden flex flex-col h-[450px]">
            <div className="bg-[#0f172a] p-4 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-xl">🤖</div>
                <div>
                  <h3 className="font-bold text-white text-sm">Bete</h3>
                  <p className="text-xs text-green-400">● Online</p>
                </div>
              </div>
              <button onClick={() => setChatAberto(false)} className="text-slate-400 hover:text-white text-xl">&times;</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-900 space-y-4">
              {historico.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.sender_type === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : msg.sender_type === 'admin'
                      ? 'bg-green-600 text-white rounded-bl-none shadow-sm' 
                      : 'bg-slate-700 border border-slate-600 text-slate-100 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.sender_type === 'admin' && <span className="block text-[10px] font-bold text-green-200 mb-1">Admin (Humano)</span>}
                    
                    {/* Mensagem Original */}
                    {msg.message && <p>{msg.message}</p>}
                    
                    {/* Tradução (se existir) */}
                    {msg.translated_message && (
                      <p className="mt-2 pt-2 border-t border-white/20 text-xs italic opacity-80">
                        {msg.translated_message}
                      </p>
                    )}
                    
                    {msg.image_url && <img src={msg.image_url} alt="Anexo" className="mt-2 rounded-lg max-h-32 object-cover" />}
                  </div>
                </div>
              ))}
              {loading && <p className="text-xs text-slate-400 text-center animate-pulse">A Bete está a escrever...</p>}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-blue-400 p-2 text-xl" title="Anexar foto">📎</button>
              <input type="file" accept="image/*" onChange={(e) => setImagemAnexada(e.target.files?.[0] || null)} className="hidden" ref={fileInputRef} />
              {imagemAnexada && <span className="text-xs text-blue-400 font-bold">Foto anexada!</span>}
              
              <input 
                type="text" 
                value={mensagem} 
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Escreva aqui..." 
                className="flex-1 bg-slate-900 text-white p-2 rounded-lg text-sm outline-none border border-slate-700 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleEnviarMensagem()}
                disabled={loading}
              />
              <button 
                onClick={handleEnviarMensagem} 
                disabled={loading || (!mensagem.trim() && !imagemAnexada)} 
                className="bg-blue-600 text-white p-2 px-4 rounded-lg font-bold text-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? '...' : 'Enviar'}
              </button>
            </div>
          </div>
        )}

        {/* --- PERGUNTAS FREQUENTES (FAQ) --- */}
        <h2 className="text-lg font-bold text-white mb-4 mt-8">Perguntas mais frequentes</h2>
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            value={pesquisaFaq} 
            onChange={(e) => setPesquisaFaq(e.target.value)} 
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl py-3 pl-4 outline-none focus:border-blue-500" 
          />
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {faqsFiltrados.length === 0 ? (
            <div className="p-5 text-center text-slate-400 text-sm">Nenhuma pergunta encontrada.</div>
          ) : (
            faqsFiltrados.map((faq, index) => (
              <div key={index} className="border-b border-slate-700 last:border-0">
                <button 
                  onClick={() => setFaqAberto(faqAberto === index ? null : index)} 
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700 transition-colors"
                >
                  <span className="font-bold text-slate-200 text-sm">{faq.pergunta}</span>
                  <span className="text-slate-400">{faqAberto === index ? '▲' : '▼'}</span>
                </button>
                {faqAberto === index && (
                  <div className="px-5 pb-5 text-sm text-slate-400 bg-slate-900">
                    {faq.resposta}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* --- NAVEGAÇÃO INFERIOR --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 flex justify-around py-2 px-2 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-slate-400 p-2 hover:text-white transition-colors">
          <span className="text-xl">🏠</span><span className="text-[10px] font-medium mt-1">Início</span>
        </Link>
        <Link href="/servicos" className="flex flex-col items-center text-slate-400 p-2 hover:text-white transition-colors">
          <span className="text-xl">🌐</span><span className="text-[10px] font-medium mt-1">Serviços</span>
        </Link>
        <Link href="/saldo" className="flex flex-col items-center text-slate-400 p-2 hover:text-white transition-colors">
          <span className="text-xl">💰</span><span className="text-[10px] font-medium mt-1">Saldo</span>
        </Link>
        <Link href="/apoio" className="flex flex-col items-center text-cyan-400 p-2">
          <span className="text-xl">🎧</span><span className="text-[10px] font-bold mt-1">Apoio</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center text-slate-400 p-2 hover:text-white transition-colors">
          <span className="text-xl">👤</span><span className="text-[10px] font-medium mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  );
}