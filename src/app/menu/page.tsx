// src/app/menu/page.tsx
'use client';

import Link from 'next/link';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] pb-24 text-white">
      
      {/* Cabeçalho */}
      <header className="flex justify-between items-center p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold">Menu</h1>
        <Link href="/dashboard" className="text-slate-400 text-2xl">&times;</Link>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        
        {/* Grid de Serviços (Estilo Foto 3) */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {[
            { label: 'Comprar Número', icon: '🛒' },
            { label: 'Meus Pedidos', icon: '📋' },
            { label: 'Personalizar', icon: '✏️' },
            { label: 'Histórico', icon: '🧾' },
            { label: 'Saldo', icon: '💰' },
            { label: 'Perfil', icon: '👤' },
            { label: 'Chamadas e SIM', icon: '🌍' },
            { label: 'Recompensas', icon: '🪙' },
            { label: 'Suporte VIP', icon: '🎧' },
          ].map((item, index) => (
            <Link 
              key={index} 
              href={item.label === 'Saldo' ? '/saldo' : item.label === 'Perfil' ? '/perfil' : '/servicos'}
              className="bg-[#1e293b] border border-slate-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-slate-800 transition-colors"
            >
              <span className="text-2xl mb-2">{item.icon}</span>
              <span className="text-[11px] font-bold text-yellow-400 text-center">{item.label}</span>
            </Link>
          ))}
        </div>

        <h3 className="text-center text-sm font-bold text-slate-400 mb-4">Links Rápidos</h3>

        {/* Links Rápidos (Estilo Foto 3) */}
        <div className="grid grid-cols-3 gap-2">
          <Link href="/saldo" className="bg-[#1e293b] border border-slate-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-slate-800 transition-colors">
            <span className="text-2xl mb-2">💵</span>
            <span className="text-[11px] font-bold text-yellow-400">Depositar</span>
          </Link>
          <Link href="/apoio" className="bg-[#1e293b] border border-slate-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-slate-800 transition-colors">
            <span className="text-2xl mb-2">❓</span>
            <span className="text-[11px] font-bold text-yellow-400">Ajuda</span>
          </Link>
          <Link href="/informacoes" className="bg-[#1e293b] border border-slate-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-slate-800 transition-colors">
            <span className="text-2xl mb-2">📄</span>
            <span className="text-[11px] font-bold text-yellow-400">Termos</span>
          </Link>
        </div>

      </div>

      {/* Navegação Inferior (Estilo Foto 3) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 flex justify-around py-2 px-2 z-50">
        <Link href="/menu" className="flex flex-col items-center text-yellow-400 p-2">
          <span className="text-xl">☰</span><span className="text-[10px] font-bold mt-1">Menu</span>
        </Link>
        <Link href="/servicos" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-2">
          <span className="text-xl">🔍</span><span className="text-[10px] font-medium mt-1">Procurar</span>
        </Link>
        <Link href="/pedidos" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-2">
          <span className="text-xl">📋</span><span className="text-[10px] font-medium mt-1">Pedidos</span>
        </Link>
        <Link href="/apoio" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-2">
          <span className="text-xl">🎧</span><span className="text-[10px] font-medium mt-1">Apoio</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-2">
          <span className="text-xl">👤</span><span className="text-[10px] font-medium mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  );
}