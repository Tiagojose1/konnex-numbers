// src/app/convide-amigos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ConvideAmigosPage() {
  const [linkConvite, setLinkConvite] = useState('');
  const [totalConvidados, setTotalConvidados] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let { data: profile } = await supabase.from('profiles').select('referral_code').eq('id', session.user.id).single();

      // 🆕 Se o utilizador não tiver código (contas antigas), geramos um agora
      if (profile && !profile.referral_code) {
        const novoCodigo = Math.random().toString(36).substring(2, 8).toUpperCase();
        await supabase.from('profiles').update({ referral_code: novoCodigo }).eq('id', session.user.id);
        profile.referral_code = novoCodigo;
      }

      if (profile && profile.referral_code) {
        // Link oficial do site
        setLinkConvite(`https://konnex-numbers.vercel.app/registo?ref=${profile.referral_code}`);
        
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('referred_by', profile.referral_code);
        setTotalConvidados(count || 0);
      }
      setLoading(false);
    };
    carregarDados();
  }, []);

  const copiarLink = () => {
    navigator.clipboard.writeText(linkConvite);
    toast.success('Link copiado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 font-sans text-white pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Convide Amigos</h1>
        <p className="text-slate-400 text-sm mb-8">Ganhe 10% do depósito por cada amigo que se registar.</p>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 text-center mb-6">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-lg font-bold text-cyan-400 mb-2">Ganhe recompensas</h2>
          <p className="text-xs text-slate-400 mb-6">Partilhe o seu link. Quando o seu amigo fizer o primeiro depósito, recebe o bónus na sua conta.</p>
          
          <div className="bg-slate-900 p-3 rounded-lg flex items-center justify-between border border-slate-700 mb-4">
            <span className="text-xs text-slate-300 truncate mr-2">{loading ? 'A gerar...' : linkConvite}</span>
            <button onClick={copiarLink} className="bg-blue-600 text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-blue-500">Copiar</button>
          </div>

          <div className="flex justify-between bg-slate-900 p-4 rounded-lg border border-slate-700">
            <div className="text-center">
              <span className="block text-xs text-slate-400">Amigos Convidados</span>
              <span className="block text-xl font-bold text-white">{totalConvidados}</span>
            </div>
          </div>
        </div>

        <Link href="/dashboard" className="block w-full text-center bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700">Voltar</Link>
      </div>
    </div>
  );
}