// src/app/tutorial/page.tsx
'use client';

import Link from 'next/link';

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] p-6 font-sans text-white pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Como usar o Konnex</h1>

        <div className="space-y-4">
          {/* Passo 1 */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <h3 className="font-bold text-cyan-400">Adicione Saldo</h3>
            </div>
            <p className="text-sm text-slate-300">Vá ao menu <strong>Saldo</strong>. Escolha o valor e o método de pagamento (M-Pesa, e-Mola ou Cartão). O saldo entra na hora.</p>
          </div>

          {/* Passo 2 */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <h3 className="font-bold text-cyan-400">Escolha o Serviço</h3>
            </div>
            <p className="text-sm text-slate-300">Vá ao menu <strong>Serviços</strong>. Pesquise pelo país e escolha o aplicativo (ex: WhatsApp, Telegram, etc).</p>
          </div>

          {/* Passo 3 */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <h3 className="font-bold text-cyan-400">Receba o SMS</h3>
            </div>
            <p className="text-sm text-slate-300">O número virtual aparece no menu <strong>Pedidos</strong>. Quando o SMS chegar, o código de verificação aparece automaticamente no ecrã.</p>
          </div>
        </div>

        <Link href="/dashboard" className="block w-full text-center bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 mt-8">
          Entendi, voltar ao Início
        </Link>
      </div>
    </div>
  );
}