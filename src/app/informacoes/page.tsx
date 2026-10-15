// src/app/informacoes/page.tsx
import Link from 'next/link';

export default function InformacoesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sobre a Konnex Numbers</h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            A <strong>Konnex Numbers</strong> é a sua plataforma de confiança para obter números virtuais temporários. 
            Utilize-os para receber códigos de verificação SMS de centenas de serviços como WhatsApp, Telegram, Google, entre outros.
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Para que servem?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Criar contas secundárias de forma segura.</li>
            <li>Testar aplicações e projetos de desenvolvimento.</li>
            <li>Proteger o seu número pessoal de spam.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Como funciona o reembolso?</h2>
          <p>
            Se o SMS não chegar dentro de 10 minutos, o valor é automaticamente devolvido ao seu saldo principal. 
            Não precisa de fazer nada!
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link href="/login" className="text-purple-600 font-semibold hover:underline">← Voltar</Link>
        </div>
      </div>
    </div>
  );
}