# Workflow e Operação

> Consolida: stack-selection + domain-routing + session-recovery + tools-fallback

---

## Seleção de Stack

### Antes de criar projeto novo

1. Classificar o projeto: L0 (trivial), L1 (SDD reduzido), L2 (SDD completo)
2. Escolher stack conforme necessidade:

| Necessidade | Stack | Template |
|---|---|---|
| CRUD completo, SaaS, API | Next.js App Router | `templates/full/next-shadcn-admin-dashboard/` |
| Landing page, institucional | HTML/CSS/JS | `templates/full/nextjs-landing-page/` |
| SPA sem SSR, CRUD interno | React + Vite | — |
| Dashboard com sidebar + KPIs | Next.js + shadcn/ui | `templates/full/next-shadcn-admin-dashboard/` |

3. Carregar regra de stack correspondente (`stack-nextjs.md`, `stack-react.md`, `stack-static.md`)

### Hierarquia de precedência

Usuário > CLAUDE.md > rules/* > skills

---

## Routing de Domínio

### Quando aplicar

Antes de concluir Discovery ou gerar PRD/decisões técnicas/schema/SPEC para qualquer projeto novo ou mudança L2.

### Como identificar domínio

Ler solicitação do usuário e PRD. Se entidade central envolver:

- **Financeiro** → carregar `lgpd-domain.md` (dados pessoais) + regras específicas
- **Estoque/Inventário** → regras de movimentação e validação
- **Integrações** → APIs externas, webhooks, OAuth

### Regras de domínio disponíveis

| Regra | Quando ler |
|---|---|
| `lgpd-domain.md` | Dados pessoais, consentimento, cookies, retenção |
| `integrations-domain.md` | APIs externas, webhooks, OAuth/SSO |

---

## Recuperação de Sessão

### Quando aplicar

Após falha de streaming, compactação, mudança de modelo, contexto insuficiente, ou "continue" após lacuna no histórico.

### Antes de retomar

1. Confirmar diretório de trabalho e feature ativa
2. Ler: CLAUDE.md → `.spec/STATE.md` → artefatos da feature (`spec.md`, `tasks.md`)
3. Resumir contexto recuperado para o usuário
4. Perguntar se deve continuar de onde parou

---

## Fallback de Ferramentas

### Regra principal

Antes de exigir skill, subagente, MCP ou integração:

1. Verificar disponibilidade no ambiente
2. Usar quando disponível e adequada
3. Se indisponível, executar melhor validação manual possível
4. Declarar claramente a limitação
5. **Nunca declarar sucesso de ferramenta não executada**
