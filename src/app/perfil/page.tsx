// src/app/perfil/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [displayId, setDisplayId] = useState('');

  useEffect(() => {
    const carregarPerfil = async () => {
      // 1. Verificar se está logado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 2. Buscar o nome e o display_id na tabela 'profiles'
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('nome_completo, display_id')
        .eq('id', session.user.id)
        .single();

      if (!error && profile) {
        setNome(profile.nome_completo || 'Utilizador');
        // Se por algum motivo não tiver display_id, usa os primeiros 6 caracteres do ID real
        setDisplayId(profile.display_id || `L${session.user.id.substring(0, 6)}`);
      }
      setLoading(false);
    };

    carregarPerfil();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-purple-600 font-medium animate-pulse">A carregar o perfil...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
      </div>

      {/* Cartão do Utilizador (Apenas Nome e ID de Exibição) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-700">
          {nome.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{nome}</h2>
          <p className="text-gray-500 text-sm font-mono mt-1">
            ID: <span className="font-bold text-purple-700">{displayId}</span>
          </p>
        </div>
      </div>

      {/* Menu de Opções */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {[
          { nome: 'Histórico de Transações', icone: '💰', href: '/historico' },
          { nome: 'Meus Pedidos', icone: '📋', href: '/pedidos' },
          { nome: 'Segurança', icone: '🔒', href: '/em-breve' },
          { nome: 'Alterar Palavra-passe', icone: '🔑', href: '/em-breve' },
          { nome: 'Notificações', icone: '🔔', href: '/em-breve' },
          { nome: 'Termos de Uso', icone: '📜', href: '/em-breve' },
          { nome: 'Privacidade', icone: '🛡️', href: '/em-breve' },
        ].map((item, index) => (
          <Link key={index} href={item.href} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icone}</span>
              <span className="font-medium text-gray-700">{item.nome}</span>
            </div>
            <span className="text-gray-400">›</span>
          </Link>
        ))}
        
        {/* Botão de Sair */}
        <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 border-t border-gray-200 bg-red-50 hover:bg-red-100 transition-colors text-left">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚪</span>
            <span className="font-medium text-red-700">Sair da Conta</span>
          </div>
        </button>
      </div>
    </div>
  );
}