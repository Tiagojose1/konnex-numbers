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
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [saldo, setSaldo] = useState(0);
  const [currency, setCurrency] = useState('MZN');
  const [displayId, setDisplayId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
        .select('nome_completo, telefone, currency, display_id, saldo, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setNome(profile.nome_completo || '');
        setTelefone(profile.telefone || '');
        setCurrency(profile.currency || 'MZN');
        setDisplayId(profile.display_id || '');
        setSaldo(parseFloat(profile.saldo) || 0);
        setAvatarUrl(profile.avatar_url || null);
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

      // 1. Faz o upload para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Pega o URL público da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Atualiza a tabela 'profiles'
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Foto atualizada com sucesso!');

    } catch (err: unknown) { // 🆕 Corrigido aqui: usa 'err' e loga o erro
      console.error(err);
      toast.error('Erro ao fazer upload da foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleGuardarDados = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const toastId = toast.loading('A guardar alterações...');

    const { error } = await supabase
      .from('profiles')
      .update({ nome_completo: nome, telefone })
      .eq('id', session.user.id);

    if (error) toast.error('Erro ao guardar dados.', { id: toastId });
    else {
      toast.success('Perfil atualizado!', { id: toastId });
      setIsEditing(false);
    }
  };

  const handleAlterarPassword = async () => {
    if (novaPassword.length < 6) return toast.error('A palavra-passe deve ter 6 caracteres.');
    const toastId = toast.loading('A alterar palavra-passe...');
    const { error } = await supabase.auth.updateUser({ password: novaPassword });
    if (error) toast.error(`Erro: ${error.message}`, { id: toastId });
    else {
      toast.success('Palavra-passe alterada!', { id: toastId });
      setNovaPassword('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex justify-center items-center text-white">A carregar...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-24 font-sans">
      
      {/* Cabeçalho Superior */}
      <header className="bg-[#0f172a] sticky top-0 z-50 px-4 py-4 flex items-center justify-between border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">O Meu Perfil</h1>
        <Link href="/dashboard" className="text-slate-400 text-2xl hover:text-white">&times;</Link>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        
        {/* Cartão de Saldo */}
        <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 mb-6 flex justify-between items-center shadow-lg">
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">Saldo Disponível</p>
            <h2 className="text-3xl font-bold text-white">{formatarMoeda(saldo, currency)}</h2>
          </div>
          <Link href="/saldo" className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-2 px-6 rounded-lg text-sm transition-colors shadow-md">
            Depositar
          </Link>
        </div>

        {/* Foto e Dados Principais */}
        <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-6 mb-6 flex items-center gap-4">
          
          {/* Avatar com Upload */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Perfil" className="w-20 h-20 rounded-full object-cover border-2 border-slate-600" />
            ) : (
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-slate-600">
                {nome.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold">{uploading ? 'A enviar...' : '📷 Mudar'}</span>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUploadFoto} className="hidden" />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{nome}</h2>
            <p className="text-slate-400 text-sm">{email}</p>
            <p className="text-slate-500 text-xs font-mono mt-1">ID: {displayId}</p>
          </div>
        </div>

        {/* Menu de Opções */}
        <div className="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden mb-6">
          <button onClick={() => setIsEditing(!isEditing)} className="w-full flex items-center justify-between p-4 border-b border-slate-700/50 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">👤</span>
              <span className="font-medium text-white">Editar Dados Pessoais</span>
            </div>
            <span className="text-slate-400">{isEditing ? '⌃' : '›'}</span>
          </button>
          
          {isEditing && (
            <div className="p-4 bg-slate-900/50 border-b border-slate-700/50 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-3 bg-slate-800 text-white border border-slate-600 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Telefone</label>
                <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full p-3 bg-slate-800 text-white border border-slate-600 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <button onClick={handleGuardarDados} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors">
                Guardar Dados
              </button>
            </div>
          )}

          <Link href="/historico" className="flex items-center justify-between p-4 border-b border-slate-700/50 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="font-medium text-white">Extratos (Histórico)</span>
            </div>
            <span className="text-slate-400">›</span>
          </Link>

          <Link href="/pedidos" className="flex items-center justify-between p-4 border-b border-slate-700/50 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <span className="font-medium text-white">Meus Pedidos</span>
            </div>
            <span className="text-slate-400">›</span>
          </Link>

          <Link href="/apoio" className="w-full flex items-center justify-between p-4 border-b border-slate-700/50 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">❓</span>
              <span className="font-medium text-white">Perguntas Frequentes</span>
            </div>
            <span className="text-slate-400">›</span>
          </Link>
        </div>

        {/* Segurança */}
        <div className="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
            <h3 className="font-bold text-white">Segurança</h3>
          </div>
          <div className="p-4">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Alterar Palavra-passe</label>
            <div className="flex gap-2">
              <input type="password" value={novaPassword} onChange={(e) => setNovaPassword(e.target.value)} placeholder="Nova palavra-passe" className="w-full p-3 bg-slate-800 text-white border border-slate-600 rounded-lg outline-none focus:border-blue-500" />
              <button onClick={handleAlterarPassword} className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 rounded-lg transition-colors">
                Alterar
              </button>
            </div>
          </div>
        </div>

        {/* Botão de Sair */}
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-500 font-bold border border-red-500/30">
          <span className="text-xl">🚪</span> Terminar Sessão
        </button>

      </div>
    </div>
  );
}