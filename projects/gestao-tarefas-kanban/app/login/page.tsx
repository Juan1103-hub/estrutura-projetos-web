import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-amber-50 dark:from-[#111417] dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-12 w-1.5 rounded-full bg-gradient-to-b from-orange-500 to-amber-600" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                Vórtice Mineral
              </p>
              <h1 className="text-xl font-bold tracking-tight">Acesso ao sistema</h1>
            </div>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}