/* eslint-disable @next/next/no-img-element */
// src/app/pedidos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatarMoeda } from '@/lib/currencies'; // 🆕 Importar formatação de moeda

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
  const [currency, setCurrency] = useState('MZN'); // Moeda do utilizador

  useEffect(() => {
    let canal: RealtimeChannel | null = null;

    const carregarPedidos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Vai buscar a moeda do utilizador
      const { data: profile } = await supabase.from('profiles').select('currency').eq('id', session.user.id).single();
      if (profile?.currency) setCurrency(profile.currency);

      // Verificar pedidos expirados
      await fetch('/api/verificar-expirados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });

      // Buscar pedidos
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
      } else if (data) {
        setPedidos(data);
      }
      setLoading(false);

      // 🆕 TEMPO REAL: Atualiza a tabela sem precisar de F5
      canal = supabase
        .channel('alteracoes-pedidos')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${session.user.id}` },
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

    // Verifica expirados a cada 60 segundos
    const intervalo = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch('/api/verificar-expirados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id }),
        });
      }
    }, 60000);

    return () => {
      clearInterval(intervalo);
      if (canal) supabase.removeChannel(canal);
    };
  }, [router]);

  // 🆕 Loop para verificar se o SMS chegou na 5SIM a cada 5 segundos
  useEffect(() => {
    const verificarSmsPendentes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const pendentes = pedidos.filter(p => p.status === 'Aguardando' && p.provider_name);
      
      for (const pedido of pendentes) {
        try {
          await fetch('/api/verificar-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pedidoId: pedido.id, userId: session.user.id }),
          });
        } catch (err) {
          console.error('A verificar SMS:', err);
        }
      }
    };

    const intervaloSms = setInterval(() => {
      if (pedidos.some(p => p.status === 'Aguardando' && p.provider_name)) {
        verificarSmsPendentes();
      }
    }, 5000);

    return () => clearInterval(intervaloSms);
  }, [pedidos]);

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast.success('Código copiado!');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 text-white pb-24 font-sans">
      
      {/* CABEÇALHO AZUL COMO NA IMAGEM */}
      <div className="max-w-6xl mx-auto bg-[#0284c7] rounded-t-xl p-4">
        <h1 className="text-xl font-bold">Meus Pedidos</h1>
      </div>

      {/* CONTAINER DA TABELA */}
      <div className="max-w-6xl mx-auto bg-white rounded-b-xl shadow-lg overflow-hidden">
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
                  // Pega a bandeira e o ícone usando os nomes dos ficheiros (como na imagem)
                  const bandeiraPais = pedido.pais === 'Moçambique' ? '🇲🇿' : pedido.pais === 'Brasil' ? '🇧🇷' : pedido.pais === 'Portugal' ? '🇵🇹' : '🌍';
                  
                  return (
                    <tr key={pedido.id} className="hover:bg-slate-50 transition-colors">
                      {/* Número */}
                      <td className="p-4 font-mono text-slate-700">{pedido.numero}</td>
                      
                      {/* Status */}
                      <td className="p-4">
                        <span className={`font-medium ${pedido.status === 'Cancelado' ? 'text-red-500' : pedido.status === 'Concluído' ? 'text-green-600' : 'text-slate-600'}`}>
                          {pedido.status}
                        </span>
                      </td>

                      {/* SMS (Código) */}
                      <td className="p-4">
                        {pedido.sms_otp === 'Sucesso' && pedido.codigo_recebido ? (
                          <span className="font-mono font-bold text-lg text-green-600 bg-green-50 px-2 py-1 rounded">
                            {pedido.codigo_recebido}
                          </span>
                        ) : pedido.status === 'Cancelado' ? (
                          <span className="text-red-400 text-sm">Cancelado</span>
                        ) : (
                          <span className="text-yellow-500 text-sm animate-pulse">A aguardar...</span>
                        )}
                      </td>

                      {/* Ação (Botão Copiar) */}
                      <td className="p-4 text-center">
                        {pedido.sms_otp === 'Sucesso' && pedido.codigo_recebido ? (
                          <button 
                            onClick={() => copiarCodigo(pedido.codigo_recebido!)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 rounded-lg transition-colors"
                            title="Copiar Código"
                          >
                            📋
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* País */}
                      <td className="p-4 text-center text-2xl" title={pedido.pais}>
                        {bandeiraPais}
                      </td>

                      {/* Serviço (Ícone) */}
                      <td className="p-4 text-center">
                        {pedido.servico === 'WhatsApp' ? (
                          <span className="text-2xl" title="WhatsApp">🟢</span>
                        ) : pedido.servico === 'Telegram' ? (
                          <span className="text-2xl" title="Telegram">✈️</span>
                        ) : pedido.servico === 'Instagram' ? (
                          <span className="text-2xl" title="Instagram">🟣</span>
                        ) : (
                          <span className="text-xl" title={pedido.servico}>📱</span>
                        )}
                      </td>

                      {/* Valor */}
                      <td className="p-4 font-medium">
                        {formatarMoeda(pedido.valor, currency)}
                      </td>

                      {/* Data */}
                      <td className="p-4 text-slate-500 text-xs">
                        {new Date(pedido.data_criacao).toLocaleString('pt-PT')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 text-center">
        <Link href="/servicos" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-colors inline-block">
          Comprar Novo Número
        </Link>
      </div>

    </div>
  );
}