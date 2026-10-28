'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function VerificacaoPage() {
  const router = useRouter();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'numero' | 'codigo'>('numero');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const checkUserAndPrefill = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const savedPhone = session.user.user_metadata?.telefone;
      if (savedPhone) {
        const formattedPhone = savedPhone.startsWith('+') ? savedPhone : `+258${savedPhone}`;
        setPhoneNumber(formattedPhone);
      }
    };
    checkUserAndPrefill();
  }, [router]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // ✅ ALTERAÇÃO: Uso da variável de ambiente
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'pending') {
        setStep('codigo');
        setMessage({ text: 'Código enviado! Verifique o seu SMS.', type: 'success' });
        setTimeLeft(60); 
      } else {
        setMessage({ text: data.error || 'Erro ao enviar o SMS.', type: 'error' });
      }
    } catch (error) {
      console.error("Erro na chamada de envio:", error);
      setMessage({ text: 'Erro de conexão com o servidor.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setMessage({ text: 'Sessão expirada. Faça login novamente.', type: 'error' });
        setIsLoading(false);
        router.push('/login');
        return;
      }

      // ✅ ALTERAÇÃO: Uso da variável de ambiente
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber, 
          code, 
          userId: session.user.id 
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'approved') {
        setMessage({ text: 'Número verificado com sucesso! Redirecionando...', type: 'success' });
        
        localStorage.setItem('konnex_user_phone', phoneNumber);

        setTimeout(() => {
          router.push('/dashboard'); 
        }, 2000);
        
      } else {
        setMessage({ text: 'Código inválido ou expirado. Tente novamente.', type: 'error' });
      }
    } catch (error) {
      console.error("Erro na chamada de validação:", error);
      setMessage({ text: 'Erro de conexão com o servidor.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setStep('numero');
    setCode('');
    setMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Konnex App</h1>
          <p className="text-gray-500 mt-2">
            {step === 'numero' ? 'Confirme o seu número de telefone' : 'Insira o código recebido'}
          </p>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-md text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {step === 'numero' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Telefone</label>
              <input
                type="tel"
                placeholder="+258845284612"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-black"
              />
              <p className="text-xs text-gray-400 mt-1">Inclua o código do país (ex: +258).</p>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || timeLeft > 0}
              className={`w-full font-medium py-2 px-4 rounded-lg transition ${
                timeLeft > 0 || isLoading 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading 
                ? 'A enviar...' 
                : timeLeft > 0 
                  ? `Aguarde ${timeLeft}s para reenviar` 
                  : 'Enviar Código SMS'}
            </button>
          </form>
        )}

        {step === 'codigo' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código de 6 dígitos</label>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-black text-center tracking-widest text-lg font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? 'A validar...' : 'Validar Código'}
            </button>
            <button
              type="button"
              onClick={handleChangeNumber}
              className="w-full text-gray-500 text-sm mt-2 hover:underline"
            >
              Alterar número de telefone
            </button>
          </form>
        )}

      </div>
    </div>
  );
}