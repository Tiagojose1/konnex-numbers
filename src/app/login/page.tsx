// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captcha) {
      setMensagem('Por favor, confirme que não é um robô.');
      return;
    }
    setLoading(true);
    setMensagem('');

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tempo esgotado. Verifique a sua ligação à internet.')), 15000)
      );

      const loginPromise = supabase.auth.signInWithPassword({ email, password });
      const resultado = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (resultado.error) {
        const msg = resultado.error.message;
        if (msg.includes('Invalid login credentials')) {
          setMensagem('E-mail ou palavra-passe incorretos.');
        } else if (msg.includes('Email not confirmed')) {
          setMensagem('Por favor, confirme o seu e-mail antes de entrar.');
        } else {
          setMensagem(`Erro: ${msg}`);
        }
        setLoading(false);
        return;
      }

      window.location.href = '/dashboard';

    } catch (err: any) {
      setMensagem(err.message || 'Ocorreu um erro. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    {/* Fundo gradiente */}
    <div className="min-h-screen bg-gradient-to-br from-[#8a00e6] via-[#0044ff] to-[#00ffaa] flex items-center justify-center p-4 font-sans">
      
      {/* Cartão de vidro escuro */}
      <div className="max-w-md w-full bg-slate-950/70 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        
        <div className="text-center mb-10">
          
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.jpg" 
              alt="Konnex Numbers" 
              className="w-64 h-auto object-contain rounded-2xl mix-blend-multiply drop-shadow-xl"
            />
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            <span className="text-white drop-shadow-md">Konnex</span>
            <span className="text-cyan-400 ml-2 drop-shadow-md">Numbers</span>
          </h1>
          
          <p className="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
            Número Virtual Temporário. Receba SMS de ativação de aplicativos de todo o mundo em poucos segundos.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail ou login"
            className="w-full p-4 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            required
          />

          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-4 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            required
          />

          <div className="flex items-center gap-3 bg-white/90 p-4 rounded-xl">
            <input 
              type="checkbox" 
              checked={captcha}
              onChange={(e) => setCaptcha(e.target.checked)}
              className="w-6 h-6 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
            />
            <span className="text-slate-800 font-medium text-sm">Não sou um robô</span>
            <div className="ml-auto text-right">
              <span className="text-xs text-gray-400 block">reCAPTCHA</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 text-cyan-500 rounded bg-slate-800 border-slate-600" />
            <span className="text-sm text-slate-300">Lembrar</span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        {mensagem && (
          <div className="mt-4 p-3 bg-red-900/60 text-red-200 rounded-xl text-sm text-center border border-red-700">
            {mensagem}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <Link href="/recuperar-senha" className="block text-center text-cyan-300 hover:text-cyan-200 text-sm font-medium transition-colors">
            Esqueci minha senha
          </Link>
          
          <Link href="/registo" className="block w-full text-center bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 rounded-xl transition-all shadow-lg">
            Cadastre-se Agora
          </Link>

          <Link href="/informacoes" className="block w-full text-center bg-transparent hover:bg-white/5 text-slate-300 font-bold py-4 rounded-xl transition-colors">
            Mais Informações
          </Link>
        </div>
      </div>
    </div>
  );
}