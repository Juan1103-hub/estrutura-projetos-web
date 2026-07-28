# Tech Decisions — qualidade-clinica

## Stack

- Framework: Next.js 16 (App Router) + React 19 + TypeScript strict
- UI: Tailwind CSS v4 + shadcn/ui + Lucide + Chart.js (react-chartjs-2)
- Banco/Auth/Storage: Supabase (Postgres + RLS + Auth + Storage privado para termos)
- ORM: Supabase JS direto (sem Prisma) — RPCs transacionais para operações multi-item
- Testes: Vitest + React Testing Library + Playwright
- Deploy: Vercel (frontend) + Supabase (backend)

## Template escolhido

- Template base: perfil `rules/nextjs-app.md` (sistema completo), com layout de dashboard (sidebar + seções) conforme `rules/nextjs-dashboard.md`.
- Motivo contra alternativas:
  - `nextjs-dashboard` puro: ótimo para KPIs, mas o sistema tem CRUDs complexos (congelamento 2000+ linhas, mapa de botijão, fluxos de aprovação) que exigem estrutura de app completo.
  - `react-vite`: sem SSR/SEO — aceitável, mas perde server components (acesso direto ao banco com RLS) e o padrão de deploy do workspace; Next.js já é o padrão.
- Não clonar template pronto: nenhum dos 4 templates de `templates/full/` cobre domínio regulado/LGPD; bootstrap limpo via `create-next-app` evita remover dependências (Stripe, MDX, Prisma).

## Decisões técnicas

| ID | Decisão | Alternativas | Motivo |
|---|---|---|---|
| AD-001 | organization_id em TODAS as tabelas + RLS por org | org única sem coluna | Decisão do usuário: preparar multi-unidade desde o início |
| AD-002 | Indicadores cadastráveis (tabela `indicators` + `indicator_targets` com vigência + `indicator_entries`) | hardcoded por indicador | Qualidade gerencia sem deploy; mesma estrutura serve FAR e LAB |
| AD-003 | Grau de risco = severidade × probabilidade calculado no banco (GENERATED ou trigger) | cálculo no client | Consistência; semáforo deriva do valor persistido |
| AD-004 | Localização de palheta: tabela `cryo_locations` (botijão/rack/caçapa/posição) com UNIQUE de ocupação | campos soltos na amostra | "Mapa do botijão" real, impede dupla ocupação, suporta visualização |
| AD-005 | Descarte: tabela `disposal_requests` (status: pendente/aprovado/rejeitado) + anexo em Storage privado | flag na amostra | Fluxo 2 níveis com termo obrigatório; amostra só baixa após aprovação |
| AD-006 | Alertas in-app: tabela `alerts` gerada por triggers/RPC + job diário (Supabase Cron) para vencimentos | e-mail externo | Decisão do usuário: sem integração externa no MVP |
| AD-007 | Auditoria: tabela `audit_log` imutável via triggers (old/new JSONB, user, ts) + `access_log` para leitura de PII sensível | log na aplicação | Imutável, cobre RPC e acesso direto ao banco |
| AD-008 | Importação: script Node (xlsx) rodado 1× pelo dev, com relatório de inconsistências; não é feature de UI | upload pelo usuário | Migração única e controlada; layouts de exportação derivados dos mesmos arquivos |
| AD-009 | Exportação: geração server-side de .xlsx (exceljs) replicando layout das planilhas + PDF (react-pdf) | relatório limpo genérico | Decisão do usuário: réplica fiel exigida para acreditação |
| AD-010 | PII sensível: tabelas `patients`/`donors` separadas, mascaramento em listagens, `access_log` em SELECT via RPC | PII espalhada nas tabelas operacionais | LGPD Art. 11 — minimização e controle de acesso |
| AD-011 | Soft-delete (`deleted_at`) + expurgo programado por tipo de dado | hard delete | Retenção legal (CFM ≥ 20 anos) + LGPD |
| AD-012 | Confirmações multi-item via RPC transacional (Security Definer validando auth) | múltiplos inserts do client | Atomicidade (regra inventory-domain) |

## Pendências

- [PENDENTE]: faixas/limites reais (botijões, equipamentos, metas) — extraídos das planilhas na importação.
- [PENDENTE]: provedor de storage dos termos já incluso (Supabase Storage); revalidar em deploy.
