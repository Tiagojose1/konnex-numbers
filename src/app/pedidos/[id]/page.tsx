/* eslint-disable @next/next/no-img-element */
// src/app/pedidos/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function DetalhePedidoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [pedido, setPedido] = useState<any>(null);
  const [tempoRestante, setTempoRestante] = useState(0); // Em segundos
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar os dados do pedido
  useEffect(() => {
    const carregarPedido = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', session.user.id)
        .single();

      if (data) {
        setPedido(data);
        calcularTempo(data.data_criacao, data.status);
      }
      setLoading(false);
    };

    carregarPedido();

    // Escutar alterações em tempo real (para o SMS chegar sem dar F5)
    const canal = supabase.channel(`pedido-${params.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${params.id}` }, (payload) => {
        setPedido(payload.new);
        if (payload.new.status === 'Concluído') {
          toast.success('SMS Recebido!');
        }
      }).subscribe();

    return () => {
      supabase.removeChannel(canal);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [params.id]);

  // Lógica do Timer (15 minutos de validade)
  const calcularTempo = (dataCriacao: string, status: string) => {
    if (status !== 'Aguardando') return;

    const agora = new Date().getTime();
    const criacao = new Date(dataCriacao).getTime();
    const limite = criacao + 15 * 60 * 1000; // 15 minutos
    const diferenca = Math.max(0, Math.floor((limite - agora) / 1000));
    
    setTempoRestante(diferenca);

    if (intervalRef.current) clearInterval(intervalRef.current);
    
    if (diferenca > 0) {
      intervalRef.current = setInterval(() => {
        setTempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copiarCodigo = () => {
    if (pedido?.codigo_recebido) {
      navigator.clipboard.writeText(pedido.codigo_recebido);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const cancelarPedido = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const confirmacao = window.confirm('Deseja cancelar este pedido e receber o reembolso?');
    if (!confirmacao) return;

    toast.loading('A cancelar...', { id: 'cancelar' });
    const res = await fetch('/api/cancelar-pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidoId: pedido.id, userId: session.user.id })
    });

    const data = await res.json();
    if (data.error) {
      toast.error(data.error, { id: 'cancelar' });
    } else {
      toast.success(data.mensagem, { id: 'cancelar' });
      router.push('/pedidos');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">A carregar pedido...</div>;
  if (!pedido) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Pedido não encontrado.</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 font-sans text-white pb-24">
      <div className="max-w-md mx-auto">
        
        <header className="flex items-center gap-4 mb-6">
          <Link href="/pedidos" className="text-slate-400 hover:text-white text-2xl">←</Link>
          <h1 className="text-xl font-bold">Detalhes do Pedido</h1>
        </header>

        {/* CARTÃO DO SERVIÇO */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center mb-6 shadow-xl relative overflow-hidden">
          <h2 className="text-2xl font-bold text-white mb-1">{pedido.servico}</h2>
          <p className="text-slate-400 text-sm mb-4">{pedido.pais}</p>
          
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 mb-4">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">O seu número virtual</p>
            <p className="text-3xl font-mono text-cyan-400 font-bold tracking-wider">{pedido.numero}</p>
          </div>

          {pedido.status === 'Aguardando' && (
            <div className="flex flex-col items-center">
              <p className="text-sm text-slate-400 mb-2">Aguarde o código SMS...</p>
              <div className={`text-3xl font-mono font-bold ${tempoRestante < 60 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                {formatarTempo(tempoRestante)}
              </div>
            </div>
          )}
        </div>

        {/* CÓDIGO RECEBIDO */}
        {pedido.sms_otp === 'Sucesso' && pedido.codigo_recebido && (
          <div className="bg-green-900/20 rounded-2xl p-6 border border-green-700 text-center mb-6 shadow-lg">
            <p className="text-sm text-green-400 font-bold uppercase mb-2">Código Recebido!</p>
            <p className="text-5xl font-extrabold text-white tracking-widest mb-4">{pedido.codigo_recebido}</p>
            <button onClick={copiarCodigo} className="bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 px-6 rounded-xl w-full transition-colors">
              {copiado ? '✓ Copiado!' : 'Copiar Código'}
            </button>
          </div>
        )}

        {/* BOTÃO DE CANCELAR */}
        {pedido.status === 'Aguardando' && (
          <button onClick={cancelarPedido} className="w-full bg-slate-800 text-red-400 font-bold py-4 rounded-xl border border-red-900/50 hover:bg-red-900/20 transition-colors">
            Cancelar e Reembolsar
          </button>
        )}

        {pedido.status === 'Cancelado' && (
          <div className="bg-red-900/20 p-4 rounded-xl border border-red-900/50 text-center text-red-400">
            Este pedido foi cancelado e o valor foi reembolsado.
          </div>
        )}

      </div>
    </div>
  );
}