/* eslint-disable @next/next/no-img-element */
// src/app/perfil/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatarMoeda } from '@/lib/currencies';
import { toast } from 'sonner';

export default function PerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); 

  // Dados do Utilizador
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [saldo, setSaldo] = useState(0);
  const [currency, setCurrency] = useState('MZN');
  const [displayId, setDisplayId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // 🆕 Novos Dados Pessoais
  const [dataNascimento, setDataNascimento] = useState('');
  const [paisResidencia, setPaisResidencia] = useState('Moçambique');
  const [genero, setGenero] = useState('');

  // Estados de Edição
  const [uploading, setUploading] = useState(false);
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
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setNome(profile.nome_completo || '');
        setTelefone(profile.telefone || '');
        setCurrency(profile.currency || 'MZN');
        setDisplayId(profile.display_id || '');
        setSaldo(parseFloat(profile.saldo) || 0);
        setAvatarUrl(profile.avatar_url || null);
        
        // 🆕 Carregar os novos campos (Verificando se existem para não dar erro)
        setDataNascimento(profile.data_nascimento || '');
        setPaisResidencia(profile.pais_residencia || 'Moçambique');
        setGenero(profile.genero || '');
      }
      setLoading(false);
    };

    carregarPerfil();
  }, [router]);

  const handleUploadFoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', session.user.id);
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Foto atualizada com sucesso!');

    } catch (err: unknown) {
      console.error(err);
      toast.error('Erro ao fazer upload da foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleAtualizarPerfil = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const toastId = toast.loading('A atualizar o perfil...');

    // 1. Atualizar Dados Pessoais e Novos Campos
    const { error: errorDados } = await supabase
      .from('profiles')
      .update({ 
        nome_completo: nome, 
        telefone: telefone,
        data_nascimento: dataNascimento || null,
        pais_residencia: paisResidencia,
        genero: genero
      })
      .eq('id', session.user.id);

    if (errorDados) {
      toast.error('Erro ao guardar os dados.', { id: toastId });
      return;
    }

    // 2. Atualizar Palavra-passe (se o campo estiver preenchido)
    if (novaPassword.trim() !== '') {
      if (novaPassword.length < 6) {
        toast.error('A palavra-passe deve ter pelo menos 6 caracteres.', { id: toastId });
        return;
      }
      const { error: errorPass } = await supabase.auth.updateUser({ password: novaPassword });
      if (errorPass) {
        toast.error(`Erro na palavra-passe: ${errorPass.message}`, { id: toastId });
        return;
      }
      setNovaPassword(''); 
    }

    toast.success('Perfil atualizado com sucesso!', { id: toastId });
    setIsEditing(false); 
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">A carregar...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-24 font-sans text-white">
      
      {/* Cabeçalho Dinâmico */}
      <header className="bg-[#0f172a] sticky top-0 z-50 px-4 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          {isEditing && (
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white text-2xl">←</button>
          )}
          <h1 className="text-xl font-bold">{isEditing ? 'Editar Dados' : 'O Meu Perfil'}</h1>
        </div>
        {!isEditing && (
          <Link href="/dashboard" className="text-slate-400 text-2xl hover:text-white">&times;</Link>
        )}
      </header>

      <div className="max-w-2xl mx-auto p-4">
        
        {/* ========================================== */}
        {/* ECRÃ 1: VISÃO PRINCIPAL DO PERFIL          */}
        {/* ========================================== */}
        {!isEditing && (
          <>
            <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 mb-6 flex justify-between items-center shadow-lg">
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Saldo Disponível</p>
                <h2 className="text-3xl font-bold">{formatarMoeda(saldo, currency)}</h2>
              </div>
              <Link href="/saldo" className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-2 px-6 rounded-lg text-sm transition-colors shadow-md">
                Depositar
              </Link>
            </div>

            {/* Cartão de Informação (Na tela principal mostra apenas Nome, Telefone e ID) */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-6 mb-6 flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Perfil" className="w-20 h-20 rounded-full object-cover border-2 border-slate-600" />
                ) : (
                  <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-slate-600">
                    {nome.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold">{uploading ? '...' : '📷'}</span>
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUploadFoto} className="hidden" />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold">{nome}</h2>
                <p className="text-slate-400 text-sm mt-1">📞 {telefone}</p>
                <p className="text-slate-500 text-xs font-mono mt-1">ID: {displayId}</p>
              </div>
            </div>

            <div className="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden">
              <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-between p-4 border-b border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">👤</span>
                  <span className="font-medium">Dados Pessoais & Segurança</span>
                </div>
                <span className="text-slate-400">›</span>
              </button>

              <Link href="/historico" className="flex items-center justify-between p-4 border-b border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📊</span>
                  <span className="font-medium">Extratos</span>
                </div>
                <span className="text-slate-400">›</span>
              </Link>

              <Link href="/pedidos" className="flex items-center justify-between p-4 border-b border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <span className="font-medium">Meus Pedidos</span>
                </div>
                <span className="text-slate-400">›</span>
              </Link>

              <Link href="/apoio" className="w-full flex items-center justify-between p-4 hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">❓</span>
                  <span className="font-medium">Perguntas Frequentes</span>
                </div>
                <span className="text-slate-400">›</span>
              </Link>
            </div>
          </>
        )}

        {/* ========================================== */}
        {/* ECRÃ 2: FORMULÁRIO DE EDIÇÃO               */}
        {/* ========================================== */}
        {isEditing && (
          <div className="space-y-6">
            
            {/* Secção: Dados Pessoais */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-slate-200">Dados Pessoais</h2>
              <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-yellow-400 uppercase mb-2">Nome Completo</label>
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-3 bg-[#0f172a] text-white border border-slate-600 rounded-lg outline-none focus:border-yellow-400" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-yellow-400 uppercase mb-2">Data Nasc.</label>
                    <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="w-full p-3 bg-[#0f172a] text-white border border-slate-600 rounded-lg outline-none focus:border-yellow-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-yellow-400 uppercase mb-2">Género</label>
                    <select value={genero} onChange={(e) => setGenero(e.target.value)} className="w-full p-3 bg-[#0f172a] text-white border border-slate-600 rounded-lg outline-none focus:border-yellow-400">
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-yellow-400 uppercase mb-2">País de Residência</label>
                  <select value={paisResidencia} onChange={(e) => setPaisResidencia(e.target.value)} className="w-full p-3 bg-[#0f172a] text-white border border-slate-600 rounded-lg outline-none focus:border-yellow-400">
                    <option value="Moçambique">Moçambique</option>
                    <option value="Brasil">Brasil</option>
                    <option value="Portugal">Portugal</option>
                    <option value="África do Sul">África do Sul</option>
                    <option value="Angola">Angola</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Telefone</label>
                  <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full p-3 bg-[#0f172a] text-white border border-slate-600 rounded-lg outline-none focus:border-yellow-400" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">E-mail (Não editável)</label>
                  <input type="email" value={email} disabled className="w-full p-3 bg-[#0f172a]/50 text-slate-500 border border-slate-700 rounded-lg cursor-not-allowed" />
                </div>

              </div>
            </div>

            {/* Secção: Segurança */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-slate-200">Segurança</h2>
              <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
                <label className="block text-xs font-bold text-yellow-400 uppercase mb-2">Alterar Palavra-passe</label>
                <p className="text-xs text-slate-400 mb-4">Deixe em branco se não quiser alterar.</p>
                <input type="password" value={novaPassword} onChange={(e) => setNovaPassword(e.target.value)} placeholder="Nova palavra-passe" className="w-full p-3 bg-[#0f172a] text-white border border-slate-600 rounded-lg outline-none focus:border-yellow-400" />
              </div>
            </div>

            <button onClick={handleAtualizarPerfil} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg mt-4">
              ATUALIZAR PERFIL
            </button>

          </div>
        )}

        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-500 font-bold border border-red-500/30 mt-8">
          <span className="text-xl">🚪</span> Terminar Sessão
        </button>

      </div>
    </div>
  );
}