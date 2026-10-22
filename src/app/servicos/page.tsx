// src/app/servicos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { converterParaMZN } from '@/lib/currencies';
import { countries, getCountry } from '@/data/countries';
import { services } from '@/data/services';
import { getPrice } from '@/data/pricesByCountry';

export default function ServicosPage() {
  const router = useRouter();
  // Estado para controlar qual país está aberto
  const [paisAberto, setPaisAberto] = useState<string | null>(null); 
  const [pesquisa, setPesquisa] = useState('');
  const [aProcessar, setAProcessar] = useState<string | null>(null);
  const [userCurrency, setUserCurrency] = useState('MZN');

  useEffect(() => {
    const carregarMoeda = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', session.user.id)
          .single();
        if (profile) setUserCurrency(profile.currency || 'MZN');
      }
    };
    carregarMoeda();
  }, []);

  const togglePais = (paisId: string) => {
    setPaisAberto(paisAberto === paisId ? null : paisId);
  };

  const handleObterNumero = async (servico: any, paisId: string) => {
    const precoInfo = getPrice(servico.id, paisId);
    if (!precoInfo) return;

    setAProcessar(servico.id);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Precisa de estar logado.");
      setAProcessar(null);
      return;
    }

    const paisInfo = getCountry(paisId);
    if (!paisInfo) return;

    const valorEmMZN = converterParaMZN(precoInfo.price, paisInfo.currency);

    const resposta = await fetch('/api/comprar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session.user.id,
        servico: servico.name,
        pais: paisInfo.name,
        preco: valorEmMZN,
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

  // 🔍 AQUI ESTÁ A CORREÇÃO: Filtramos pela pesquisa, mas mantemos TODOS os países
  const paisesFiltrados = countries.filter(c => 
    c.name.toLowerCase().includes(pesquisa.toLowerCase()) || 
    c.code.includes(pesquisa)
  );

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      
      {/* Cabeçalho Superior */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Escolha o Serviço</h1>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-2xl">&times;</Link>
        </div>

        {/* Barra de Pesquisa (Estilo YellowBet) */}
        <div className="max-w-2xl mx-auto relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text"
            placeholder="Pesquisar país..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg py-2 pl-10 pr-4 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {/* LISTA DE PAÍSES (ACORDEÃO) */}
        <div className="space-y-2">
          {paisesFiltrados.length > 0 ? (
            paisesFiltrados.map((pais) => {
              const isAberto = paisAberto === pais.id;
              
              return (
                <div key={pais.id} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                  
                  {/* Botão do País */}
                  <button 
                    onClick={() => togglePais(pais.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pais.flag}</span>
                      <span className="text-white font-bold text-lg">{pais.name}</span>
                      <span className="text-xs text-slate-400 border border-slate-600 px-2 py-0.5 rounded-full">{pais.code}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className={`transform transition-transform ${isAberto ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Lista de Serviços (Abre quando o país é clicado) */}
                  {isAberto && (
                    <div className="bg-slate-900 border-t border-slate-700">
                      {services.map((servico) => {
                        const precoInfo = getPrice(servico.id, pais.id);
                        
                        // Se este serviço específico não tiver preço para este país, não mostra
                        if (!precoInfo) return null; 

                        return (
                          <div key={servico.id} className="flex items-center justify-between p-4 border-b border-slate-800 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center p-1">
                                <img 
                                  src={servico.logo} 
                                  alt={servico.name} 
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    // Fallback caso o logo não exista
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = `<span class="font-bold text-slate-400">${servico.name.charAt(0)}</span>`;
                                  }}
                                />
                              </div>
                              <div>
                                <h4 className="text-white font-semibold">{servico.name}</h4>
                                <p className="text-slate-500 text-xs">Disponíveis: {precoInfo.available}</p>
                              </div>
                            </div>
                            
                            <div className="text-right flex items-center gap-4">
                              <span className="text-yellow-400 font-bold whitespace-nowrap">
                                {precoInfo.price} {pais.currencySymbol}
                              </span>
                              <button 
                                onClick={() => handleObterNumero(servico, pais.id)}
                                disabled={aProcessar === servico.id}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                              >
                                {aProcessar === servico.id ? '...' : 'OBTER'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Mensagem se não houver serviços no país */}
                      {services.filter(s => getPrice(s.id, pais.id)).length === 0 && (
                        <div className="p-4 text-center text-slate-500 text-sm">
                          Nenhum serviço disponível para este país no momento.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-400">Nenhum país encontrado com "{pesquisa}".</p>
            </div>
          )}
        </div>
      </div>

      {/* Navegação Inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around py-3 px-4 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors">
          <span className="text-xl">🏠</span><span className="text-xs font-medium mt-1">Início</span>
        </Link>
        <Link href="/servicos" className="flex flex-col items-center text-blue-500">
          <span className="text-xl">🌐</span><span className="text-xs font-medium mt-1">Serviços</span>
        </Link>
        <Link href="/saldo" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors">
          <span className="text-xl">💰</span><span className="text-xs font-medium mt-1">Saldo</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors">
          <span className="text-xl">👤</span><span className="text-xs font-medium mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  );
}