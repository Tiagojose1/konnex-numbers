/* eslint-disable @next/next/no-img-element */
// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter(); // Inicialização do router
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
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Tempo esgotado. Verifique a sua ligação à internet.')), 15000)
      );

      const loginPromise = supabase.auth.signInWithPassword({ email, password });
      
      // Correção do 'any': tipagem correta do Promise.race
      const resultado = await Promise.race([loginPromise, timeoutPromise]) as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

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

      // Correção do window.location.href
      router.push('/dashboard');

    } catch (err: unknown) {
      // Correção do 'any' no catch
      if (err instanceof Error) {
        setMensagem(err.message || 'Ocorreu um erro. Tente novamente.');
      } else {
        setMensagem('Ocorreu um erro desconhecido. Tente novamente.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        
        {/* === LOGO A RODAR + NOME === */}
        <div className="text-center mb-10">
          
          <div className="relative flex justify-center mb-6">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-violet-600 rounded-full blur-3xl brilho-pulsante"></div>
            <img 
              src="/globo.png" 
              alt="Globo Konnex" 
              className="w-24 h-24 relative z-10 globo-girando object-contain"
            />
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Konnex
            </span>
            <span className="text-white ml-2">Numbers</span>
          </h1>
          
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            Número Virtual Temporário. Receba SMS de ativação de aplicativos de todo o mundo em poucos segundos.
          </p>
        </div>

        {/* === FORMULÁRIO === */}
        <form onSubmit={handleLogin} className="space-y-5">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail ou login"
            className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            required
          />

          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            required
          />

          <div className="flex items-center gap-3 bg-white p-4 rounded-xl">
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
            <span className="text-sm text-slate-400">Lembrar</span>
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
          <div className="mt-4 p-3 bg-red-900/40 text-red-400 rounded-xl text-sm text-center border border-red-800">
            {mensagem}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <Link href="/recuperar-senha" className="block text-center text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
            Esqueci minha senha
          </Link>
          
          <Link href="/registo" className="block w-full text-center bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg">
            Cadastre-se Agora
          </Link>

          <Link href="/informacoes" className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-4 rounded-xl transition-colors">
            Mais Informações
          </Link>
        </div>
      </div>
    </div>
  );
}