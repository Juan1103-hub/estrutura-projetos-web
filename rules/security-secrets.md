# Segurança, Segredos e Supabase

Detalhes operacionais de segurança. O resumo obrigatório permanece no
`AGENTS.md` — este arquivo contém as regras completas para tarefas com banco,
Supabase, Auth, migrations ou dados sensíveis.

---

## Segredos — proibições absolutas

É proibido registrar em código, commits, `memory.md`, PRD, SPEC, logs ou
respostas:

- Senhas, tokens, chaves de API, cookies, sessões e credenciais.
- Valores reais de `.env` (usar `.env.example` sem valores reais).
- Dados pessoais, dados de clientes ou dumps de produção sem necessidade e
  autorização.
- Chaves `service_role` ou credenciais administrativas — **jamais no
  frontend**, em variáveis `NEXT_PUBLIC_*` ou em código client-side.

Usar variáveis de ambiente e mecanismos de segredo da plataforma de deploy
(Vercel env vars, Supabase secrets).

## Supabase, banco e Auth

Quando houver Supabase, banco, schema, migration, query, Prisma, Auth,
Storage, Realtime, RLS ou Edge Functions:

- Carregar as skills `supabase` e `supabase-postgres-best-practices`, se
  disponíveis.
- **RLS habilitado em toda tabela** com dados de usuário/negócio expostos ao
  cliente.
- Validar autorização no servidor e/ou banco; RLS não substitui regras de
  negócio.
- Validar entradas no backend, API, Server Action, Edge Function ou banco,
  conforme a arquitetura.
- Criar foreign keys, índices, constraints e validações compatíveis com o
  padrão de acesso.
- Testar permissões com usuário de menor privilégio para fluxos sensíveis.
- Em views expostas, avaliar e aplicar `security_invoker = true` quando
  apropriado.
- Storage: buckets com RLS, paths prefixados por `auth.uid()`.
- API routes: validar sessão com `getUser()` em cada handler sensível.
- Verificar breaking changes da plataforma e das bibliotecas antes de mudanças
  relevantes.

## Migrations destrutivas

Para migrations que dropam colunas, tabelas, alteram tipos com perda de dados
ou reescrevem dados existentes:

1. Exigir backup antes de executar.
2. Exigir plano de rollback documentado.
3. Exigir aprovação explícita do usuário.
4. Executar primeiro em ambiente de desenvolvimento/staging.

## Deploy

- **Padrão**: Vercel (frontend, domínio) + Supabase (banco, auth, storage).
- **Netlify**: apenas como alternativa explícita e justificada — nunca como
  padrão assumido.
- Ver `DEPLOY.md` quando existir para checklist completo de deploy.
