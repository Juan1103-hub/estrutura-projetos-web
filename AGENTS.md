# AGENTS.md — Workspace de Projetos Web

Roteador global. Curto por design: cada seção manda ler um arquivo
contextual quando aplicável — **referências não carregam automaticamente,
você deve abri-las e ler até o fim antes de planejar ou implementar.**

Escopo: HTML, CSS, JavaScript/TypeScript, React, Next.js, Node.js, APIs,
Supabase/Postgres, autenticação e segurança web. **Não se aplica** a
projetos ADVPL, TLPP, Protheus, APSDU ou rotinas TOTVS — esses têm
workspace e AGENTS.md próprios, separados deste.

---

## 1. Precedência de instruções

1. Instrução explícita do usuário na conversa atual.
2. Este `AGENTS.md`.
3. Regras em `rules/` aplicáveis ao contexto.
4. Skills específicas (`skills/*/SKILL.md`).
5. Skills gerais.

Código e configuração reais do projeto prevalecem sobre documentação
desatualizada. Nunca ignorar requisito explícito do usuário com base em
uma skill ou regra.

## 2. Regra máxima — todo projeto novo

**Nenhum projeto novo começa por código, template, dependência, schema,
Auth ou UI.**

Todo projeto novo inicia obrigatoriamente pela skill `tlc-spec-driven`:

```
Discovery → PRD → decisões técnicas → SPEC → planejamento →
Sprint Validator → APROVAR PLANO E INICIAR
```

Não avançar para implementação sem receber exatamente
`APROVAR PLANO E INICIAR` do usuário.

Durante Discovery/decisões técnicas, ler obrigatoriamente:

- `templates/catalog.md` — para escolher o perfil/template adequado
- `rules/stack-selection.md` — regras de seleção e bloqueio de stacks incompatíveis
- `rules/domain-routing.md` — para identificar se o projeto tem domínio crítico (estoque, financeiro, dados pessoais) que exige regra especializada

## 3. Classificação de tarefas (somente projetos existentes)

Projeto novo nunca é L0/L1 — sempre passa pelo fluxo da seção 2.
Em manutenção de projeto existente, classificar antes de agir:

| Nível | Critério | Fluxo |
|---|---|---|
| **L0** | Alteração trivial, sem mudança de comportamento/layout/schema | Alterar direto, sem PRD/SPEC. Informar arquivo alterado e validação |
| **L1** | Feature pequena/média, poucos arquivos, sem decisão arquitetural nova | `tlc-spec-driven` com profundidade reduzida (Specify + Execute) |
| **L2** | Mudança sensível: schema, Auth, RLS, pagamento, integração, dado pessoal | `tlc-spec-driven` completo, ler `rules/domain-routing.md` e regra de domínio aplicável |

## 4. Seleção de stack e template

Para projeto novo, ler `rules/stack-selection.md` durante o planejamento,
antes de copiar qualquer template. Nunca carregar simultaneamente regras
de perfis incompatíveis (ex.: `rules/static-html-css-js.md` e
`rules/nextjs-app.md` no mesmo projeto).

Perfis disponíveis em `rules/`: `web-project.md` (geral),
`nextjs-app.md`, `nextjs-dashboard.md`, `react-vite.md`,
`static-html-css-js.md`. Cada um define stack, estrutura de pastas e
gotchas do próprio perfil.

## 5. Domínios críticos

Antes de concluir Discovery ou criar PRD, decisões técnicas, schema,
RLS, SPEC ou plano, identificar o domínio de negócio da solicitação.

Se existir regra especializada em `rules/` para esse domínio, **lê-la
obrigatoriamente** e seguir sua checklist antes de decidir. Ver
`rules/domain-routing.md` para o mapa de palavras-gatilho → regra.

Hoje cobertos: estoque/inventário/movimentações
(`rules/inventory-domain.md`). Sem regra especializada ainda:
financeiro/pagamentos, LGPD/dados pessoais, integrações externas —
nesses casos, aplicar `rules/security-secrets.md` e pedir confirmação
explícita de premissas antes de decidir.

## 6. Segurança — resumo obrigatório

- Nunca expor `service_role`, tokens, segredos ou valores reais de `.env`.
- RLS obrigatório em toda tabela exposta ao cliente.
- Validação e autorização sempre no servidor e/ou banco — nunca apenas na UI.
- Migrations destrutivas exigem backup, plano de rollback e aprovação explícita antes de executar.

Detalhes operacionais completos em `rules/security-secrets.md`. Checklist
de go-live em `DEPLOY.md`.

## 7. UI e frontend — Impeccable como padrão

Para UI web nova ou alteração visual relevante, usar **Impeccable** como
estratégia padrão: carregar a skill `impeccable` e ler
`.opencode/rules/impeccable.md` antes de implementar. Executar
`impeccable init` apenas uma vez por projeto, no bootstrap, antes da
primeira tela relevante — não no fim.

Padrões visuais transversais (tokens, tipografia, contraste, ícones) em
`rules/design-tokens.md` e `rules/accessibility.md`.

## 8. Revisão de código

Cada task L1 ou L2 deve passar por revisão proporcional ao risco antes
da próxima task. Para UI usar `web-code-reviewer`; para backend, banco,
Auth ou Supabase usar `backend-code-reviewer`, quando disponíveis. Não
concluir L2 com achado Bloqueador ou Alto sem correção ou exceção
aprovada. Detalhes e checklist completo em `rules/code-review.md`.

## 9. Ferramentas, MCPs e fallback

Antes de exigir ou usar skill, subagente, MCP, navegador ou comando:
verificar disponibilidade, usar se existir, ou executar validação
manual equivalente e declarar a limitação. **Nunca declarar sucesso de
ferramenta não executada.** Detalhes em `rules/tools-fallback.md`.

## 10. Recuperação de sessão

Se ocorrer falha de streaming, compactação, contexto insuficiente,
mudança de modelo ou qualquer erro que comprometa a continuidade,
interromper e seguir `rules/session-recovery.md` antes de retomar.
"continue" nunca autoriza mudar de projeto, escopo ou fase sem
confirmar o estado persistido.

## 11. Memória e retomada

Sempre ler `.specs/STATE.md` (Decisions + Handoff) ao retomar trabalho
em uma feature, antes de propor o próximo passo. `memory.md` guarda
estado geral do workspace (stack padrão, pendências ativas, decisões de
arquitetura aprovadas).

## 12. Perguntas ao usuário

Decisão, confirmação ou dado faltante: usar a ferramenta de perguntas
estruturadas. Nunca fazer perguntas bloqueadoras em texto puro. Exceção:
perguntas triviais (nome de arquivo, por exemplo).

## 13. Escopo e idioma

- Responder e documentar em português (PT-BR).
- Código e identificadores técnicos em inglês, seguindo convenção da linguagem.
- Tom direto, sem preâmbulos. Markdown estruturado em respostas longas.

## 14. Encerramento de entregas

Ao concluir uma entrega aprovada, após revisão e validação aplicáveis,
encerrar com:

```
AGUARDANDO ACEITE FINAL DA CUSTOMIZAÇÃO
```
