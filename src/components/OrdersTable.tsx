// src/components/OrdersTable.tsx
'use client'; 

import React, { useState, useEffect } from 'react';
import { Order } from '@/types';
import { StatusBadge } from './StatusBadge';
import { supabase } from '@/lib/supabase';
import { formatarMoeda } from '@/lib/currencies';

interface OrdersTableProps {
  pedidosIniciais: Order[];
}

function ContadorExpiracao({ dataCriacaoRaw }: { dataCriacaoRaw: string }) {
  const [tempoRestante, setTempoRestante] = useState('A calcular...');

  useEffect(() => {
    const calcularTempo = () => {
      const agora = new Date().getTime();
      const dataPedido = new Date(dataCriacaoRaw).getTime();
      if (isNaN(dataPedido)) { setTempoRestante('Erro na data'); return; }
      const diferenca = (10 * 60 * 1000) - (agora - dataPedido);
      if (diferenca <= 0) { setTempoRestante('Expirado'); return; }
      const minutos = Math.floor(diferenca / 60000);
      const segundos = Math.floor((diferenca % 60000) / 1000);
      setTempoRestante(`${minutos}m ${segundos}s`);
    };
    calcularTempo();
    const intervalo = setInterval(calcularTempo, 1000);
    return () => clearInterval(intervalo);
  }, [dataCriacaoRaw]);

  return (
    <span className={`text-xs font-mono ${tempoRestante === 'Expirado' ? 'text-red-600 font-bold' : 'text-orange-600'}`}>
      ⏱️ {tempoRestante}
    </span>
  );
}

export function OrdersTable({ pedidosIniciais }: OrdersTableProps) {
  const [pedidos, setPedidos] = useState<Order[]>(pedidosIniciais);
  const [aProcessar, setAProcessar] = useState<string | null>(null);
  const [currency, setCurrency] = useState('MZN');

  // Carregar a moeda do utilizador
  useEffect(() => {
    const carregarMoeda = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', session.user.id)
          .single();
        if (profile) setCurrency(profile.currency || 'MZN');
      }
    };
    carregarMoeda();
  }, []);

  const handleCopiarCodigo = (codigo: string | undefined) => {
    if (!codigo) return;
    navigator.clipboard.writeText(codigo);
    alert(`Código ${codigo} copiado com sucesso!`);
  };

  const handleCancelarPedido = async (id: string, valor: number) => {
    if (!confirm("Tem a certeza que deseja cancelar? O valor será reembolsado no seu saldo.")) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert("Sessão expirada."); return; }

    const resposta = await fetch('/api/cancelar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, pedidoId: id, valor: Number(valor) }),
    });

    const dados = await resposta.json();
    if (dados.error) alert(`Erro: ${dados.error}`);
    else { alert(dados.mensagem); window.location.reload(); }
  };

  const handleSimularSms = async (id: string) => {
    if (!confirm("Simular a receção do SMS para este pedido?")) return;
    
    setAProcessar(id);
    const resposta = await fetch('/api/simular-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidoId: id }),
    });

    const dados = await resposta.json();
    setAProcessar(null);

    if (dados.error) alert(`Erro: ${dados.error}`);
    else { alert(`SMS Simulado! Código: ${dados.codigo}`); window.location.reload(); }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3">Números</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">SMS/OTP</th>
            <th className="px-6 py-3">Acção</th>
            <th className="px-6 py-3">País</th>
            <th className="px-6 py-3">Serviço</th>
            <th className="px-6 py-3">Valor</th>
            <th className="px-6 py-3">Data</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{pedido.numero}</td>
              <td className="px-6 py-4"><StatusBadge tipo="status" valor={pedido.status} /></td>
              <td className="px-6 py-4"><StatusBadge tipo="sms" valor={pedido.sms_otp} /></td>
              <td className="px-6 py-4 flex flex-col gap-1">
                {pedido.status === 'Aguardando' && (
                  <>
                    <ContadorExpiracao dataCriacaoRaw={pedido.data_criacao_raw} />
                    <button 
                      onClick={() => handleSimularSms(pedido.id)} 
                      disabled={aProcessar === pedido.id}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors text-left disabled:opacity-50"
                    >
                      {aProcessar === pedido.id ? 'A processar...' : '📩 Simular SMS'}
                    </button>
                    <button 
                      onClick={() => handleCancelarPedido(pedido.id, pedido.valor)}
                      className="text-red-600 hover:text-red-800 font-medium text-xs transition-colors text-left"
                    >
                      ❌ Cancelar
                    </button>
                  </>
                )}
                {pedido.status === 'Concluído' && (
                  <button 
                    onClick={() => handleCopiarCodigo(pedido.codigo_recebido)}
                    className="text-green-600 hover:text-green-800 font-medium text-xs transition-colors text-left"
                  >
                    📋 Copiar Código
                  </button>
                )}
                {(pedido.status === 'Reembolsado' || pedido.status === 'Cancelado') && (
                  <span className="text-gray-400 text-xs italic">Ver Detalhes</span>
                )}
              </td>
              <td className="px-6 py-4">{pedido.pais}</td>
              <td className="px-6 py-4">{pedido.servico}</td>
              <td className="px-6 py-4 font-bold text-gray-700">
                {formatarMoeda(pedido.valor, currency)}
              </td>
              <td className="px-6 py-4 text-xs text-gray-400">{pedido.data_criacao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}