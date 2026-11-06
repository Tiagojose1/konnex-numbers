/* eslint-disable @next/next/no-img-element */
// src/app/perfil/editar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { countries } from '@/data/countries';

export default function EditarPerfilPage() {
  const router = useRouter();
  
  // Estados dos campos
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  const [paisResidencia, setPaisResidencia] = useState('Moçambique');
  
  const [loading, setLoading] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);

  // 1. Carregar os dados atuais assim que a página abre
  useEffect(() => {
    const carregarDados = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setEmail(session.user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('nome_completo, telefone, data_nascimento, genero, pais_residencia')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setNome(profile.nome_completo || '');
        setTelefone(profile.telefone !== 'N/A' ? profile.telefone : '');
        setDataNascimento(profile.data_nascimento || '');
        setGenero(profile.genero || '');
        setPaisResidencia(profile.pais_residencia || 'Moçambique');
      }
      setLoading(false);
    };

    carregarDados();
  }, [router]);

  // 2. Guardar os dados na base de dados
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setAGuardar(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Atualiza a tabela 'profiles' e verifica se houve erro
    const { error } = await supabase
      .from('profiles')
      .update({
        nome_completo: nome,
        telefone: telefone,
        data_nascimento: dataNascimento,
        genero: genero,
        pais_residencia: paisResidencia
      })
      .eq('id', session.user.id);

    if (error) {
      console.error(error);
      toast.error('Erro ao guardar: ' + error.message);
      setAGuardar(false);
    } else {
      toast.success('Dados atualizados com sucesso!');
      router.push('/perfil'); // Volta para a página principal do perfil
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <p className="text-blue-500 font-medium animate-pulse">A carregar dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24 font-sans text-white">
      
      {/* CABEÇALHO */}
      <header className="bg-[#0f172a] px-6 py-5 border-b border-slate-800 sticky top-0 z-50 flex items-center gap-4">
        <Link href="/perfil" className="text-slate-400 hover:text-white text-xl">
          &larr;
        </Link>
        <h1 className="text-xl font-bold text-white">Editar Dados</h1>
      </header>

      <div className="max-w-md mx-auto p-4">
        
        <form onSubmit={handleGuardar} className="space-y-4">
          
          <h2 className="text-lg font-bold text-white mt-4 mb-2">Dados Pessoais</h2>
          
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-yellow-500 uppercase mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-cyan-500" 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-yellow-500 uppercase mb-1">Data Nasc.</label>
                <input 
                  type="date" 
                  value={dataNascimento} 
                  onChange={(e) => setDataNascimento(e.target.value)} 
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-cyan-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-yellow-500 uppercase mb-1">Género</label>
                <select 
                  value={genero} 
                  onChange={(e) => setGenero(e.target.value)} 
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-cyan-500"
                >
                  <option value="" disabled>Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-yellow-500 uppercase mb-1">País de Residência</label>
              <select 
                value={paisResidencia} 
                onChange={(e) => setPaisResidencia(e.target.value)} 
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-cyan-500"
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-yellow-500 uppercase mb-1">Telefone</label>
              <input 
                type="tel" 
                value={telefone} 
                onChange={(e) => setTelefone(e.target.value)} 
                placeholder="Ex: 84XXXXXXX" 
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-cyan-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail (Não Editável)</label>
              <input 
                type="email" 
                value={email} 
                disabled 
                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-500 text-sm outline-none cursor-not-allowed" 
              />
            </div>

          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-2">Segurança</h2>
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <p className="text-sm text-slate-400 mb-2">Para alterar a palavra-passe, use a opção abaixo:</p>
              <Link href="/recuperar-senha" className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                Alterar Palavra-passe
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={aGuardar} 
            className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {aGuardar ? 'A Guardar...' : 'Guardar Alterações'}
          </button>

        </form>
      </div>
    </div>
  );
}