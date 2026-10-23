// src/app/servicos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { converterParaMZN, formatarMoeda } from '@/lib/currencies';
import { countries, getCountry } from '@/data/countries';
import { services } from '@/data/services';
import { getPrice } from '@/data/pricesByCountry';

export default function ServicosPage() {
  const router = useRouter();
  const [paisAberto, setPaisAberto] = useState<string | null>('mz'); 
  const [pesquisa, setPesquisa] = useState('');
  const [aProcessar, setAProcessar] = useState<string | null>(null);
  const [userCurrency, setUserCurrency] = useState('MZN');
  
  // 🆕 Estados para o Modal de Escolha
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState<any>(null);
  const [paisSelecionadoParaCompra, setPaisSelecionadoParaCompra] = useState<any>(null);

  useEffect(() => {
    const carregarMoeda = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('currency').eq('id', session.user.id).single();
        if (profile) setUserCurrency(profile.currency || 'MZN');
      }
    };
    carregarMoeda();
  }, []);

  const togglePais = (paisId: string) => setPaisAberto(paisAberto === paisId ? null : paisId);

  // 🆕 Função que abre o modal em vez de comprar logo
  const abrirModalCompra = (servico: any, paisId: string) => {
    const paisInfo = getCountry(paisId);
    setServicoSelecionado(servico);
    setPaisSelecionadoParaCompra(paisInfo);
    setModalAberto(true);
  };

  // 🆕 Função que realmente efetua a compra (chamada pelos botões do modal)
  const efetuarCompra = async (isCustom: boolean) => {
    if (!servicoSelecionado || !paisSelecionadoParaCompra) return;
    
    setModalAberto(false);
    setAProcessar(servicoSelecionado.id);

    const variant = isCustom ? 'custom' : 'random';
    const precoInfo = getPrice(servicoSelecionado.id, paisSelecionadoParaCompra.id, variant);
    
    if (!precoInfo) {
        alert("Erro ao obter preço.");
        setAProcessar(null);
        return;
    }

    // Se for número padrão sem stock, bloqueia
    if (precoInfo.available === 0 && precoInfo.isDefault && !isCustom) {
      alert("Serviço sem stock confirmado no momento. Tente a opção personalizada ou mais tarde.");
      setAProcessar(null);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const valorEmMZN = converterParaMZN(precoInfo.price || 0, paisSelecionadoParaCompra.currency);

    const resposta = await fetch('/api/comprar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session.user.id,
        servico: servicoSelecionado.name,
        pais: paisSelecionadoParaCompra.name,
        preco: valorEmMZN,
        isCustom: isCustom // 🆕 Envia para o backend
      }),
    });

    const dados = await resposta.json();

    if (dados.error) {
      alert(`Erro: ${dados.error}`);
      setAProcessar(null);
    } else {
      alert(dados.mensagem);
      router.push('/pedidos');
    }
  };

  // ... (O resto do código da lista de países igual ao que já tem) ...

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      {/* ... (Cabeçalho e lista de países igual ao anterior) ... */}

      {/* 🆕 MODAL DE ESCOLHA (Aparece quando clica em Obter) */}
      {modalAberto && servicoSelecionado && paisSelecionadoParaCompra && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl p-6 border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white text-center mb-1">Como deseja o seu número?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">{servicoSelecionado.name} - {paisSelecionadoParaCompra.name}</p>
            
            <div className="space-y-3">
              {/* Opção 1: Aleatório */}
              <button 
                onClick={() => efetuarCompra(false)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl flex justify-between items-center transition-colors border border-slate-600"
              >
                <div className="text-left">
                  <span className="block font-bold">Número Aleatório</span>
                  <span className="text-xs text-slate-400">Gerado pelo sistema</span>
                </div>
                <span className="text-yellow-400 font-bold">
                  {getPrice(servicoSelecionado.id, paisSelecionadoParaCompra.id, 'random')?.price} {paisSelecionadoParaCompra.currencySymbol}
                </span>
              </button>

              {/* Opção 2: Personalizado */}
              <button 
                onClick={() => efetuarCompra(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white p-4 rounded-xl flex justify-between items-center transition-colors shadow-lg border border-purple-500"
              >
                <div className="text-left">
                  <span className="block font-bold">Número Personalizado</span>
                  <span className="text-xs text-purple-200">Escolha os dígitos finais</span>
                </div>
                <span className="text-yellow-300 font-bold">
                  {getPrice(servicoSelecionado.id, paisSelecionadoParaCompra.id, 'custom')?.price} {paisSelecionadoParaCompra.currencySymbol}
                </span>
              </button>
            </div>

            <button onClick={() => setModalAberto(false)} className="w-full text-center text-slate-400 mt-6 text-sm hover:text-white">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ... (Navegação Inferior igual ao anterior) ... */}
    </div>
  );
}