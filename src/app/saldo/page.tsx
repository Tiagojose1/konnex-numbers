// src/app/saldo/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatarMoeda, CURRENCY_SYMBOLS, converterParaMZN } from '@/lib/currencies';

export default function AdicionarSaldoPage() {
  const router = useRouter();
  const [valor, setValor] = useState<number>(10);
  const [metodo, setMetodo] = useState<string>('');
  const [mensagem, setMensagem] = useState<string>('');
  const [aProcessar, setAProcessar] = useState(false);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [currency, setCurrency] = useState('MZN');
  const [depositoConfirmado, setDepositoConfirmado] = useState<number | null>(null);
  
  const [telefone, setTelefone] = useState('');
  const [referenciaGerada, setReferenciaGerada] = useState('');

  useEffect(() => {
    const carregarSaldo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('saldo, currency')
        .eq('id', session.user.id)
        .single();
      if (profile) {
        setSaldoAtual(parseFloat(profile.saldo) || 0);
        setCurrency(profile.currency || 'MZN');
      }
    };
    carregarSaldo();
  }, [router]);

  const handlePagamento = async () => {
    if (!metodo) {
      setMensagem('Por favor, selecione um método de pagamento.');
      return;
    }
    if ((metodo === 'M-Pesa' || metodo === 'e-Mola') && !telefone) {
      setMensagem('Por favor, insira o número de telefone para o ' + metodo);
      return;
    }
    if (metodo === 'Transferência') {
      const ref = Math.floor(100000000 + Math.random() * 900000000).toString();
      setReferenciaGerada(ref);
      setMensagem('Por favor, pague a referência gerada abaixo no seu banco.');
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

    const valorEmMZN = converterParaMZN(valor, currency);

    try {
      const resposta = await fetch('/api/adicionar-saldo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session.user.id, 
          valor: valorEmMZN, 
          metodo: metodo,
          telefone: telefone // <-- ESTA LINHA ESTAVA EM FALTA!
        }),
      });
      
      const dados = await resposta.json();
      
      if (dados.error) {
        setMensagem(`Erro: ${dados.error}`);
      } else {
        // Se for M-Pesa ou e-Mola, avisamos para ir ao telemóvel
        if (metodo === 'M-Pesa' || metodo === 'e-Mola') {
          setMensagem(dados.mensagem); // Ex: "Pedido enviado! Verifique o seu telemóvel e insira o PIN."
          // NÃO mostramos o ecrã verde ainda. O dinheiro só entra depois do PIN.
        } else {
          // Se for Cartão de Crédito (que ainda é simulação)
          setMensagem('');
          setDepositoConfirmado(valor);
        }
      }
    } catch (error) {
      setMensagem('Erro de comunicação. Tente novamente.');
    }
    setAProcessar(false);
  };

  // ===== TELA DE CONFIRMAÇÃO DE DEPÓSITO =====
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
            {depositoConfirmado.toFixed(2)} {simbolo}
          </p>
          <button
            onClick={() => { setDepositoConfirmado(null); router.push('/dashboard'); }}
            className="w-full max-w-sm bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // ===== FORMULÁRIO NORMAL =====
  const simbolo = CURRENCY_SYMBOLS[currency] || currency;
  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Adicionar Saldo</h1>
        <p className="text-gray-500">Escolha o valor e o método de pagamento.</p>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-4 text-white shadow-lg mb-6">
        <p className="text-purple-100 text-xs font-medium">Saldo Atual</p>
        <h2 className="text-3xl font-bold">{formatarMoeda(saldoAtual, currency)}</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Escolha o valor ({simbolo})</label>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[10, 20, 50, 100, 200].map((v) => (
            <button
              key={v}
              onClick={() => setValor(v)}
              className={`py-3 rounded-lg border font-semibold transition-all ${
                valor === v ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
              }`}
            >
              {v},00
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pagamento</label>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {['M-Pesa', 'e-Mola', 'Cartão de Crédito', 'Transferência'].map((m) => (
            <button
              key={m}
              onClick={() => { setMetodo(m); setMensagem(''); setReferenciaGerada(''); }}
              className={`py-3 rounded-lg border font-semibold transition-all ${
                metodo === m ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {(metodo === 'M-Pesa' || metodo === 'e-Mola') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Número de Telefone</label>
            <input type="tel" placeholder="Ex: 84XXXXXXX" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none" />
          </div>
        )}

        {metodo === 'Cartão de Crédito' && (
          <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">🔒 Ambiente seguro. Os dados não são guardados.</p>
            <input type="text" placeholder="Número do Cartão" className="w-full p-3 border border-gray-300 rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="MM/AA" className="w-full p-3 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="CVV" className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
            <input type="text" placeholder="Nome no Cartão" className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>
        )}

        {metodo === 'Transferência' && referenciaGerada && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">Dados para Pagamento</h3>
            <p className="text-sm text-blue-700 mb-1">Entidade: <span className="font-mono font-bold">00123</span></p>
            <p className="text-sm text-blue-700 mb-1">Referência: <span className="font-mono font-bold text-lg">{referenciaGerada}</span></p>
            <p className="text-sm text-blue-700 mb-1">Valor: <span className="font-bold">{valor},00 {simbolo}</span></p>
            <p className="text-xs text-blue-600 mt-2">Após efetuar o pagamento, clique em "JÁ PAGUEI".</p>
          </div>
        )}

        <button onClick={handlePagamento} disabled={aProcessar} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg transition-colors shadow-md disabled:opacity-50">
          {aProcessar ? 'A processar...' : (metodo === 'Transferência' && referenciaGerada ? 'JÁ PAGUEI' : 'CONFIRMAR PAGAMENTO')}
        </button>

        {mensagem && (
          <div className={`mt-4 p-4 rounded-lg text-center font-medium border ${mensagem.includes('Erro') || mensagem.includes('Por favor') ? 'bg-red-50 text-red-800 border-red-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
            {mensagem}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-4 shadow-lg md:hidden">
        <Link href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"><span className="text-xl">🏠</span><span className="text-xs font-medium mt-1">Início</span></Link>
        <Link href="/servicos" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"><span className="text-xl">🌐</span><span className="text-xs font-medium mt-1">Serviços</span></Link>
        <Link href="/saldo" className="flex flex-col items-center text-purple-600"><span className="text-xl">💰</span><span className="text-xs font-medium mt-1">Saldo</span></Link>
        <Link href="/perfil" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"><span className="text-xl">👤</span><span className="text-xs font-medium mt-1">Perfil</span></Link>
      </div>
    </div>
  );
}