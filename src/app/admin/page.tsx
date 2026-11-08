// src/app/admin/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserProfile { id: string; nome_completo: string; email: string; saldo: number; currency: string; created_at: string; }
interface Ticket { id: string; user_id: string; status: string; created_at: string; profiles: { nome_completo: string; } | null; }
interface Mensagem { id: string; sender_type: string; message: string | null; created_at: string; }
interface Transacao { id: string; valor: number; metodo: string; status: string; created_at: string; profiles: { nome_completo: string; email: string } | null; }
interface Pedido { id: string; numero: string; servico: string; pais: string; valor: number; status: string; data_criacao: string; profiles: { nome_completo: string; email: string } | null; }
interface GraficoItem { dia: string; valor: number; }

export default function AdminPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'users' | 'tickets' | 'historico'>('dashboard');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ totalUsers: 0, saldoTotalUSD: 0, receitaTotal: 0, totalPedidos: 0 });
  const [graficoData, setGraficoData] = useState<GraficoItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const [userSelecionado, setUserSelecionado] = useState<UserProfile | null>(null);
  const [valorAjuste, setValorAjuste] = useState('');
  const [acaoAjuste, setAcaoAjuste] = useState<'add' | 'remove'>('add');
  const [aProcessar, setAProcessar] = useState(false);

  const [chatAberto, setChatAberto] = useState(false);
  const [ticketSelecionado, setTicketSelecionado] = useState<Ticket | null>(null);
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [mensagem, setMensagem] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🆕 Movemos carregarDados para cima
  const carregarDados = async () => {
    setLoading(true);
    try {
      const resStats = await fetch('/api/admin/stats');
      const dataStats = await resStats.json();
      if (!dataStats.error) {
        setStats({
          totalUsers: dataStats.totalUsers,
          saldoTotalUSD: dataStats.saldoTotalUSD,
          receitaTotal: dataStats.receitaTotal,
          totalPedidos: dataStats.totalPedidos
        });
        setGraficoData(dataStats.graficoData || []);
      }

      const resGestao = await fetch('/api/admin/gestao');
      const dataGestao = await resGestao.json();
      if (!dataGestao.error) {
        setUsers(dataGestao.users || []);
        setTransacoes(dataGestao.transacoes || []);
        setPedidos(dataGestao.pedidos || []);
      }

      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select(`*, profiles!user_id (nome_completo)`)
        .order('created_at', { ascending: false })
        .limit(30);
      if (ticketsData) setTickets(ticketsData);
      
    } catch {
      toast.error('Erro ao carregar os dados do admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verificarAcesso = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== 'alexjosepais6@gmail.com') {
        toast.error('Acesso negado.');
        router.push('/dashboard');
        return;
      }
      setAutorizado(true);
      carregarDados();
    };
    verificarAcesso();
  }, [router]);

  const handleAjusteSaldo = async () => {
    if (!userSelecionado || !valorAjuste) return toast.error('Insira um valor válido.');
    setAProcessar(true);
    try {
      const res = await fetch('/api/admin/gestao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userSelecionado.id, action: acaoAjuste, valorUSD: valorAjuste }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success('Saldo ajustado com sucesso!');
      setUserSelecionado(null);
      setValorAjuste('');
      carregarDados();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao ajustar: ' + msg);
    } finally {
      setAProcessar(false);
    }
  };

  const fecharTicket = async (ticketId: string) => {
    try {
      await supabase.from('support_tickets').update({ status: 'Fechado' }).eq('id', ticketId);
      toast.success('Ticket fechado!');
      carregarDados();
    } catch {
      toast.error('Erro ao fechar ticket.');
    }
  };

  const abrirTicket = async (ticket: Ticket) => {
    setTicketSelecionado(ticket); setChatAberto(true); setHistorico([]);
    const { data } = await supabase.from('support_messages').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
    if (data) setHistorico(data);
    if (ticket.status !== 'Em Atendimento' && ticket.status !== 'Fechado') {
      await supabase.from('support_tickets').update({ status: 'Em Atendimento' }).eq('id', ticket.id);
    }
  };

  useEffect(() => {
    if (!ticketSelecionado) return;
    const canalMsgs = supabase.channel(`admin-chat-${ticketSelecionado.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${ticketSelecionado.id}` }, (payload) => {
      setHistorico(prev => prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new as Mensagem]);
    }).subscribe();
    return () => { supabase.removeChannel(canalMsgs); };
  }, [ticketSelecionado]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [historico, chatAberto]);

  const enviarResposta = async () => {
    if (!mensagem.trim() || !ticketSelecionado) return;
    const texto = mensagem; setMensagem('');
    const res = await fetch('/api/apoio/admin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: ticketSelecionado.id, mensagem: texto })
    });
    if (!res.ok) { toast.error('Erro ao enviar.'); setMensagem(texto); }
  };

  if (!autorizado) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">A verificar...</div>;

  const maxValorGrafico = graficoData.length > 0 ? Math.max(...graficoData.map((d) => d.valor)) : 1;

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-6 font-sans text-white pb-24">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Konnex Admin</h1>
            <p className="text-slate-400 text-sm">Gestão Global</p>
          </div>
          <div className="flex gap-2">
            <button onClick={carregarDados} className="bg-slate-800 px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors flex items-center gap-2">
              {loading ? '⏳ A atualizar...' : '🔄 Atualizar Dados'}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2 overflow-x-auto">
          <button onClick={() => setAbaAtiva('dashboard')} className={`px-4 py-2 whitespace-nowrap font-bold text-sm ${abaAtiva === 'dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>📊 Resumo</button>
          <button onClick={() => setAbaAtiva('historico')} className={`px-4 py-2 whitespace-nowrap font-bold text-sm ${abaAtiva === 'historico' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>📜 Histórico</button>
          <button onClick={() => setAbaAtiva('users')} className={`px-4 py-2 whitespace-nowrap font-bold text-sm ${abaAtiva === 'users' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>👥 Utilizadores</button>
          <button onClick={() => setAbaAtiva('tickets')} className={`px-4 py-2 whitespace-nowrap font-bold text-sm ${abaAtiva === 'tickets' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>🎧 Suporte</button>
        </div>

        {abaAtiva === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs font-bold uppercase mb-2">Utilizadores</p>
                <p className="text-3xl font-extrabold text-white">{stats.totalUsers}</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs font-bold uppercase mb-2">Saldo nas Carteiras (Clientes)</p>
                <p className="text-3xl font-extrabold text-blue-400">$ {stats.saldoTotalUSD.toFixed(2)}</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs font-bold uppercase mb-2">Receita Total (Vendas)</p>
                <p className="text-3xl font-extrabold text-green-400">$ {stats.receitaTotal.toFixed(2)}</p>
                <p className="text-[10px] text-slate-500 mt-1">{stats.totalPedidos} compras realizadas</p>
              </div>
            </div>

            {graficoData.length > 0 && (
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h2 className="text-lg font-bold mb-6">Faturação dos Últimos 7 Dias</h2>
                <div className="flex items-end gap-2 md:gap-4 h-48">
                  {graficoData.map((item, i) => {
                    const altura = (item.valor / maxValorGrafico) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                        <span className="text-[10px] text-green-400 font-bold">${item.valor.toFixed(0)}</span>
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-md transition-all duration-500 hover:opacity-80" 
                          style={{ height: `${Math.max(altura, 5)}%` }}
                        ></div>
                        <span className="text-[10px] text-slate-500">{item.dia}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'historico' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                <span className="text-lg">💰</span><h2 className="text-md font-bold">Depósitos Recentes</h2>
              </div>
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-800 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="p-3 border-b border-slate-700">Cliente</th>
                      <th className="p-3 border-b border-slate-700">Método</th>
                      <th className="p-3 border-b border-slate-700">Valor (USD)</th>
                      <th className="p-3 border-b border-slate-700">Status</th>
                      <th className="p-3 border-b border-slate-700">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {transacoes.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-750 text-sm">
                        <td className="p-3 text-white">{t.profiles?.nome_completo || 'Desconhecido'}</td>
                        <td className="p-3 text-slate-400">{t.metodo}</td>
                        <td className="p-3 text-green-400 font-bold">$ {t.valor?.toFixed(2)}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'Aprovado' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{t.status}</span></td>
                        <td className="p-3 text-slate-500 text-xs">{new Date(t.created_at).toLocaleString('pt-PT')}</td>
                      </tr>
                    ))}
                    {transacoes.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhum depósito.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                <span className="text-lg">🛒</span><h2 className="text-md font-bold">Compras Recentes</h2>
              </div>
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-800 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="p-3 border-b border-slate-700">Cliente</th>
                      <th className="p-3 border-b border-slate-700">Serviço</th>
                      <th className="p-3 border-b border-slate-700">Número</th>
                      <th className="p-3 border-b border-slate-700">Valor</th>
                      <th className="p-3 border-b border-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {pedidos.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-750 text-sm">
                        <td className="p-3 text-white">{p.profiles?.nome_completo || 'Desconhecido'}</td>
                        <td className="p-3 text-slate-300">{p.servico} ({p.pais})</td>
                        <td className="p-3 text-slate-400 font-mono text-xs">{p.numero}</td>
                        <td className="p-3 text-cyan-400 font-bold">$ {p.valor?.toFixed(2)}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'Concluído' ? 'bg-green-500/20 text-green-400' : p.status === 'Cancelado' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                    {pedidos.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhuma compra.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'users' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-800 text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="p-4 border-b border-slate-700">Nome</th>
                    <th className="p-4 border-b border-slate-700">Email</th>
                    <th className="p-4 border-b border-slate-700">Saldo</th>
                    <th className="p-4 border-b border-slate-700">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-750">
                      <td className="p-4 text-sm font-medium">{u.nome_completo || 'Sem Nome'}</td>
                      <td className="p-4 text-sm text-slate-400">{u.email}</td>
                      <td className="p-4 text-sm text-green-400 font-bold">$ {parseFloat(u.saldo as unknown as string).toFixed(2)}</td>
                      <td className="p-4">
                        <button onClick={() => { setUserSelecionado(u); setValorAjuste(''); }} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded transition-colors">
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {abaAtiva === 'tickets' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs uppercase">
                    <th className="p-4">Utilizador</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-750">
                      <td className="p-4 font-medium text-white">{ticket.profiles?.nome_completo || 'Cliente'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          ticket.status === 'Aguardando Admin' ? 'bg-red-500/20 text-red-400' : 
                          ticket.status === 'Em Atendimento' ? 'bg-green-500/20 text-green-400' : 
                          ticket.status === 'Fechado' ? 'bg-gray-500/20 text-gray-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>{ticket.status}</span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">{new Date(ticket.created_at).toLocaleString('pt-PT')}</td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => abrirTicket(ticket)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded">Abrir</button>
                        {ticket.status !== 'Fechado' && (
                          <button onClick={() => fecharTicket(ticket.id)} className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 px-4 rounded">Fechar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {userSelecionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl p-6 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Ajustar Saldo</h3>
            <p className="text-slate-400 text-xs mb-4">Utilizador: {userSelecionado.nome_completo}</p>
            
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <button onClick={() => setAcaoAjuste('add')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${acaoAjuste === 'add' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400'}`}>Adicionar (+)</button>
                <button onClick={() => setAcaoAjuste('remove')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${acaoAjuste === 'remove' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'}`}>Remover (-)</button>
              </div>
              <input type="number" placeholder="Valor em USD" value={valorAjuste} onChange={e => setValorAjuste(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setUserSelecionado(null)} className="flex-1 py-2.5 rounded-lg text-slate-400 bg-slate-700 text-sm font-bold">Cancelar</button>
              <button onClick={handleAjusteSaldo} disabled={aProcessar} className="flex-1 py-2.5 rounded-lg text-white bg-blue-600 text-sm font-bold hover:bg-blue-500 disabled:opacity-50">
                {aProcessar ? '...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {chatAberto && ticketSelecionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col h-[80vh] border border-slate-700">
            <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-700">
              <h3 className="font-bold text-white">Chat: {ticketSelecionado.profiles?.nome_completo}</h3>
              <button onClick={() => setChatAberto(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-900 space-y-4">
              {historico.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender_type === 'admin' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
                    {msg.message && <p>{msg.message}</p>}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
              <input type="text" value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Resposta..." className="flex-1 bg-slate-900 text-white p-3 rounded-xl text-sm outline-none border border-slate-700" onKeyDown={(e) => e.key === 'Enter' && enviarResposta()} />
              <button onClick={enviarResposta} className="bg-green-600 text-white px-6 rounded-xl font-bold text-sm">Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}