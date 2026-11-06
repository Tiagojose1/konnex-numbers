// src/app/pedidos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus, SmsStatus } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link'; // 🆕 Import do Link

interface PedidoSupabase {
  id: string;
  numero: string;
  status: OrderStatus;
  sms_otp: SmsStatus;
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
  const [pedidos, setPedidos] = useState<Order[]>([]);

  useEffect(() => {
    let canal: RealtimeChannel | null = null;

    const carregarPedidos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

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

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
      } else if (data) {
        setPedidos(data as Order[]);
      }
      setLoading(false);

      // Ligar o Tempo Real
      canal = supabase
        .channel('alteracoes-pedidos')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${session.user.id}` },
          (payload) => {
            const pedidoAtualizado = payload.new as PedidoSupabase;
            
            if (pedidoAtualizado.sms_otp === 'Sucesso') {
              toast.success(`SMS Recebido para ${pedidoAtualizado.numero}!`);
              
              // 🆕 Enviar email quando o SMS chegar
              if (session.user.email) {
                fetch('/api/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    to: session.user.email,
                    subject: `O seu código SMS chegou! 📩`,
                    html: `
                      <div style="font-family: sans-serif; color: #333;">
                        <h2>O seu código chegou!</h2>
                        <p>O código para o serviço <strong>${pedidoAtualizado.servico}</strong> é:</p>
                        <h1 style="color: #7c3aed; letter-spacing: 5px; font-size: 32px;">${pedidoAtualizado.codigo_recebido}</h1>
                        <p>Já pode usar este código no aplicativo.</p>
                      </div>
                    `
                  })
                }).catch(err => console.error('Erro email:', err));
              }
            }

            setPedidos((prev) =>
              prev.map((p) => p.id === pedidoAtualizado.id ? { ...p, ...pedidoAtualizado } : p)
            );
          }
        ).subscribe();
    };

    carregarPedidos();

    const intervalo = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const resposta = await fetch('/api/verificar-expirados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id }),
        });
        const dados = await resposta.json();
        if (dados.reembolsados > 0) toast.warning(`${dados.reembolsados} pedido(s) expiraram.`);
      }
    }, 60000);

    return () => {
      clearInterval(intervalo);
      if (canal) supabase.removeChannel(canal);
    };
  }, [router]);

  return (
    <div className="p-4 max-w-4xl mx-auto min-h-screen bg-[#0f172a] text-white">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus Pedidos</h1>
          <p className="text-slate-400 text-sm">Acompanhe os seus números virtuais.</p>
        </div>
        <Link href="/dashboard" className="text-slate-400 hover:text-white text-2xl">&times;</Link>
      </header>

      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">A carregar...</div>
      ) : pedidos.length > 0 ? (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-xl">
                  {pedido.status === 'Concluído' ? '✅' : pedido.status === 'Cancelado' ? '❌' : '⏳'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{pedido.servico}</h3>
                  <p className="text-slate-400 text-sm">{pedido.numero} ({pedido.pais})</p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold">Status</p>
                  <p className={`text-sm font-bold ${pedido.status === 'Concluído' ? 'text-green-400' : pedido.status === 'Cancelado' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {pedido.status}
                  </p>
                </div>
                
                {/* 🆕 Botão para a página de detalhes */}
                <Link href={`/pedidos/${pedido.id}`} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                  Ver Detalhes
                </Link>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800 p-12 rounded-2xl border border-slate-700 text-center mt-8">
          <p className="text-4xl mb-4">📭</p>
          <h3 className="text-lg font-bold mb-2">Ainda não tem pedidos</h3>
          <p className="text-slate-400 mb-6">Assim que comprar o seu primeiro número, ele aparecerá aqui.</p>
          <Link href="/servicos" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md inline-block">
            Obter Número Agora
          </Link>
        </div>
      )}
    </div>
  );
}