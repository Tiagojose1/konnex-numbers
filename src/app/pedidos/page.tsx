// src/app/pedidos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RealtimeChannel } from '@supabase/supabase-js'; // 🆕 Importação correta
import { OrdersTable } from '@/components/OrdersTable';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus, SmsStatus } from '@/types'; // 🆕 Importar tipos
import { toast } from 'sonner'; 

// Interface para tipar os dados que vêm do Supabase
interface PedidoSupabase {
  id: string;
  numero: string;
  status: OrderStatus; // 🆕 Tipagem estrita
  sms_otp: SmsStatus;  // 🆕 Tipagem estrita
  codigo_recebido: string | null;
  pais: string;
  servico: string;
  valor: number;
  data_criacao: string;
}

export default function MeusPedidosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState<Order[]>([]);

  useEffect(() => {
    let canal: RealtimeChannel | null = null; // 🆕 Substituído 'any' por RealtimeChannel

    const carregarPedidos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Verificar pedidos expirados antes de carregar
      await fetch('/api/verificar-expirados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });

      // Buscar pedidos reais
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
      } else if (data) {
        const pedidosFormatados = data.map((p: PedidoSupabase) => ({
          id: p.id,
          numero: p.numero,
          status: p.status,
          sms_otp: p.sms_otp,
          codigo_recebido: p.codigo_recebido || undefined,
          pais: p.pais,
          servico: p.servico,
          valor: p.valor,
          data_criacao: new Date(p.data_criacao).toLocaleString('pt-MZ'),
          data_criacao_raw: p.data_criacao,
        }));
        setPedidos(pedidosFormatados as Order[]);
      }
      setLoading(false);

      // 🆕 LIGAR O TEMPO REAL (SUPABASE REALTIME)
      canal = supabase
        .channel('alteracoes-pedidos')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${session.user.id}` },
          (payload) => {
            const pedidoAtualizado = payload.new as PedidoSupabase;
            
            // Se o SMS chegou, avisa o utilizador com um toast!
            if (pedidoAtualizado.sms_otp === 'Sucesso') {
              toast.success(`SMS Recebido para ${pedidoAtualizado.numero}! Código: ${pedidoAtualizado.codigo_recebido}`);
            } else if (pedidoAtualizado.status === 'Cancelado') {
              toast.info(`O pedido ${pedidoAtualizado.numero} foi cancelado.`);
            }

            // Atualiza a tabela visualmente na hora (removemos os 'as any' aqui)
            setPedidos((prev) =>
              prev.map((p) =>
                p.id === pedidoAtualizado.id
                  ? {
                      ...p,
                      status: pedidoAtualizado.status,
                      sms_otp: pedidoAtualizado.sms_otp,
                      codigo_recebido: pedidoAtualizado.codigo_recebido || undefined,
                    }
                  : p
              )
            );
          }
        )
        .subscribe();
    };

    carregarPedidos();

    // Verificar a cada 60 segundos se há pedidos expirados
    const intervalo = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const resposta = await fetch('/api/verificar-expirados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id }),
        });
        const dados = await resposta.json();
        
        if (dados.reembolsados > 0) {
          toast.warning(`${dados.reembolsados} pedido(s) expiraram e foram reembolsados.`);
        }
      }
    }, 60000);

    return () => {
      clearInterval(intervalo);
      if (canal) supabase.removeChannel(canal); // 🆕 Limpar o canal ao sair da página
    };
  }, [router]);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
        <p className="text-gray-500">Acompanhe o status dos seus números virtuais.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">A carregar os seus pedidos...</div>
      ) : pedidos.length > 0 ? (
        <OrdersTable pedidosIniciais={pedidos} />
      ) : (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <p className="text-4xl mb-4">📭</p>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Ainda não tem pedidos</h3>
          <p className="text-gray-500 mb-6">Assim que comprar o seu primeiro número, ele aparecerá aqui.</p>
          <a href="/servicos" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md inline-block">
            Obter Número Agora
          </a>
        </div>
      )}
    </div>
  );
}