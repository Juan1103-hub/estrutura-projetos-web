# AGENTS.md — Workspace de Projetos Web

Roteador global para desenvolvimento web assistido por IA no OpenCode.

Escopo: HTML, CSS, JavaScript/TypeScript, React, Next.js, Node.js, APIs,
Supabase/Postgres, autenticação e segurança web.

---

## Hierarquia de instruções

1. Instrução explícita do usuário na conversa atual.
2. Este `AGENTS.md`.
3. Regras em `rules/` (carregadas automaticamente via `opencode.json`).
4. Skills específicas em `.opencode/skills/` (carregadas on-demand).
5. Skills gerais (`~/.config/opencode/skills/`, `~/.claude/skills/`, etc.).

Código e configuração reais do projeto prevalecem sobre documentação
desatualizada. Nunca ignorar requisito explícito do usuário com base em
skill ou regra.

---

## Layout do workspace

```
workspace/
├── AGENTS.md                    # Este roteador
├── DEPLOY.md                    # Checklist de go-live
├── opencode.json                # Config OpenCode (alinhada ao schema)
├── memory.md                    # Memória do workspace
├── .opencode/                   # Diretório-nativo OpenCode
│   ├── agents/                  # Subagentes (web/backend/deploy)
│   ├── commands/                # Comandos /new-project /sdd-start /audit-ui /deploy-check
│   ├── skills/                  # Skills project-local (carregadas on-demand)
│   └── rules/                   # Regras específicas do .opencode
├── rules/                       # Regras contextuais carregadas via instructions
├── docs/                        # Documentação do workspace
│   ├── workflow.md              # Fluxo SDD completo
│   ├── conventions.md          # Padrões de nomenclatura
│   ├── guides/                  # How-to
│   └── references/              # Referências arquiteturais
├── templates/                   # Catálogo
│   ├── full/                    # Templates completos (clone)
│   └── snippets/                # Snippets (copiar trecho)
├── projects/                    # Projetos isolados (projects/<nome>/)
└── .specs/                      # SDD
    ├── _template/               # Template vazio p/ clonar
    ├── STATE.md                 # Estado global do workspace
    └── projects/<nome>/         # Specs isoladas por projeto
```

---

## Regra máxima — todo projeto novo

**Nenhum projeto novo começa por código, template, dependência, schema, Auth
ou UI.**

Todo projeto novo inicia obrigatoriamente pela skill `tlc-spec-driven`
via `/new-project`:

```
/new-project meu-app "Descrição curta"
```

Fluxo automaticamente executado:

```
Discovery → PRD → Tech Decisions → SPEC → Planner →
Sprint Validator → APROVAR PLANO E INICIAR
```

NÃO avançar para implementação sem receber exatamente
`APROVAR PLANO E INICIAR` do usuário.

Durante Discovery/decisões técnicas, ler obrigatoriamente:
- `templates/catalog.md` e `templates/README.md` — escolher template
- `rules/stack-selection.md` — regras de seleção e perfis incompatíveis
- `rules/domain-routing.md` — identificar domínio crítico e ler regra específica

---

## Classificação de tarefas (projetos existentes)

Projeto novo nunca é L0/L1 — sempre passa pelo fluxo da seção anterior.
Em manutenção de projeto existente, classificar antes de agir:

| Nível | Critério | Fluxo |
|---|---|---|
| **L0** | Trivial, sem mudança de comportamento/layout/schema | Alterar direto, sem PRD/SPEC. Informar arquivo alterado e validação |
| **L1** | Feature pequena/média, poucos arquivos, sem decisão arquitetural nova | `/sdd-start <projeto> <feature>` com profundidade reduzida (Specify + Execute) |
| **L2** | Sensível: schema, Auth, RLS, pagamento, integração, dado pessoal | `/sdd-start <projeto> <feature>` SDD completo + `rules/domain-routing.md` + regra de domínio aplicável |

---

## Skills — carregamento seletivo

17 skills em `.opencode/skills/*/SKILL.md` são descobertas automaticamente
pelo OpenCode e listadas na `skill` tool. Carregar on-demand quando a tarefa
corresponder à descrição. Não carregar todas por padrão.

### Mapeamento comum

| Contexto | Skill |
|---|---|
| Planejamento, requisitos, SPEC | `tlc-spec-driven` |
| Frontend design, anti-patterns UI | `impeccable` (ler `.opencode/rules/impeccable.md` para mapeamento de comandos) |
| Supabase (banco, auth, RLS) | `supabase`, `supabase-postgres-best-practices` |
| Acessibilidade WCAG 2.1 | `accessibility` |
| Auditoria web (perf, a11y, SEO, boas práticas) | `web-quality-audit`, `best-practices` |
| Componentes UI de alto padrão | `frontend-design`, `ui-ux-pro-max` |
| Debug de browser (console, rede) | `chrome-devtools` |
| Eficiência de tokens | `token-efficiency`, `coding-guidelines` |

Sobre Impeccable: em toda UI nova ou alteração visual relevante, executar
`/audit-ui <arquivo|url>`. `impeccable init` apenas uma vez por projeto, no
bootstrap, antes da primeira tela — não no fim.

---

## Perfis de stack (ler 1 por projeto, nunca 2 incompatíveis)

| Perfil | Regra | Quando |
|---|---|---|
| Next.js App completo | `rules/nextjs-app.md` | CRUD complexo, SaaS, e-commerce, blog com API |
| Next.js Dashboard | `rules/nextjs-dashboard.md` | Sidebar + KPIs + gráficos, backoffice |
| React SPA (Vite) | `rules/react-vite.md` | SPA sem SSR/SEO, CRUD interno |
| HTML/CSS/JS estático | `rules/static-html-css-js.md` | Landing, institucional, sem backend |

Padrões visuais transversais (tokens OKLCH, tipografia, contraste, ícones)
em `rules/design-tokens.md` e `rules/accessibility.md`.

Índice completo de regras por contexto: `rules/INDEX.md`.

---

## Domínios críticos

Antes de concluir Discovery ou gerar PRD, decisões técnicas, schema, RLS,
SPEC ou plano, identificar o domínio de negócio da solicitação.

Se existir regra especializada em `rules/` para esse domínio, **lê-la
obrigatoriamente** e seguir sua checklist antes de decidir. Ver
`rules/domain-routing.md` para o mapa palavras-gatilho → regra.

Hoje cobertos:
- Estoque/inventário/movimentações → `rules/inventory-domain.md`
- Segurança/dados sensíveis → `rules/security-secrets.md`
- Financeiro/pagamentos → `rules/finance-domain.md`
- LGPD/dados pessoais → `rules/lgpd-domain.md`
- Integrações externas → `rules/integrations-domain.md`

Sem regra especializada ainda: outros domínios não listados. Nesses casos,
aplicar `rules/security-secrets.md` e fazer perguntas bloqueadoras via tool
`question` — registrar premissas no PRD. Sugerir ao usuário criar
`rules/<dominio>-domain.md` para reuso futuro somente após aprovação explícita.

---

## Segurança — resumo obrigatório

- Nunca expor `service_role`, tokens, segredos ou valores reais de `.env`.
- RLS obrigatório em toda tabela exposta ao cliente.
- Validação e autorização sempre no servidor e/ou banco — nunca apenas na UI.
- Migrations destrutivas: exigir backup, plano de rollback e aprovação
  explícita antes de executar.

Detalhes em `rules/security-secrets.md`. Checklist de go-live em `DEPLOY.md`
ou via `/deploy-check <projeto>`.

---

## Revisão de código

Cada task L1 ou L2 deve passar por revisão proporcional ao risco antes
da próxima task. Usar subagentes via `@mention`:

| Escopo da task | Revisor |
|---|---|
| Frontend/UI | `@web-reviewer` |
| Backend, API, banco, Auth, Supabase | `@backend-reviewer` |
| Deploy / go-live | `@deploy-checker` |
| L2 ou mudança sensível | Frontend **e** backend conforme escopo |
| L1 | Auto-revisão estruturada + subagente quando disponível |
| L0 | Auto-revisão guiada por checklist |

Não concluir L2 com achado Bloqueador ou Alto sem correção ou exceção
aprovada. Detalhes e checklist completo em `rules/code-review.md`.

Resultado obrigatório: Status (APROVADO / REPROVADO / APROVADO COM RESSALVAS),
critérios de aceite avaliados, arquivos revisados, achados por severidade,
testes executados, próxima ação.

- `APROVADO` → task concluída, próxima liberada.
- `APROVADO COM RESSALVAS` → aguardar confirmação do usuário.
- `REPROVADO` → criar task-fix pequena, corrigir e revisar novamente.

---

## Ferramentas, MCPs e fallback

Antes de exigir ou usar skill, subagente, MCP, navegador ou comando:
verificar disponibilidade, usar se existir, ou executar validação manual
equivalente e declarar a limitação. **Nunca declarar sucesso de ferramenta
não executada.**

Detalhes em `rules/tools-fallback.md`.

---

## Recuperação de sessão

Se ocorrer falha de streaming, compactação, contexto insuficiente, mudança
de modelo ou qualquer erro que comprometa continuidade, **interromper** e
seguir `rules/session-recovery.md` antes de retomar.

Sempre ler ao retomar trabalho em feature:
1. `AGENTS.md` (este arquivo)
2. `memory.md`
3. `.specs/STATE.md` (estado global) + `.specs/projects/<projeto>/STATE.md`
   (estado do projeto ativo)
4. Artefatos persistidos da feature ativa

"continue" autoriza somente continuar a feature e tarefa já verificadas no
estado persistido. Não autoriza trocar projeto, escopo ou fase sem confirmar.

---

## Comandos customizados disponíveis

| Comando | Uso |
|---|---|
| `/new-project <nome> "<descrição>"` | SDD completo para projeto novo |
| `/sdd-start <projeto> <feature>` | SDD para feature em projeto existente (L1/L2) |
| `/audit-ui <arquivo\|url>` | Auditoria Impeccable (anti-patterns, a11y, design tokens) |
| `/deploy-check <projeto>` | Checklist de go-live via `@deploy-checker` |

---

## Perguntas ao usuário

Decisão, confirmação ou dado faltante: usar tool `question`. Nunca fazer
perguntas bloqueadoras em texto puro. Exceção: perguntas triviais (nome de
arquivo, por exemplo).

---

## Idioma e estilo

- Responder e documentar em português (PT-BR).
- Código e identificadores técnicos em inglês, seguindo convenção da linguagem.
- Tom direto, sem preâmbulos. Markdown estruturado em respostas longas.

---

## Encerramento de entregas

Ao concluir entrega aprovada, após revisão e validação aplicáveis, encerrar com:

```
AGUARDANDO ACEITE FINAL DA CUSTOMIZAÇÃO
```