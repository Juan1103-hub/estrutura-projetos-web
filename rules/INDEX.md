# Índice de Regras por Contexto

> Índice contextual — IA consulta para localizar regra aplicável.
> Regras consolidadas: 10 arquivos (de 21 originais).

## Quando usar cada regra

### Configuração e setup
| Regra | Quando ler |
|---|---|
| `workflow.md` | Seleção de stack, routing de domínio, recuperação de sessão, fallback de ferramentas |

### Perfil de stack (ler 1 por projeto)
| Regra | Stack | Quando ler |
|---|---|---|
| `stack-nextjs.md` | Next.js App Router | CRUD, SaaS, dashboard, API routes |
| `stack-react.md` | React + Vite | SPA sem SSR, CRUD interno |
| `stack-static.md` | HTML/CSS/JS | Landing, institucional, sem backend |

### Código e qualidade
| Regra | Quando ler |
|---|---|
| `code-quality.md` | Convenções de código, review, testes |

### Segurança e dados
| Regra | Quando ler |
|---|---|
| `auth-security.md` | JWT, Supabase/PostgreSQL, segredos, checklist de produção |
| `lgpd-domain.md` | Dados pessoais, consentimento, cookies, retenção |
| `integrations-domain.md` | APIs externas, webhooks, OAuth/SSO |

### UI/UX e frontend
| Regra | Quando ler |
|---|---|
| `ui-ux.md` | Design tokens, acessibilidade WCAG 2.1 |

## Regras de carregamento

- Não carregar todas por padrão
- Carregar conforme contexto da tarefa atual
- Perfis de stack incompatíveis nunca juntos
- Em conflito: regra específica vence regra geral
- Ordem de precedência: usuário > CLAUDE.md > rules/* > skills
