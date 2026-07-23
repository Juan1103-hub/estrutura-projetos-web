# Workflow SDD — Specification-Driven Development

Fluxo obrigatório para todo projeto novo e mudanças L2 em projetos existentes.

## Visão geral

```
Discovery → PRD → PRD Validator → Tech Decisions → SPEC →
Spec Enricher → Planner → Sprint Validator → APROVAR PLANO E INICIAR →
Coder (1 task/commit) → Code Review → próxima task → Acceptance Review
```

## Etapas

### 1. Discovery
Entender problema, usuário, regras e objetivo.
- Fazer perguntas bloqueadoras via tool `question`.
- Ler `templates/catalog.md`, `rules/stack-selection.md`, `rules/domain-routing.md`.
- Se domínio crítico (estoque, segurança), ler regra especializada em `rules/`.
- NÃO gerar código.

### 2. PRD
Registrar requisitos, user stories, critérios de aceite.
- Salvar em `.specs/projects/<nome>/prd.md`.
- Use template em `.specs/_template/prd.md`.

### 3. PRD Validator
Identificar ambiguidades e perguntas bloqueadoras.
- Marcar como `[PENDENTE]` itens não resolvidos.

### 4. Tech Decisions
Definir decisões técnicas, alternativas, impactos.
- Salvar em `.specs/projects/<nome>/tech-decisions.md`.
- Justificar escolha de template contra 2+ alternativas.
- Se aplicável, criar `template-decision.md`.

### 5. SPEC
Detalhar tecnicamente a solução.
- Salvar em `.specs/projects/<nome>/spec.md`.
- Incluir: arquitetura, pastas, schema, API, UI/UX, edge cases.

### 6. Spec Enricher
Prever erros, edge cases, estados de UI, caminhos alternativos.
- Adicionar ao `spec.md`.

### 7. Planner
Dividir SPEC em tasks pequenas e ordenadas.
- Salvar em `.specs/projects/<nome>/tasks.md`.
- Uma task = um commit.
- Batches de 4-8 tasks.

### 8. Sprint Validator
Verificar cobertura, dependências, riscos, testes.
- Salvar em `.specs/projects/<nome>/sprint-validator.md`.
- Matriz de rastreabilidade: RF/US → Task → Teste.

### 9. Aprovação
```
AGUARDANDO APROVAÇÃO PARA INICIAR A IMPLEMENTAÇÃO
```
NÃO avançar sem `APROVAR PLANO E INICIAR` explícito do usuário.

### 10. Coder
Implementar UMA task por vez.
- Após cada task: code review.
- Se review reprovar: criar task-fix, corrigir, revisar novamente.
- Se review aprovar: próxima task.
- Commit atômico por task.

### 11. Code Review
Obrigatório após cada task.
- Frontend: `@web-reviewer`.
- Backend/Auth/DB: `@backend-reviewer`.
- Deploy: `@deploy-checker`.
- Resultado: APROVADO | REPROVADO | APROVADO COM RESSALVAS.

### 12. Acceptance Review
Ao final de todas as tasks:
- Comparar implementação vs PRD, Tech Decisions, SPEC, critérios.
- Matriz de rastreabilidade final.
- Status: pronto para publicar | com ressalvas | não pronto.

## Classificação de complexidade (projetos existentes)

| Nível | Critério | Fluxo |
|---|---|---|
| L0 | Trivial, sem mudança de comportamento | Alterar direto, sem SDD |
| L1 | Feature pequena/média | SDD reduzido (Specify + Execute) |
| L2 | Sensível: schema, Auth, RLS, pagamento | SDD completo + regra de domínio |

## Comandos customizados

- `/new-project <nome> "<descrição>"` — Inicia SDD completo
- `/sdd-start <projeto> <feature>` — Inicia feature em projeto existente
- `/audit-ui <arquivo|url>` — Auditoria Impeccable
- `/deploy-check <projeto>` — Checklist de deploy

## Recuperação de sessão

Se contexto for perdido, ver `rules/session-recovery.md`.
Sempre ler `.specs/projects/<nome>/STATE.md` ao retomar trabalho.