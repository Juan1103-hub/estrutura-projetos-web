"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticate, demoAccounts, AuthUser } from "@/lib/auth/session";
import { login } from "@/app/actions/auth";

/**
 * T-004 — Formulário de login (AC-012/AC-013).
 *
 * Valida credenciais (modo demo) e, em caso de sucesso, salva o usuário e
 * redireciona para o quadro. Em produção, chamaria Supabase Auth.
 */

const SESSION_STORAGE_KEY = "kanban_session_user";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Login real no servidor (grava o cookie httpOnly de sessão).
    const result = await login(email, password);
    setLoading(false);

    if (!result.ok || !result.user) {
      setError(result.error ?? "E-mail ou senha incorretos");
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result.user));
    }
    router.push("/kanban");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs uppercase tracking-wide text-muted-foreground">
          E-mail
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs uppercase tracking-wide text-muted-foreground">
          Senha
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="pt-2 text-xs text-muted-foreground">
        <p className="font-medium mb-1">Contas de demonstração (senha: 123456):</p>
        <ul className="space-y-0.5">
          {demoAccounts().map((acc) => (
            <li key={acc}>
              <button
                type="button"
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                onClick={() => setEmail(acc)}
              >
                {acc}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}

/** Lê o usuário salvo na sessão (para exibir nome / perfil). */
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}