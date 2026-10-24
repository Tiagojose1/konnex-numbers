// src/app/apoio/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ApoioPage() {
  const [faqAberto, setFaqAberto] = useState<number | null>(null);

  const faqs = [
    { pergunta: 'Como funciona o reembolso?', resposta: 'Se o SMS não chegar em 10 minutos, o valor é devolvido automaticamente ao seu saldo.' },
    { pergunta: 'Quais os métodos de pagamento?', resposta: 'Aceitamos M-Pesa, e-Mola, Cartão de Crédito e Transferência Bancária.' },
    { pergunta: 'O que é um número virtual?', resposta: 'É um número temporário que recebe SMS, sem precisar de um chip físico.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Cabeçalho */}
      <header className="bg-white px-6 py-5 border-b border-slate-200 sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-slate-900">Apoio</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        
        {/* ===== CHAT DA BETE (Movido do Dashboard) ===== */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
          <div className="relative z-10 w-2/3">
            <h4 className="text-lg font-extrabold text-slate-900">Iniciar Chat Integrado</h4>
            <p className="text-xs text-slate-500 mb-3 mt-1">Assistente virtual inteligente: Bete, respeitosa, inteligente e amigável.</p>
            <button 
              onClick={() => alert('O chat da Bete estará disponível em breve!')}
              className="inline-block bg-[#0f172a] text-white text-xs font-bold py-2 px-4 rounded-lg"
            >
              Suporte via WhatsApp
            </button>
          </div>
          <div className="absolute right-2 bottom-2 text-6xl">🤖</div>
        </div>

        {/* Contacto de Apoio */}
        <h2 className="text-lg font-bold text-slate-900 mb-4">Contacto de apoio ao cliente</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <button className="w-full flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50">
            <div className="flex items-center gap-4">
              <span className="text-2xl">📩</span>
              <div className="text-left">
                <span className="block font-bold text-slate-800">Caixa de entrada</span>
                <span className="block text-xs text-slate-500">Verificar as suas mensagens</span>
              </div>
            </div>
            <span className="text-slate-400">›</span>
          </button>
        </div>

        {/* ===== FAQ (Movido do Dashboard) ===== */}
        <h2 className="text-lg font-bold text-slate-900 mb-4">Perguntas mais frequentes</h2>
        
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Pesquisar" 
            className="w-full bg-slate-200/50 text-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-slate-100 last:border-0">
              <button 
                onClick={() => setFaqAberto(faqAberto === index ? null : index)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 text-left"
              >
                <span className="font-bold text-slate-800 text-sm">{faq.pergunta}</span>
                <span className={`text-slate-400 transform transition-transform ${faqAberto === index ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {faqAberto === index && (
                <div className="px-5 pb-5 text-sm text-slate-600 bg-slate-50/50">
                  {faq.resposta}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Navegação Inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 px-2 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-slate-400 hover:text-[#0f172a] transition-colors p-2">
          <span className="text-xl">🏠</span><span className="text-[10px] font-medium mt-1">Início</span>
        </Link>
        <Link href="/servicos" className="flex flex-col items-center text-slate-400 hover:text-[#0f172a] transition-colors p-2">
          <span className="text-xl">🌐</span><span className="text-[10px] font-medium mt-1">Serviços</span>
        </Link>
        <Link href="/saldo" className="flex flex-col items-center text-slate-400 hover:text-[#0f172a] transition-colors p-2">
          <span className="text-xl">💰</span><span className="text-[10px] font-medium mt-1">Saldo</span>
        </Link>
        <Link href="/apoio" className="flex flex-col items-center text-blue-600 p-2">
          <span className="text-xl">🎧</span><span className="text-[10px] font-bold mt-1">Apoio</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center text-slate-400 hover:text-[#0f172a] transition-colors p-2">
          <span className="text-xl">👤</span><span className="text-[10px] font-medium mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  );
}