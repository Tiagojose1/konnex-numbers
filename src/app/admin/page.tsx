// src/app/admin/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatarMoeda } from '@/lib/currencies';

export default function AdminPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'users' | 'tickets' | 'historico'>('dashboard');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, saldoTotalUsuarios: 0, receitaPlataforma: 0, totalPedidos: 0 });
  const [graficoData, setGraficoData] = useState<{dia: string, valor: number}[]>([]);

  // Listas
  const [users, setUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);

  // Modal Saldo
  const [userSelecionado, setUserSelecionado] = useState<any | null>(null);
  const [valorAjuste, setValorAjuste] = useState('');
  const [acaoAjuste, setAcaoAjuste] = useState<'add' | 'remove'>('add');

  // Chat
  const [chatAberto, setChatAberto] = useState(false);
  const [ticketSelecionado, setTicketSelecionado] = useState<any | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const verificarAcesso = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== 'alexjosepais6@gmail.com') {
        router.push('/dashboard');
        return;
      }
      setAutorizado(true);
      carregarDados();
    };
    verificarAcesso();
  }, [router]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const resGestao = await fetch('/api/admin/gestao');
      const dataGestao = await resGestao.json();
      setUsers(dataGestao.users || []);
      setTransacoes(dataGestao.transacoes || []);
      setPedidos(dataGestao.pedidos || []);

      const resStats = await fetch('/api/admin/stats');
      const dataStats = await resStats.json();
      setStats(dataStats);
      setGraficoData(dataStats.graficoData || []);

      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select(`*, profiles!user_id (nome_completo)`)
        .order('created_at', { ascending: false });
      setTickets(ticketsData || []);
    } catch (err) {
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleAjusteSaldo = async () => {
    if (!userSelecionado || !valorAjuste) return;
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
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const abrirTicket = async (ticket: any) => {
    setTicketSelecionado(ticket); setChatAberto(true); setHistorico([]);
    const { data } = await supabase.from('support_messages').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
    if (data) setHistorico(data);
  };

  const fecharTicket = async () => {
    if (!ticketSelecionado) return;
    await supabase.from('support_tickets').update({ status: 'Fechado' }).eq('id', ticketSelecionado.id);
    toast.success('Ticket fechado!');
    setChatAberto(false);
    carregarDados();
  };

  const enviarResposta = async () => {
    if (!mensagem.trim() || !ticketSelecionado) return;
    const texto = mensagem; setMensagem('');
    await fetch('/api/apoio/admin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: ticketSelecionado.id, mensagem: texto })
    });
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [historico]);

  if (!autorizado) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">A verificar...</div>;

  const maxValorGrafico = graficoData.length > 0 ? Math.max(...graficoData.map(d => d.valor)) : 1;

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 font-sans text-white pb-24">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Konnex Admin</h1>
            <p className="text-slate-400 text-sm">Gestão Global</p>
          </div>
          <button onClick={carregarDados} className="bg-slate-800 px-4 py-2 rounded-lg text-sm hover:bg-slate-700">🔄 Atualizar</button>
        </div>

        {/* ABAS */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2 overflow-x-auto">
          <button onClick={() => setAbaAtiva('dashboard')} className={`px-4 py-2 whitespace-nowrap font-bold text-sm ${abaAtiva === 'dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>📊 Resumo</button>
          <button onClick={() => setAbaAtiva('historico')} className={`px-4 py-2 whitespace-nowrap font-bold text-sm ${abaAtiva === 'historico' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>📜 Histórico</button>
          <button onClick={() => setAbaAtiva('users')} className={`px-4 py-2 whitespace-nowrap font-bold text-sm ${abaAtiva === 'users' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>👥 Utilizadores</button>
          <button onClick={() => setAbaAtiva('tickets')} className={`px-4 py-2 whitespace-nowrap font-bold text-sm ${abaAtiva === 'tickets' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>🎧 Suporte</button>
        </div>

        {/* ABA: DASHBOARD */}
        {abaAtiva === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Utilizadores</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Saldo em Carteiras</p>
                <p className="text-3xl font-bold text-yellow-400">${stats.saldoTotalUsuarios.toFixed(2)}</p>
              </div>
              <div className="bg-slate-800 p-5 rounded-xl border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <p className="text-green-400 text-xs font-bold uppercase mb-1">Minha Receita</p>
                <p className="text-3xl font-bold text-green-400">${stats.receitaPlataforma.toFixed(2)}</p>
              </div>
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Pedidos</p>
                <p className="text-3xl font-bold text-cyan-400">{stats.totalPedidos}</p>
              </div>
            </div>

            {/* GRÁFICO CORRIGIDO */}
            {graficoData.length > 0 && (
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-lg font-bold mb-6">Vendas (Últimos 7 dias)</h2>
                <div className="flex items-end gap-4 h-48">
                  {graficoData.map((item, i) => {
                    const altura = (item.valor / maxValorGrafico) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">${item.valor.toFixed(0)}</span>
                        <div className="w-full bg-gradient-to-t from-purple-600 to-cyan-400 rounded-t-md" style={{ height: `${Math.max(altura, 5)}%` }}></div>
                        <span className="text-[10px] text-slate-500">{item.dia}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA: HISTÓRICO */}
        {abaAtiva === 'historico' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 font-bold">💰 Depósitos</div>
              <table className="w-full text-left text-sm">
                <thead><tr className="bg-slate-800 text-slate-400 text-xs"><th className="p-3">User</th><th className="p-3">Método</th><th className="p-3">Valor</th><th className="p-3">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-700">
                  {transacoes.map((t: any) => (
                    <tr key={t.id}><td className="p-3">{t.profiles?.nome_completo || 'Desconhecido'}</td><td className="p-3">{t.metodo}</td><td className="p-3 text-green-400">${t.valor?.toFixed(2)}</td><td className="p-3">{t.status}</td></tr>
                  ))}
                  {transacoes.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-500">Nenhum depósito.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 font-bold">🛒 Compras</div>
              <table className="w-full text-left text-sm">
                <thead><tr className="bg-slate-800 text-slate-400 text-xs"><th className="p-3">User</th><th className="p-3">Serviço</th><th className="p-3">Número</th><th className="p-3">Valor</th><th className="p-3">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-700">
                  {pedidos.map((p: any) => (
                    <tr key={p.id}><td className="p-3">{p.profiles?.nome_completo || 'Desconhecido'}</td><td className="p-3">{p.servico}</td><td className="p-3 font-mono text-xs">{p.numero}</td><td className="p-3 text-cyan-400">${p.valor?.toFixed(2)}</td><td className="p-3">{p.status}</td></tr>
                  ))}
                  {pedidos.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhuma compra.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA: UTILIZADORES */}
        {abaAtiva === 'users' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-slate-900 text-slate-400 text-xs"><th className="p-4">Nome</th><th className="p-4">Email</th><th className="p-4">Saldo (USD)</th><th className="p-4">Ação</th></tr></thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td className="p-4">{u.nome_completo || 'Sem Nome'}</td>
                    <td className="p-4 text-slate-400">{u.email}</td>
                    <td className="p-4 text-green-400 font-bold">${parseFloat(u.saldo || 0).toFixed(2)}</td>
                    <td className="p-4">
                      <button onClick={() => { setUserSelecionado(u); setValorAjuste(''); }} className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-xs font-bold">Ajustar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ABA: TICKETS */}
        {abaAtiva === 'tickets' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-slate-900 text-slate-400 text-xs"><th className="p-4">Utilizador</th><th className="p-4">Status</th><th className="p-4">Ação</th></tr></thead>
              <tbody className="divide-y divide-slate-700">
                {tickets.map((t: any) => (
                  <tr key={t.id}>
                    <td className="p-4">{t.profiles?.nome_completo || 'Cliente'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'Fechado' ? 'bg-slate-700 text-slate-400' : 'bg-red-500/20 text-red-400'}`}>{t.status}</span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => abrirTicket(t)} className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs font-bold">Abrir Chat</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE AJUSTE DE SALDO */}
      {userSelecionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4">Ajustar Saldo: {userSelecionado.nome_completo}</h3>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setAcaoAjuste('add')} className={`flex-1 py-2 rounded font-bold ${acaoAjuste === 'add' ? 'bg-green-600' : 'bg-slate-700'}`}>Adicionar (+)</button>
              <button onClick={() => setAcaoAjuste('remove')} className={`flex-1 py-2 rounded font-bold ${acaoAjuste === 'remove' ? 'bg-red-600' : 'bg-slate-700'}`}>Remover (-)</button>
            </div>
            <input type="number" placeholder="Valor em USD" value={valorAjuste} onChange={e => setValorAjuste(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg mb-4 text-white" />
            <div className="flex gap-2">
              <button onClick={() => setUserSelecionado(null)} className="flex-1 py-2 bg-slate-700 rounded-lg">Cancelar</button>
              <button onClick={handleAjusteSaldo} className="flex-1 py-2 bg-blue-600 rounded-lg">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO CHAT */}
      {chatAberto && ticketSelecionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-800 w-full max-w-2xl rounded-2xl flex flex-col h-[80vh] border border-slate-700">
            <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-700">
              <h3 className="font-bold">Chat com {ticketSelecionado.profiles?.nome_completo}</h3>
              <button onClick={() => setChatAberto(false)} className="text-2xl">&times;</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-900 space-y-4">
              {historico.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender_type === 'admin' ? 'bg-green-600' : 'bg-slate-700'}`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-slate-700 flex gap-2">
              <input type="text" value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Resposta..." className="flex-1 bg-slate-900 p-3 rounded-xl border border-slate-700 outline-none" onKeyDown={e => e.key === 'Enter' && enviarResposta()} />
              <button onClick={enviarResposta} className="bg-green-600 px-4 rounded-xl font-bold">Enviar</button>
              {/* 🆕 Botão para Fechar o Ticket */}
              <button onClick={fecharTicket} className="bg-red-600 px-4 rounded-xl font-bold text-sm">Fechar Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}