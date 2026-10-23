// src/app/apoio/page.tsx
'use client';

import Link from 'next/link';

export default function ApoioPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Cabeçalho */}
      <header className="bg-white px-6 py-5 border-b border-slate-200 sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-slate-900">Apoio</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        
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

        {/* FAQ */}
        <h2 className="text-lg font-bold text-slate-900 mb-4">Perguntas mais frequentes</h2>
        
        {/* Barra de Pesquisa */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Pesquisar" 
            className="w-full bg-slate-200/50 text-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Categorias de FAQ */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {[
            { icon: '👤', title: 'Conta', desc: '2 Perguntas frequentes' },
            { icon: '💳', title: 'Equilíbrio', desc: '4 Perguntas frequentes' },
            { icon: '📡', title: 'Serviços', desc: '12 Perguntas frequentes' },
          ].map((item, index) => (
            <div key={index} className="border-b border-slate-100 last:border-0 p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
              <span className="text-blue-600 text-sm font-medium">Ver mais ⌄</span>
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