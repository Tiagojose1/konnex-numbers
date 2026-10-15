// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMensagem(`Erro: ${error.message}`);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Logotipo e Título */}
        <div className="text-center mb-8">
         <img src="/logo.png" alt="Konnex Numbers" className="h-20 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            Número Virtual Temporário. Receba SMS de Ativação de aplicativos de todo mundo em poucos segundos.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail ou login"
              className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* CAPTCHA Box */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-300 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={captcha}
                onChange={(e) => setCaptcha(e.target.checked)}
                className="w-6 h-6 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Não sou um robô</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">reCAPTCHA</span>
            </div>
          </div>

          {/* Lembrar */}
          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-gray-600">Lembrar</span>
          </div>

          {/* Botão Entrar */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        {/* Mensagem de Erro */}
        {mensagem && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center border border-red-200">
            {mensagem}
          </div>
        )}

        {/* Links Inferiores */}
        <div className="mt-8 space-y-4">
          <Link href="#" className="block text-center text-blue-600 hover:underline text-sm font-medium">
            Esqueci minha senha
          </Link>
          
          <Link href="/registo" className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-colors shadow-md">
            Cadastre-se Agora
          </Link>

          <Link href="#" className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-colors shadow-md">
            Mais Informações
          </Link>
        </div>

      </div>
    </div>
  );
}