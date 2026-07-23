# Índice de Regras por Contexto

>índice contextual — IA consulta para localizar regra aplicável.

## Quando usar cada regra

### Configuração e setup
| Regra | Quando ler |
|---|---|
| `stack-selection.md` | Projeto novo ou mudança estrutural — escolher stack/template |
| `domain-routing.md` | Antes de concluir Discovery — identificar domínio crítico |

### Perfil de stack (ler 1 por projeto, nunca 2 incompatíveis)
| Regra | Stack | Quando ler |
|---|---|---|
| `nextjs-app.md` | Next.js sistema completo | CRUD, SaaS, e-commerce, blog com API |
| `nextjs-dashboard.md` | Next.js dashboard | Sidebar + KPIs + gráficos, backoffice |
| `react-vite.md` | React SPA | SPA sem SSR, CRUD interno |
| `static-html-css-js.md` | HTML/CSS/JS | Landing, institucional, sem backend |
| `web-project.md` | Genérico | Qualquer projeto — regras transversais |

### Código e qualidade
| Regra | Quando ler |
|---|---|
| `code-style.md` | Escrever/editar TS/TSX — convenções (Inter, tabular-nums, Select, Form) |
| `code-review.md` | Antes de concluir task L1/L2 — processo de review e severidades |
| `testing.md` | Planejar e escrever testes — Vitest, RTL, Playwright, fixtures |

### Segurança e dados
| Regra | Quando ler |
|---|---|
| `security-secrets.md` | Supabase, Auth, RLS, migrations, dados sensíveis |
| `inventory-domain.md` | Estoque, inventário, produtos, movimentações |
| `finance-domain.md` | Pagamentos, cobrança, transações, conciliação, estornos, fiscal |
| `lgpd-domain.md` | Dados pessoais (CPF, e-mail, biometria), consentimento, cookies, retenção |
| `integrations-domain.md` | APIs externas, webhooks, gateways, OAuth/SSO, SDKs, retries, idempotência |

### UI/UX e frontend
| Regra | Quando ler |
|---|---|
| `design-tokens.md` | Criar/editar CSS — paleta OKLCH, tipografia, contraste |
| `accessibility.md` | Criar/editar UI — WCAG 2.1 AA, aria-label, touch targets |

### Operação
| Regra | Quando ler |
|---|---|
| `session-recovery.md` | Após falha de sessão, contexto insuficiente, "continue" |
| `tools-fallback.md` | Antes de exigir skill/MCP/subagent — verificar disponibilidade |

## Regras de carregamento

- não carregar todas por padrão.
- Carregar conforme contexto da tarefa atual.
- Perfis de stack incompatíveis (ex: `static-html-css-js.md` + `nextjs-app.md`) nunca juntos.
- Em conflito: regra específica vence regra geral.
- Ordem de precedência: usuário > AGENTS.md > rules/* > skills.
- Regras carregadas automaticamente via `opencode.json` `instructions: ["rules/*.md"]`.