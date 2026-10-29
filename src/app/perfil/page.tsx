/* eslint-disable @next/next/no-img-element */
// src/app/perfil/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [currency, setCurrency] = useState('MZN');
  const [email, setEmail] = useState('');
  const [displayId, setDisplayId] = useState('');

  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [novaPassword, setNovaPassword] = useState('');

  useEffect(() => {
    const carregarPerfil = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setEmail(session.user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('nome_completo, telefone, currency, display_id')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setNome(profile.nome_completo || '');
        setTelefone(profile.telefone || '');
        setCurrency(profile.currency || 'MZN');
        setDisplayId(profile.display_id || '');
      }
      setLoading(false);
    };

    carregarPerfil();
  }, [router]);

  const handleGuardarDados = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const toastId = toast.loading('A guardar alterações...');

    const { error } = await supabase
      .from('profiles')
      .update({ nome_completo: nome, telefone, currency })
      .eq('id', session.user.id);

    if (error) {
      toast.error('Erro ao guardar dados.', { id: toastId });
    } else {
      toast.success('Perfil atualizado com sucesso!', { id: toastId });
      setIsEditing(false);
    }
  };

  const handleAlterarPassword = async () => {
    if (novaPassword.length < 6) {
      toast.error('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    const toastId = toast.loading('A alterar palavra-passe...');

    const { error } = await supabase.auth.updateUser({ password: novaPassword });

    if (error) {
      toast.error(`Erro: ${error.message}`, { id: toastId });
    } else {
      toast.success('Palavra-passe alterada com sucesso!', { id: toastId });
      setNovaPassword('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-purple-600 font-medium animate-pulse">A carregar o perfil...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen bg-slate-50 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
      </div>

      {/* Cartão do Utilizador */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-3xl font-bold text-purple-700 mb-4">
          {nome.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{nome}</h2>
        <p className="text-gray-500 text-sm">{email}</p>
        <p className="text-gray-400 text-xs font-mono mt-1">ID: {displayId}</p>
      </div>

      {/* Formulário de Edição */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">Dados Pessoais</h3>
          <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-bold text-purple-600">
            {isEditing ? 'Cancelar' : 'Editar'}
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} disabled={!isEditing} className={`w-full p-3 rounded-lg border ${isEditing ? 'border-purple-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-500'}`} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
            <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} disabled={!isEditing} className={`w-full p-3 rounded-lg border ${isEditing ? 'border-purple-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-500'}`} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Moeda Preferida</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={!isEditing} className={`w-full p-3 rounded-lg border ${isEditing ? 'border-purple-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
              <option value="MZN">Metical Moçambicano (MT)</option>
              <option value="BRL">Real Brasileiro (R$)</option>
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dólar Americano ($)</option>
              <option value="ZAR">Rand Sul-Africano (R)</option>
            </select>
          </div>
          
          {isEditing && (
            <button onClick={handleGuardarDados} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
              Guardar Alterações
            </button>
          )}
        </div>
      </div>

      {/* Segurança */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-700">Segurança</h3>
        </div>
        <div className="p-4">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nova Palavra-passe</label>
          <div className="flex gap-2">
            <input type="password" value={novaPassword} onChange={(e) => setNovaPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none" />
            <button onClick={handleAlterarPassword} className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 rounded-lg transition-colors">
              Alterar
            </button>
          </div>
        </div>
      </div>

      {/* Outros Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {[
          { nome: 'Histórico de Transações', icone: '💰', href: '/historico' },
          { nome: 'Meus Pedidos', icone: '📋', href: '/pedidos' },
          { nome: 'Termos de Uso', icone: '📜', href: '/informacoes' },
        ].map((item, index) => (
          <Link key={index} href={item.href} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icone}</span>
              <span className="font-medium text-gray-700">{item.nome}</span>
            </div>
            <span className="text-gray-400">›</span>
          </Link>
        ))}
      </div>

      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-red-700 font-bold">
        <span className="text-xl">🚪</span> Sair da Conta
      </button>

    </div>
  );
}