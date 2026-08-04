import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-amber-50 dark:from-[#111417] dark:via-slate-900 dark:to-slate-800">
      <div className="text-center">
        <div className="mb-6 inline-flex items-center gap-3">
          <div className="h-16 w-2 rounded-full bg-gradient-to-b from-orange-500 to-amber-600" />
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
              Mineração
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Vórtice Mineral
            </h1>
          </div>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Gestão de tarefas para as equipes operacionais
        </p>
        {/* Ação única: Entrar. Quadro/Dashboard são rotas protegidas que
            redirecionam ao login sem sessão — mostrar os três botões aqui era
            redundante. Após o login, o usuário cai no quadro e navega ao
            dashboard pelo header. */}
        <div className="flex justify-center">
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
