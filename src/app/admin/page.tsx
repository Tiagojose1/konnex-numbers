// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatarMoeda } from '@/lib/currencies';
import { toast } from 'sonner';

// Definição dos Tipos
interface AdminUser {
  id: string;
  nome_completo: string;
  saldo: string | number;
  currency: string;
  created_at: string;
}

interface AdminOrder {
  id: string;
  servico: string;
  status: string;
  valor: string | number;
  profiles: { nome_completo: string } | null;
}

// 🆕 Novo Tipo para os Tickets de Suporte
interface AdminTicket {
  id: string;
  status: string;
  created_at: string;
  profiles: { nome_completo: string } | null;
}

interface AdminData {
  usuarios: AdminUser[];
  pedidos: AdminOrder[];
  ticketsSuporte: AdminTicket[]; // 🆕 Adicionado aqui
  metricas: {
    totalUtilizadores: number;
    totalSaldoEmCustodia: number;
    receitaTotal: number;
    totalPedidos: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<AdminData | null>(null);

  useEffect(() => {
    const carregarAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        const resposta = await fetch('/api/admin/dados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: session.user.email, 
            userId: session.user.id 
          }),
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
          toast.error(resultado.error || 'Acesso negado.');
          router.push('/dashboard');
          return;
        }

        setDados(resultado);

      } catch {
        toast.error('Erro ao ligar ao servidor.');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    carregarAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="animate-pulse">A verificar credenciais de administrador...</p>
      </div>
    );
  }

  if (!dados) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-24 font-sans">
      
      {/* Cabeçalho do Admin */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-yellow-400">👑</span> Painel de Administração
          </h1>
          <p className="text-slate-400 text-sm">Konnex Numbers - Controlo Total</p>
        </div>
        <Link href="/dashboard" className="bg-slate-800 hover:bg-slate-700 text-sm py-2 px-4 rounded-lg transition-colors">
          Voltar ao App
        </Link>
      </header>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Utilizadores</p>
          <h2 className="text-2xl font-bold text-white">{dados.metricas.totalUtilizadores}</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Saldo em Custódia</p>
          <h2 className="text-2xl font-bold text-cyan-400">{formatarMoeda(dados.metricas.totalSaldoEmCustodia, 'MZN')}</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Receita (Concluídos)</p>
          <h2 className="text-2xl font-bold text-green-400">{formatarMoeda(dados.metricas.receitaTotal, 'MZN')}</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Pedidos</p>
          <h2 className="text-2xl font-bold text-yellow-400">{dados.metricas.totalPedidos}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Tabela de Utilizadores */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="font-bold text-lg mb-4 text-slate-200">Últimos Utilizadores</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 rounded-lg">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Saldo</th>
                  <th className="px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {dados.usuarios.slice(0, 10).map((user: AdminUser) => (
                  <tr key={user.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-white">{user.nome_completo}</td>
                    <td className="px-4 py-3 text-cyan-400">{formatarMoeda(parseFloat(user.saldo as string), user.currency)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString('pt-MZ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabela de Pedidos Globais */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="font-bold text-lg mb-4 text-slate-200">Últimos Pedidos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 rounded-lg">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {dados.pedidos.slice(0, 10).map((pedido: AdminOrder) => (
                  <tr key={pedido.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-white">{pedido.profiles?.nome_completo || 'Desconhecido'}</td>
                    <td className="px-4 py-3 text-slate-300">{pedido.servico}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        pedido.status === 'Concluído' ? 'bg-green-500/20 text-green-400' : 
                        pedido.status === 'Cancelado' ? 'bg-red-500/20 text-red-400' : 
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">{pedido.valor} MT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 🆕 Secção de Suporte (Tickets) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
          <span className="text-red-400">🚨</span> Tickets de Suporte Pendentes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
              <tr>
                <th className="px-4 py-3">Utilizador</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Acção</th>
              </tr>
            </thead>
            <tbody>
              {dados.ticketsSuporte && dados.ticketsSuporte.length > 0 ? (
                dados.ticketsSuporte.map((ticket: AdminTicket) => (
                  <tr key={ticket.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-white font-medium">
                      {ticket.profiles?.nome_completo || 'Utilizador Desconhecido'}
                    </td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${
                         ticket.status === 'Aguardando Admin' ? 'bg-red-500/20 text-red-400' : 
                         ticket.status === 'Bot' ? 'bg-blue-500/20 text-blue-400' :
                         'bg-green-500/20 text-green-400'
                       }`}>
                         {ticket.status}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(ticket.created_at).toLocaleString('pt-MZ')}
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => toast.info('O chat de admin será aberto em breve!')}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Abrir Chat
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Nenhum ticket de suporte no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}