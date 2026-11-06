// src/app/admin/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserProfile { id: string; nome_completo: string; email: string; saldo: number; currency: string; created_at: string; }
interface Ticket { id: string; user_id: string; status: string; created_at: string; profiles: { nome_completo: string; } | null; }
interface Mensagem { id: string; sender_type: string; message: string | null; translated_message: string | null; image_url: string | null; created_at: string; }
interface Transacao { id: string; valor: number; metodo: string; status: string; created_at: string; profiles: { nome_completo: string; email: string } | null; }
interface Pedido { id: string; numero: string; servico: string; pais: string; valor: number; status: string; sms_otp: string; created_at: string; profiles: { nome_completo: string; email: string } | null; }
interface GraficoItem { dia: string; valor: number; }

export default function AdminPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'dashboard' | 'users' | 'tickets' | 'historico'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const [stats, setStats] = useState({ totalUsers: 0, saldoTotalUSD: 0, totalPedidos: 0 });
  const [graficoData, setGraficoData] = useState<GraficoItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // 🆕 Estados para o Ajuste de Saldo
  const [userSelecionado, setUserSelecionado] = useState<UserProfile | null>(null);
  const [valorAjuste, setValorAjuste] = useState('');
  const [acaoAjuste, setAcaoAjuste] = useState<'add' | 'remove'>('add');

  // Estados do Chat
  const [chatAberto, setChatAberto] = useState(false);
  const [ticketSelecionado, setTicketSelecionado] = useState<Ticket | null>(null);
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [mensagem, setMensagem] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const verificarAcesso = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== 'alexjosepais6@gmail.com') {
        toast.error('Acesso negado.');
        router.push('/dashboard');
        return;
      }
      setAutorizado(true);
    };
    verificarAcesso();
  }, [router]);

  // 🆕 Função de Atualização Forçada
  const carregarAdminData = async () => {
    setAtualizando(true);
    try {
      // Carrega gestão (users, transacoes, pedidos)
      const res = await fetch('/api/admin/gestao');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setUsers(data.users);
      setTransacoes(data.transacoes);
      setPedidos(data.pedidos);

      // 🆕 Carrega as estatísticas e os dados do gráfico
      const resStats = await fetch('/api/admin/stats');
      const dataStats = await resStats.json();
      if (!dataStats.error) {
        setStats({
          totalUsers: dataStats.totalUsers,
          saldoTotalUSD: dataStats.saldoTotalUSD,
          totalPedidos: dataStats.totalPedidos
        });
        setGraficoData(dataStats.graficoData || []);
      }

      // Carrega tickets
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select(`*, profiles!user_id (nome_completo)`)
        .in('status', ['Bot', 'Aguardando Admin', 'Em Atendimento'])
        .order('created_at', { ascending: false });
      if (ticketsData) setTickets(ticketsData as any);
      
      toast.success('Dados atualizados com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setAtualizando(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autorizado) carregarAdminData();
  }, [autorizado]);

  // 🆕 Função para Ajustar Saldo do Utilizador
  const handleAjusteSaldo = async () => {
    if (!userSelecionado || !valorAjuste) return toast.error('Insira um valor válido.');
    
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
      carregarAdminData(); // Atualiza a lista na hora
    } catch (error: any) {
      toast.error('Erro ao ajustar: ' + error.message);
    }
  };

  // 🆕 Exportar Relatório CSV
  const exportarCSV = () => {
    const csv = "Métrica,Valor\n" + 
                `Total Utilizadores,${stats.totalUsers}\n` + 
                `Saldo em Carteiras (USD),${stats.saldoTotalUSD.toFixed(2)}\n` + 
                `Total Pedidos,${stats.totalPedidos}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_konnex_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Chat de Suporte
  const abrirTicket = async (ticket: Ticket) => {
    setTicketSelecionado(ticket); setChatAberto(true); setHistorico([]);
    const { data } = await supabase.from('support_messages').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
    if (data) setHistorico(data);
    if (ticket.status !== 'Em Atendimento') await supabase.from('support_tickets').update({ status: 'Em Atendimento' }).eq('id', ticket.id);
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

  if (!autorizado) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">A verificar credenciais...</div>;

  // Calcula o valor máximo do gráfico para as barras ficarem proporcionais
  const maxValorGrafico = graficoData.length > 0 ? Math.max(...graficoData.map(d => d.valor)) : 1;

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 font-sans text-white pb-24">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Konnex Admin</h1>
            <p className="text-slate-400 text-sm">Gestão Global</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportarCSV} className="bg-slate-800 px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors">📥 Exportar CSV</button>
            <button 
              onClick={carregarAdminData} 
              disabled={atualizando}
              className="bg-slate-800 px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {atualizando ? '⏳ A atualizar...' : '🔄 Atualizar Dados'}
            </button>
          </div>
        </div>

        {/* ABAS */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2 overflow-x-auto">
          <button onClick={() => setAbaAtiva('dashboard')} className={`px-4 py-2 whitespace-nowrap rounded-t-lg font-bold text-sm ${abaAtiva === 'dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>📊 Resumo</button>
          <button onClick={() => setAbaAtiva('historico')} className={`px-4 py-2 whitespace-nowrap rounded-t-lg font-bold text-sm ${abaAtiva === 'historico' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>📜 Histórico</button>
          <button onClick={() => setAbaAtiva('users')} className={`px-4 py-2 whitespace-nowrap rounded-t-lg font-bold text-sm ${abaAtiva === 'users' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>👥 Utilizadores</button>
          <button onClick={() => setAbaAtiva('tickets')} className={`px-4 py-2 whitespace-nowrap rounded-t-lg font-bold text-sm ${abaAtiva === 'tickets' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>🎧 Suporte</button>
        </div>

        {/* ABA: DASHBOARD */}
        {abaAtiva === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs font-bold uppercase mb-2">Total Utilizadores</p>
                <p className="text-4xl font-extrabold text-white">{stats.totalUsers}</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs font-bold uppercase mb-2">Saldo Total (Carteiras)</p>
                <p className="text-4xl font-extrabold text-green-400">$ {stats.saldoTotalUSD.toFixed(2)}</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs font-bold uppercase mb-2">Total Pedidos (Números)</p>
                <p className="text-4xl font-extrabold text-cyan-400">{stats.totalPedidos}</p>
              </div>
            </div>

            {/* 🆕 GRÁFICO DE VENDAS */}
            {graficoData.length > 0 && (
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h2 className="text-lg font-bold mb-6">Vendas dos Últimos 7 Dias (USD)</h2>
                <div className="flex items-end gap-2 md:gap-4 h-48">
                  {graficoData.map((item, i) => {
                    const altura = (item.valor / maxValorGrafico) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">${item.valor.toFixed(0)}</span>
                        <div 
                          className="w-full bg-gradient-to-t from-purple-600 to-cyan-400 rounded-t-md transition-all duration-500 hover:opacity-80" 
                          style={{ height: `${Math.max(altura, 5)}%` }} // Mínimo 5% para a barra ser visível
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

        {/* ABA: HISTÓRICO */}
        {abaAtiva === 'historico' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                <span className="text-lg">💰</span><h2 className="text-md font-bold">Histórico de Depósitos (Recargas)</h2>
              </div>
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr className="text-slate-400 text-xs uppercase tracking-wider">
                      <th className="p-3 font-bold border-b border-slate-700">Utilizador</th>
                      <th className="p-3 font-bold border-b border-slate-700">Método</th>
                      <th className="p-3 font-bold border-b border-slate-700">Valor (USD)</th>
                      <th className="p-3 font-bold border-b border-slate-700">Status</th>
                      <th className="p-3 font-bold border-b border-slate-700">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {transacoes.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-700 text-sm">
                        <td className="p-3 text-white">{t.profiles?.nome_completo || 'Desconhecido'}</td>
                        <td className="p-3 text-slate-400">{t.metodo}</td>
                        <td className="p-3 text-green-400 font-bold">$ {t.valor?.toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'Aprovado' ? 'bg-green-500/20 text-green-400' : t.status === 'Falhado' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-xs">{new Date(t.created_at).toLocaleString('pt-PT')}</td>
                      </tr>
                    ))}
                    {transacoes.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhum depósito registado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                <span className="text-lg">🛒</span><h2 className="text-md font-bold">Histórico de Compras (Números)</h2>
              </div>
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr className="text-slate-400 text-xs uppercase tracking-wider">
                      <th className="p-3 font-bold border-b border-slate-700">Utilizador</th>
                      <th className="p-3 font-bold border-b border-slate-700">Serviço</th>
                      <th className="p-3 font-bold border-b border-slate-700">Número</th>
                      <th className="p-3 font-bold border-b border-slate-700">Valor (USD)</th>
                      <th className="p-3 font-bold border-b border-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {pedidos.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-700 text-sm">
                        <td className="p-3 text-white">{p.profiles?.nome_completo || 'Desconhecido'}</td>
                        <td className="p-3 text-slate-300 font-medium">{p.servico} ({p.pais})</td>
                        <td className="p-3 text-slate-400 font-mono text-xs">{p.numero || 'A gerar...'}</td>
                        <td className="p-3 text-cyan-400 font-bold">$ {p.valor?.toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'Concluído' ? 'bg-green-500/20 text-green-400' : p.status === 'Cancelado' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {pedidos.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhuma compra registada.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA: UTILIZADORES */}
        {abaAtiva === 'users' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-800">
                  <tr className="text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold border-b border-slate-700">Nome</th>
                    <th className="p-4 font-bold border-b border-slate-700">Email</th>
                    <th className="p-4 font-bold border-b border-slate-700">Saldo (USD)</th>
                    <th className="p-4 font-bold border-b border-slate-700">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-750">
                      <td className="p-4 text-sm font-medium">{u.nome_completo || 'Sem Nome'}</td>
                      <td className="p-4 text-sm text-slate-400">{u.email}</td>
                      <td className="p-4 text-sm text-green-400 font-bold">$ {parseFloat(u.saldo as any).toFixed(2)}</td>
                      <td className="p-4">
                        <button onClick={() => { setUserSelecionado(u); setValorAjuste(''); }} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded transition-colors">
                          Ajustar Saldo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA: TICKETS */}
        {abaAtiva === 'tickets' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Utilizador</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Data</th>
                    <th className="p-4 font-bold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-750">
                      <td className="p-4 font-medium text-white">{ticket.profiles?.nome_completo || `Cliente #${ticket.user_id.substring(0, 8)}`}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${ticket.status === 'Aguardando Admin' ? 'bg-red-500/20 text-red-400' : ticket.status === 'Em Atendimento' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{ticket.status}</span></td>
                      <td className="p-4 text-slate-400 text-sm">{new Date(ticket.created_at).toLocaleString('pt-PT')}</td>
                      <td className="p-4"><button onClick={() => abrirTicket(ticket)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded transition-colors">Abrir Chat</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE AJUSTE DE SALDO */}
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
              <input type="number" placeholder="Valor em USD (ex: 5.00)" value={valorAjuste} onChange={e => setValorAjuste(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setUserSelecionado(null)} className="flex-1 py-2.5 rounded-lg text-slate-400 bg-slate-700 text-sm font-bold hover:bg-slate-600">Cancelar</button>
              <button onClick={handleAjusteSaldo} className="flex-1 py-2.5 rounded-lg text-white bg-blue-600 text-sm font-bold hover:bg-blue-500">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO CHAT */}
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
                    
                    {msg.message && <p>{msg.message}</p>}
                    
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
                placeholder="Escreva em Português..." 
                className="flex-1 bg-slate-900 text-white p-3 rounded-xl text-sm outline-none border border-slate-700 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && enviarResposta()}
              />
              <button onClick={enviarResposta} disabled={!mensagem.trim()} className="bg-green-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-green-500 disabled:opacity-50">
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}