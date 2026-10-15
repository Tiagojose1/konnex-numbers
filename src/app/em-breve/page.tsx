// src/app/em-breve/page.tsx
import Link from 'next/link';

export default function EmBrevePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full text-center">
        <span className="text-6xl mb-4 block">🚧</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Em Breve</h1>
        <p className="text-gray-500 mb-8">
          Esta funcionalidade estará disponível na próxima atualização da Konnex Numbers.
        </p>
        <Link href="/perfil" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md inline-block">
          Voltar ao Perfil
        </Link>
      </div>
    </div>
  );
}