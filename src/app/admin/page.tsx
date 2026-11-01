// src/app/admin/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profiles: { nome_completo: string; } | null;
}

interface Mensagem {
  id: string;
  sender_type: 'user' | 'bot' | 'admin';
  message: string | null;
  translated_message: string | null;
  image_url: string | null;
  created_at: string;
}

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatAberto, setChatAberto] = useState(false);
  const [ticketSelecionado, setTicketSelecionado] = useState<Ticket | null>(null);
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const carregarTickets = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`*, profiles!user_id (nome_completo)`)
      .in('status', ['Bot', 'Aguardando Admin', 'Em Atendimento'])
      .order('created_at', { ascending: false });

    if (error) toast.error('Erro ao carregar tickets.');
    else if (data) setTickets(data as unknown as Ticket[]);
    setLoading(false);
  };

  useEffect(() => {
    carregarTickets();
    const canalTickets = supabase.channel('admin-tickets').on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => carregarTickets()).subscribe();
    return () => { supabase.removeChannel(canalTickets); };
  }, []);

  const abrirTicket = async (ticket: Ticket) => {
    setTicketSelecionado(ticket);
    setChatAberto(true);
    setHistorico([]);

    const { data } = await supabase.from('support_messages').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
    if (data) setHistorico(data);
    if (ticket.status !== 'Em Atendimento') await supabase.from('support_tickets').update({ status: 'Em Atendimento' }).eq('id', ticket.id);
  };

  useEffect(() => {
    if (!ticketSelecionado) return;
    const canalMsgs = supabase.channel(`admin-chat-${ticketSelecionado.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${ticketSelecionado.id}` }, (payload) => {
      const novaMsg = payload.new as Mensagem;
      setHistorico(prev => prev.find(m => m.id === novaMsg.id) ? prev : [...prev, novaMsg]);
    }).subscribe();
    return () => { supabase.removeChannel(canalMsgs); };
  }, [ticketSelecionado]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [historico, chatAberto]);

  const enviarResposta = async () => {
    if (!mensagem.trim() || !ticketSelecionado) return;
    setEnviando(true);
    const textoEnviado = mensagem;
    setMensagem('');

    // 🔥 Envia via API para o servidor traduzir automaticamente
    const res = await fetch('/api/apoio/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: ticketSelecionado.id, mensagem: textoEnviado })
    });

    if (!res.ok) {
      toast.error('Erro ao enviar.');
      setMensagem(textoEnviado);
    }
    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 font-sans text-white pb-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Painel de Administração</h1>
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
          <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 flex items-center gap-2">
            <span className="text-xl">🚨</span><h2 className="text-lg font-bold text-white">Tickets de Suporte Pendentes</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-slate-700">Utilizador</th>
                  <th className="p-4 font-bold border-b border-slate-700">Status</th>
                  <th className="p-4 font-bold border-b border-slate-700">Data</th>
                  <th className="p-4 font-bold border-b border-slate-700">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">A carregar...</td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum ticket.</td></tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-700 transition-colors">
                      <td className="p-4 font-medium text-white">{ticket.profiles?.nome_completo || `Cliente #${ticket.user_id.substring(0, 8)}`}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${ticket.status === 'Aguardando Admin' ? 'bg-red-500/20 text-red-400' : ticket.status === 'Em Atendimento' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{ticket.status}</span></td>
                      <td className="p-4 text-slate-400 text-sm">{new Date(ticket.created_at).toLocaleString('pt-PT')}</td>
                      <td className="p-4"><button onClick={() => abrirTicket(ticket)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded">Abrir Chat</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {chatAberto && ticketSelecionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col h-[80vh] border border-slate-700">
            <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-700">
              <h3 className="font-bold text-white">Chat com {ticketSelecionado.profiles?.nome_completo || 'Cliente'}</h3>
              <button onClick={() => setChatAberto(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-900 space-y-4">
              {historico.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.sender_type === 'admin' ? 'bg-green-600 text-white rounded-br-none' : 
                    msg.sender_type === 'user' ? 'bg-blue-600 text-white rounded-bl-none' : 
                    'bg-slate-700 border border-slate-600 text-slate-100 rounded-bl-none'
                  }`}>
                    <span className="block text-[10px] font-bold opacity-70 mb-1">
                      {msg.sender_type === 'admin' ? 'Eu (Admin)' : msg.sender_type === 'user' ? 'Cliente' : 'Bete (Bot)'}
                    </span>
                    
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
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
              <input 
                type="text" value={mensagem} onChange={(e) => setMensagem(e.target.value)}
                placeholder="Escreva em Português (será traduzido)..." 
                className="flex-1 bg-slate-900 text-white p-3 rounded-xl text-sm outline-none border border-slate-700 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && enviarResposta()}
                disabled={enviando}
              />
              <button onClick={enviarResposta} disabled={enviando || !mensagem.trim()} className="bg-green-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-green-500 disabled:opacity-50">
                {enviando ? '...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}