'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ComprarNumeroPage() {
  const router = useRouter();
  
  const [fornecedor, setFornecedor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [numero, setNumero] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [orderIdSpool, setOrderIdSpool] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [servico, setServico] = useState('WhatsApp');
  const [pais, setPais] = useState('NL'); 

  const handleComprar = async () => {
    setLoading(true);
    setError(null);
    setSmsCode(null);
    setNumero(null);
    setFornecedor(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // ✅ ALTERAÇÃO: Uso da variável de ambiente
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/buy-number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          service: servico,
          country: pais
        })
      });

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch {
        throw new Error(`Erro do servidor: ${textResponse}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao comprar o número.');
      }

      setNumero(data.numero);
      setPedidoId(data.pedidoId);
      setOrderIdSpool(data.orderId);
      setFornecedor(data.fornecedor);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (numero && pedidoId && orderIdSpool && !smsCode) {
      interval = setInterval(async () => {
        try {
          // ✅ ALTERAÇÃO: Uso da variável de ambiente no polling
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/check-sms/${pedidoId}/${orderIdSpool}?fornecedor=${fornecedor}`);
          const data = await res.json();

          if (data.sms_recebido && data.codigo) {
            setSmsCode(data.codigo);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("A verificar SMS...", err);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [numero, pedidoId, orderIdSpool, smsCode, fornecedor]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mt-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Comprar Número Virtual</h1>

        {!numero && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Serviço</label>
              <select 
                value={servico} 
                onChange={(e) => setServico(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg text-black"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Google">Google / Gmail</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">País</label>
              <select 
                value={pais} 
                onChange={(e) => setPais(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg text-black"
              >
                <option value="NL">Holanda 🇳🇱 (Recomendado)</option>
                <option value="US">Estados Unidos 🇺🇸</option>
                <option value="BR">Brasil 🇧🇷</option>
                <option value="MZ">Moçambique 🇲🇿</option>
                <option value="ZA">África do Sul 🇿🇦</option>
              </select>
            </div>

            <button
              onClick={handleComprar}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
            >
              {loading ? 'A comprar...' : 'Comprar Número'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {numero && (
          <div className="mt-4 space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
              <p className="text-sm text-green-700 font-medium mb-1">O seu número é:</p>
              <p className="text-2xl font-extrabold text-green-900 tracking-wider">{numero}</p>
            </div>

            {!smsCode ? (
              <div className="text-center p-6 bg-slate-100 rounded-lg">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
                <p className="text-slate-600 font-medium">À espera do código SMS...</p>
                <p className="text-xs text-slate-400 mt-2">Insira este número no {servico} para receber o código.</p>
              </div>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-400 p-6 rounded-lg text-center">
                <p className="text-sm text-blue-600 font-medium mb-1">Código Recebido!</p>
                <p className="text-4xl font-extrabold text-blue-900 tracking-widest">{smsCode}</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(smsCode);
                    alert("Código copiado!");
                  }}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Copiar Código
                </button>
              </div>
            )}

            <button
              onClick={() => { setNumero(null); setSmsCode(null); }}
              className="w-full text-slate-500 text-sm mt-4 hover:underline"
            >
              Comprar outro número
            </button>
          </div>
        )}
      </div>
    </div>
  );
}