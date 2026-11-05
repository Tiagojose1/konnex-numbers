/* eslint-disable @next/next/no-img-element */
// src/app/saldo/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatarMoeda, CURRENCY_SYMBOLS, RATES, setRates } from '@/lib/currencies'; 

const gerarOpcoesDeposito = (moeda: string) => {
  const taxa = RATES[moeda] || 1;
  let valoresLocais = [];

  switch (moeda) {
    case 'MZN': valoresLocais = [210, 250, 300, 350, 400, 500]; break;
    case 'AOA': valoresLocais = [1000, 2000, 3000, 5000, 10000, 20000]; break;
    case 'BRL': valoresLocais = [10, 20, 30, 50, 100, 200]; break;
    case 'EUR': valoresLocais = [5, 10, 15, 20, 30, 50]; break;
    case 'ZAR': valoresLocais = [50, 100, 200, 300, 500, 1000]; break;
    default:    valoresLocais = [3, 5, 10, 15, 20, 50]; break;
  }

  return valoresLocais.map(valor => ({
    label: valor.toString(),
    localAmount: valor,
    usdAmount: valor / taxa
  }));
};

export default function AdicionarSaldoPage() {
  const router = useRouter();
  
  const [opcoesDeposito, setOpcoesDeposito] = useState<any[]>([]);
  const [valorUSD, setValorUSD] = useState<number>(0);
  const [metodo, setMetodo] = useState<string>('');
  const [mensagem, setMensagem] = useState<string>('');
  const [aProcessar, setAProcessar] = useState(false);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [currency, setCurrency] = useState('MZN');
  const [depositoConfirmado, setDepositoConfirmado] = useState<number | null>(null);
  
  const [telefone, setTelefone] = useState('');
  const [referenciaGerada, setReferenciaGerada] = useState('');
  const [pixGerado, setPixGerado] = useState('');
  
  const [numeroCartao, setNumeroCartao] = useState('');
  const [bandeiraCartao, setBandeiraCartao] = useState<string | null>(null);

  const metodoNormalizado = metodo.trim().toLowerCase();

  // 🆕 1. Carrega o câmbio real da internet antes de mostrar a página
  useEffect(() => {
    const carregarCambio = async () => {
      try {
        const res = await fetch('/api/cambio');
        const taxasReais = await res.json();
        setRates(taxasReais); 
      } catch (error) {
        console.error('Erro ao carregar câmbio, a usar valores de segurança.');
      }
    };
    carregarCambio();
  }, []);

  useEffect(() => {
    const carregarSaldo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('saldo, currency').eq('id', session.user.id).single();
      if (profile) {
        const moeda = profile.currency || 'MZN';
        setSaldoAtual(parseFloat(profile.saldo) || 0);
        setCurrency(moeda);
        
        const opcoes = gerarOpcoesDeposito(moeda);
        setOpcoesDeposito(opcoes);
        setValorUSD(opcoes[0].usdAmount);
      }
    };
    carregarSaldo();
  }, [router]);

  const handleCartaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '').slice(0, 16);
    setNumeroCartao(valor.replace(/(\d{4})(?=\d)/g, '$1 '));
    if (valor.startsWith('4')) setBandeiraCartao('Visa');
    else if (valor.startsWith('5') || valor.startsWith('2')) setBandeiraCartao('Mastercard');
    else if (valor.startsWith('34') || valor.startsWith('37')) setBandeiraCartao('American Express');
    else if (valor.startsWith('6')) setBandeiraCartao('Discover');
    else setBandeiraCartao(null);
  };

  const handlePagamento = async () => {
    if (!metodo) return setMensagem('Por favor, selecione um método de pagamento.');
    
    const isMpesa = metodoNormalizado.includes('m-pesa');
    const isEmola = metodoNormalizado.includes('e-mola');
    const isCartao = metodoNormalizado.includes('cartão');
    const isTransferencia = metodoNormalizado.includes('transferência');
    const isPix = metodoNormalizado.includes('pix');

    if ((isMpesa || isEmola) && !telefone) return setMensagem('Por favor, insira o número de telefone.');
    if (isCartao && numeroCartao.replace(/\s/g, '').length < 16) return setMensagem('Insira um número de cartão válido (16 dígitos).');
    
    if (isTransferencia) {
      const ref = Math.floor(100000000 + Math.random() * 900000000).toString();
      setReferenciaGerada(ref);
      setMensagem('Por favor, pague a referência gerada abaixo no seu banco.');
      return;
    }

    if (isPix) {
      setPixGerado(`00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 15)}520400005303986540${(valorUSD * (RATES[currency] || 1)).toFixed(2)}5802BR5913KonnexNumbers6009SAO PAULO62070503***6304ABCD`);
      setMensagem('Pix gerado! Escaneie o QR Code ou copie o código abaixo.');
      return;
    }

    setAProcessar(true);
    setMensagem('A processar pagamento...');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMensagem('Sessão expirada. Faça login novamente.');
      setAProcessar(false);
      return;
    }

    try {
      const resposta = await fetch('/api/adicionar-saldo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session.user.id, 
          valor: valorUSD,
          metodo: metodo,
          telefone: telefone,
          currency: currency 
        }),
      });
      
      const dados = await resposta.json();
      
      if (dados.error) {
        setMensagem(`Erro: ${dados.error}`);
      } else {
        if (isMpesa || isEmola) {
          setMensagem(dados.mensagem);
        } else {
          setMensagem('');
          setDepositoConfirmado(valorUSD * (RATES[currency] || 1)); 
        }
      }
    } catch (error) {
      setMensagem('Erro de comunicação. Tente novamente.');
    }
    setAProcessar(false);
  };

  if (depositoConfirmado !== null) {
    const simbolo = CURRENCY_SYMBOLS[currency] || currency;
    return (
      <div className="fixed inset-0 bg-[#0b1120] z-[100] flex flex-col font-sans">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h1 className="text-white font-bold text-lg">Depositar</h1>
          <button onClick={() => { setDepositoConfirmado(null); router.push('/dashboard'); }} className="text-slate-400 hover:text-white text-2xl">✕</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-28 h-28 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
            <span className="text-white text-6xl font-bold">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Depósito confirmado</h1>
          <p className="text-slate-400 text-lg mb-2">Montante do depósito:</p>
          <p className="text-4xl font-extrabold text-white mb-12">
            {depositoConfirmado.toLocaleString('pt-PT')} {simbolo}
          </p>
          <button onClick={() => { setDepositoConfirmado(null); router.push('/dashboard'); }} className="w-full max-w-sm bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg">
            Continuar
          </button>
        </div>
      </div>
    );
  }

  const simbolo = CURRENCY_SYMBOLS[currency] || currency;
  const taxa = RATES[currency] || 1;

  // 🆕 Filtra os métodos de pagamento com base no país
  const metodosPagamento = [
    ...(currency === 'MZN' ? [
      { id: 'M-Pesa', icone: '/m-pesa.png' },
      { id: 'e-Mola', icone: '/e-mola.png' },
    ] : []),
    { id: 'Cartão de Crédito', icone: '/cartao-de-credito.webp' },
    ...(currency === 'BRL' ? [
      { id: 'Pix', icone: 'https://cdn-icons-png.flaticon.com/512/10326/10326154.png' }
    ] : []),
    { id: 'Transferência', icone: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' }
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Adicionar Saldo</h1>
        <p className="text-gray-500 text-sm">Escolha o valor e o método de pagamento.</p>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl p-3 text-white shadow-md mb-4">
        <p className="text-purple-100 text-[10px] uppercase font-bold tracking-wider">Saldo Disponível</p>
        <h2 className="text-2xl font-bold">{formatarMoeda(saldoAtual, currency)}</h2>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Escolha o valor</label>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {opcoesDeposito.map((v) => (
            <button
              key={v.label}
              onClick={() => setValorUSD(v.usdAmount)}
              className={`py-2 rounded-lg border transition-all flex flex-col items-center justify-center ${
                valorUSD === v.usdAmount ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
              }`}
            >
              <span className="text-sm font-bold">{simbolo} {v.localAmount}</span>
              <span className={`text-[10px] mt-0.5 ${valorUSD === v.usdAmount ? 'text-purple-200' : 'text-gray-500'}`}>
                ≈ $ {v.usdAmount.toFixed(2)}
              </span>
            </button>
          ))}
        </div>

        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Método de Pagamento</label>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {metodosPagamento.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMetodo(m.id); setMensagem(''); setReferenciaGerada(''); setPixGerado(''); }}
              className={`py-2 px-3 rounded-lg border flex items-center gap-2 transition-all ${
                metodoNormalizado === m.id.toLowerCase() ? 'bg-purple-50 border-purple-600 ring-1 ring-purple-600' : 'bg-white border-gray-300 hover:border-purple-400'
              }`}
            >
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center overflow-hidden p-1">
                <img src={m.icone} alt={m.id} className="w-full h-full object-contain" />
              </div>
              <span className={`text-sm font-semibold ${metodoNormalizado === m.id.toLowerCase() ? 'text-purple-700' : 'text-gray-700'}`}>
                {m.id}
              </span>
            </button>
          ))}
        </div>

        {(metodoNormalizado.includes('m-pesa') || metodoNormalizado.includes('e-mola')) && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Número de Telefone</label>
            <input type="tel" placeholder="Ex: 84XXXXXXX" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-sm" />
          </div>
        )}

        {metodoNormalizado.includes('cartão') && (
          <div className="mb-4 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] text-gray-500 font-bold">🔒 Ambiente seguro.</p>
              {bandeiraCartao && <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">{bandeiraCartao}</span>}
            </div>
            <div className="relative">
              <input type="text" placeholder="0000 0000 0000 0000" value={numeroCartao} onChange={handleCartaoChange} maxLength={19} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm pr-10" />
              {bandeiraCartao && <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{bandeiraCartao === 'Visa' ? 'VISA' : bandeiraCartao === 'Mastercard' ? 'MC' : '✓'}</div>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="MM/AA" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
              <input type="text" placeholder="CVV" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <input type="text" placeholder="Nome no Cartão" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
        )}

        {metodoNormalizado.includes('transferência') && referenciaGerada && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-800 text-sm mb-1">Dados para Pagamento</h3>
            <p className="text-xs text-blue-700 mb-1">Entidade: <span className="font-mono font-bold">00123</span></p>
            <p className="text-xs text-blue-700 mb-1">Referência: <span className="font-mono font-bold text-base">{referenciaGerada}</span></p>
            <p className="text-xs text-blue-700 mb-1">Valor: <span className="font-bold">{simbolo} {(valorUSD * taxa).toFixed(2)}</span></p>
            <p className="text-[10px] text-blue-600 mt-1">Após pagar, clique em "JÁ PAGUEI".</p>
          </div>
        )}

        {metodoNormalizado.includes('pix') && pixGerado && (
          <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-lg text-center flex flex-col items-center">
            <h3 className="font-bold text-teal-800 text-sm mb-2">Pague com Pix</h3>
            <div className="w-32 h-32 bg-white p-1 rounded-lg border border-teal-200 mb-2 flex items-center justify-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=KonnexPix" alt="QR Code Pix" className="w-full h-full" />
            </div>
            <p className="text-xs text-teal-700 mb-2">Ou use o Pix Copia e Cola:</p>
            <div className="bg-white p-2 rounded border border-teal-200 w-full break-all text-[10px] text-gray-600 mb-2 font-mono">
              {pixGerado}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(pixGerado); alert('Código Pix copiado!'); }} className="bg-teal-600 text-white text-xs px-4 py-1.5 rounded hover:bg-teal-700">Copiar Código</button>
          </div>
        )}

        <button onClick={handlePagamento} disabled={aProcessar} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-lg transition-colors shadow-md disabled:opacity-50 text-sm">
          {aProcessar ? 'A processar...' : (metodoNormalizado.includes('transferência') && referenciaGerada ? 'JÁ PAGUEI' : metodoNormalizado.includes('pix') && pixGerado ? 'JÁ PAGUEI O PIX' : 'CONFIRMAR PAGAMENTO')}
        </button>

        {mensagem && (
          <div className={`mt-3 p-3 rounded-lg text-center text-xs font-medium border ${mensagem.includes('Erro') || mensagem.includes('Por favor') ? 'bg-red-50 text-red-800 border-red-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
            {mensagem}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-4 shadow-lg md:hidden z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"><span className="text-lg">🏠</span><span className="text-[10px] font-medium mt-1">Início</span></Link>
        <Link href="/servicos" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"><span className="text-lg">🌐</span><span className="text-[10px] font-medium mt-1">Serviços</span></Link>
        <Link href="/saldo" className="flex flex-col items-center text-purple-600"><span className="text-lg">💰</span><span className="text-[10px] font-bold mt-1">Saldo</span></Link>
        <Link href="/perfil" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"><span className="text-lg">👤</span><span className="text-[10px] font-medium mt-1">Perfil</span></Link>
      </div>
    </div>
  );
}