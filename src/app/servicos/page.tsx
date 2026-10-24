/* eslint-disable @next/next/no-img-element */
// src/app/servicos/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { converterParaMZN } from '@/lib/currencies';
import { countries, getCountry, Country } from '@/data/countries';
import { services, Service } from '@/data/services';
import { getPrice } from '@/data/pricesByCountry';

export default function ServicosPage() {
  const router = useRouter();
  
  const [paisAberto, setPaisAberto] = useState<string | null>('mz'); 
  const [pesquisa, setPesquisa] = useState('');
  const [aProcessar, setAProcessar] = useState<string | null>(null);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState<Service | null>(null);
  const [paisSelecionadoParaCompra, setPaisSelecionadoParaCompra] = useState<Country | null>(null);

  const togglePais = (paisId: string) => {
    setPaisAberto(paisAberto === paisId ? null : paisId);
  };

  const abrirModalCompra = (servico: Service, paisId: string) => {
    const paisInfo = getCountry(paisId);
    if (!paisInfo) return;
    setServicoSelecionado(servico);
    setPaisSelecionadoParaCompra(paisInfo);
    setModalAberto(true);
  };

  const efetuarCompra = async (isCustom: boolean) => {
    if (!servicoSelecionado || !paisSelecionadoParaCompra) return;
    setModalAberto(false);
    setAProcessar(servicoSelecionado.id);

    const variant = isCustom ? 'custom' : 'random';
    const precoInfo = getPrice(servicoSelecionado.id, paisSelecionadoParaCompra.id, variant);
    
    if (!precoInfo) {
        alert("Erro ao obter preço para este serviço.");
        setAProcessar(null);
        return;
    }

    if (precoInfo.available === 0 && precoInfo.isDefault && !isCustom) {
      alert("Serviço sem stock confirmado no momento.");
      setAProcessar(null);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert("Sessão expirada. Faça login novamente.");
        setAProcessar(null);
        return;
    }

    const valorEmMZN = converterParaMZN(precoInfo.price || 0, paisSelecionadoParaCompra.currency);

    const resposta = await fetch('/api/comprar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session.user.id,
        servico: servicoSelecionado.name,
        pais: paisSelecionadoParaCompra.name,
        preco: valorEmMZN,
        isCustom: isCustom 
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

  // 🆕 Função para remover acentos e facilitar a pesquisa (ex: "Mexico" encontra "México")
  const normalizeText = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const paisesFiltrados = countries.filter(c => 
    normalizeText(c.name).includes(normalizeText(pesquisa)) || 
    c.code.includes(pesquisa)
  );

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Escolha o Serviço</h1>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-2xl">&times;</Link>
        </div>

        <div className="max-w-2xl mx-auto relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text"
            placeholder="Pesquisar país... (ex: Mexico)"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg py-2 pl-10 pr-4 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-2">
          {paisesFiltrados.length > 0 ? (
            paisesFiltrados.map((pais) => {
              const isAberto = paisAberto === pais.id;
              
              const servicosLocais = services.filter(s => s.category === 'bank' && getPrice(s.id, pais.id));
              const servicosGlobais = services.filter(s => s.category !== 'bank' && getPrice(s.id, pais.id));

              return (
                <div key={pais.id} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
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
                      <span className={`transform transition-transform ${isAberto ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </button>

                  {isAberto && (
                    <div className="bg-slate-900 border-t border-slate-700">
                      
                      {servicosLocais.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serviços Locais</div>
                          {servicosLocais.map((servico) => {
                            const precoInfo = getPrice(servico.id, pais.id);
                            if (!precoInfo) return null;
                            return (
                              <div key={servico.id} className="flex items-center justify-between p-4 border-b border-slate-800 last:border-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center p-1">
                                    <img src={servico.logo} alt={servico.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<span class="font-bold text-slate-400">${servico.name.charAt(0)}</span>`; }} />
                                  </div>
                                  <div>
                                    <h4 className="text-white font-semibold">{servico.name}</h4>
                                    <p className="text-slate-500 text-xs">Disponíveis: {precoInfo.available}</p>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                  <span className="text-yellow-400 font-bold whitespace-nowrap">{precoInfo.price} {pais.currencySymbol}</span>
                                  <button onClick={() => abrirModalCompra(servico, pais.id)} disabled={aProcessar === servico.id} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
                                    {aProcessar === servico.id ? '...' : 'OBTER'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}

                      {servicosGlobais.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Serviços Globais</div>
                          {servicosGlobais.map((servico) => {
                            const precoInfo = getPrice(servico.id, pais.id);
                            if (!precoInfo) return null;
                            return (
                              <div key={servico.id} className="flex items-center justify-between p-4 border-b border-slate-800 last:border-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center p-1">
                                    <img src={servico.logo} alt={servico.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<span class="font-bold text-slate-400">${servico.name.charAt(0)}</span>`; }} />
                                  </div>
                                  <div>
                                    <h4 className="text-white font-semibold">{servico.name}</h4>
                                    <p className="text-slate-500 text-xs">Disponíveis: {precoInfo.available}</p>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                  <span className="text-yellow-400 font-bold whitespace-nowrap">{precoInfo.price} {pais.currencySymbol}</span>
                                  <button onClick={() => abrirModalCompra(servico, pais.id)} disabled={aProcessar === servico.id} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
                                    {aProcessar === servico.id ? '...' : 'OBTER'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}

                      {servicosLocais.length === 0 && servicosGlobais.length === 0 && (
                        <div className="p-4 text-center text-slate-500 text-sm">Nenhum serviço disponível.</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-400">Nenhum país encontrado com &quot;{pesquisa}&quot;.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL, NAVEGAÇÃO INFERIOR... (Mantém-se igual) */}
      {modalAberto && servicoSelecionado && paisSelecionadoParaCompra && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl p-6 border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white text-center mb-1">Como deseja o número?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">{servicoSelecionado.name} - {paisSelecionadoParaCompra.name}</p>
            
            <div className="space-y-3">
              <button onClick={() => efetuarCompra(false)} className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl flex justify-between items-center transition-colors border border-slate-600">
                <div className="text-left">
                  <span className="block font-bold">Número Normal</span>
                  <span className="text-xs text-slate-400">Gerado pelo sistema</span>
                </div>
                <span className="text-yellow-400 font-bold">{getPrice(servicoSelecionado.id, paisSelecionadoParaCompra.id, 'random')?.price} {paisSelecionadoParaCompra.currencySymbol}</span>
              </button>

              <button onClick={() => efetuarCompra(true)} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white p-4 rounded-xl flex justify-between items-center transition-colors shadow-lg border border-purple-500">
                <div className="text-left">
                  <span className="block font-bold">Número VIP</span>
                  <span className="text-xs text-purple-200">Escolha os dígitos finais</span>
                </div>
                <span className="text-yellow-300 font-bold">{getPrice(servicoSelecionado.id, paisSelecionadoParaCompra.id, 'custom')?.price} {paisSelecionadoParaCompra.currencySymbol}</span>
              </button>
            </div>

            <button onClick={() => setModalAberto(false)} className="w-full text-center text-slate-400 mt-6 text-sm hover:text-white">Cancelar</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around py-3 px-4 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors"><span className="text-xl">🏠</span><span className="text-xs font-medium mt-1">Início</span></Link>
        <Link href="/servicos" className="flex flex-col items-center text-blue-500"><span className="text-xl">🌐</span><span className="text-xs font-medium mt-1">Serviços</span></Link>
        <Link href="/saldo" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors"><span className="text-xl">💰</span><span className="text-xs font-medium mt-1">Saldo</span></Link>
        <Link href="/perfil" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors"><span className="text-xl">👤</span><span className="text-xs font-medium mt-1">Perfil</span></Link>
      </div>
    </div>
  );
}