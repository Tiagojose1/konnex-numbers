/* eslint-disable @next/next/no-img-element */
// src/app/pedidos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatarMoeda } from '@/lib/currencies';

interface PedidoSupabase {
  id: string;
  numero: string;
  status: string;
  sms_otp: string;
  codigo_recebido: string | null;
  pais: string;
  servico: string;
  valor: number;
  data_criacao: string;
  provider_name: string | null;
}

export default function MeusPedidosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState<PedidoSupabase[]>([]);
  const [currency, setCurrency] = useState('MZN');

  useEffect(() => {
    let canal: RealtimeChannel | null = null;

    const carregarPedidos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('currency').eq('id', session.user.id).single();
      if (profile?.currency) setCurrency(profile.currency);

      await fetch('/api/verificar-expirados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_criacao', { ascending: false });

      if (!error && data) setPedidos(data);
      setLoading(false);

      // TEMPO REAL
      canal = supabase
        .channel('alteracoes-pedidos')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${session.user.id}` },
          (payload) => {
            const pedidoAtualizado = payload.new as PedidoSupabase;
            if (pedidoAtualizado.sms_otp === 'Sucesso') {
              toast.success(`SMS Recebido para ${pedidoAtualizado.numero}!`);
            }
            setPedidos((prev) => prev.map((p) => p.id === pedidoAtualizado.id ? pedidoAtualizado : p));
          }
        ).subscribe();
    };

    carregarPedidos();

    // Verifica SMS na 5SIM a cada 5 segundos
    const intervaloSms = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const pendentes = pedidos.filter(p => p.status === 'Aguardando' && p.provider_name);
      for (const pedido of pendentes) {
        await fetch('/api/verificar-sms', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pedidoId: pedido.id, userId: session.user.id }),
        });
      }
    }, 5000);

    return () => { clearInterval(intervaloSms); if (canal) supabase.removeChannel(canal); };
  }, [pedidos, router]);

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast.success('Código copiado!');
  };

  // Função para devolver o ícone correto do serviço (usando CDN)
  const getServiceIcon = (servico: string) => {
    const s = servico.toLowerCase();
    if (s.includes('whatsapp')) return 'whatsapp';
    if (s.includes('telegram')) return 'telegram';
    if (s.includes('instagram')) return 'instagram';
    if (s.includes('facebook')) return 'facebook';
    return 'google';
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 text-white pb-24 font-sans">
      
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO AZUL COM BOTÃO NO CANTO DIREITO */}
        <div className="bg-[#1e40af] rounded-t-xl p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Meus Pedidos</h1>
          <Link href="/servicos" className="bg-white text-[#1e40af] hover:bg-gray-100 font-bold py-1.5 px-4 rounded-lg text-sm transition-colors">
            + Comprar Novo
          </Link>
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-slate-800 text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
                  <th className="p-4 border-b">Número</th>
                  <th className="p-4 border-b">Status</th>
                  <th className="p-4 border-b">SMS</th>
                  <th className="p-4 border-b text-center">Ação</th>
                  <th className="p-4 border-b text-center">País</th>
                  <th className="p-4 border-b text-center">Serviço</th>
                  <th className="p-4 border-b">Valor</th>
                  <th className="p-4 border-b">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-500">A carregar...</td></tr>
                ) : pedidos.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-500">Nenhum pedido encontrado.</td></tr>
                ) : (
                  pedidos.map((pedido) => {
                    
                    // Lógica de Cores do Status e Texto
                    let statusColor = 'text-yellow-500'; 
                    let statusText = pedido.status;
                    if (pedido.status === 'Concluído' || pedido.sms_otp === 'Sucesso') {
                      statusColor = 'text-green-600';
                      statusText = 'Concluído';
                    } else if (pedido.status === 'Cancelado' || pedido.status === 'Expirado') {
                      statusColor = 'text-red-500';
                    }

                    const isCancelado = pedido.status === 'Cancelado' || pedido.status === 'Expirado';
                    
                    // Lógica da Coluna SMS
                    const smsText = pedido.codigo_recebido 
                      ? pedido.codigo_recebido 
                      : isCancelado 
                        ? pedido.status 
                        : 'A aguardar...';

                    return (
                      <tr key={pedido.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-slate-700">{pedido.numero}</td>
                        
                        <td className="p-4">
                          <span className={`font-bold ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`font-mono font-bold ${pedido.codigo_recebido ? 'text-green-600 text-lg' : isCancelado ? 'text-red-400 text-sm' : 'text-yellow-500 animate-pulse text-sm'}`}>
                            {smsText}
                          </span>
                        </td>

                        {/* Coluna de Ação */}
                        <td className="p-4 text-center">
                          {pedido.codigo_recebido ? (
                            <button onClick={() => copiarCodigo(pedido.codigo_recebido!)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 rounded-lg transition-colors" title="Copiar Código">
                              📋
                            </button>
                          ) : isCancelado ? (
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Reembolsado</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        <td className="p-4 text-center text-2xl" title={pedido.pais}>
                          {pedido.pais === 'Moçambique' ? '🇲🇿' : pedido.pais === 'Brasil' ? '🇧🇷' : pedido.pais === 'Portugal' ? '🇵🇹' : '🌍'}
                        </td>

                        {/* Ícone Original do Serviço */}
                        <td className="p-4 flex justify-center">
                          <img 
                            src={`https://cdn.simpleicons.org/${getServiceIcon(pedido.servico)}`} 
                            alt={pedido.servico} 
                            className="w-6 h-6 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-xl">📱</span>'; }}
                          />
                        </td>

                        <td className="p-4 font-medium">{formatarMoeda(pedido.valor, currency)}</td>
                        <td className="p-4 text-slate-500 text-xs">{new Date(pedido.data_criacao).toLocaleString('pt-PT')}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}