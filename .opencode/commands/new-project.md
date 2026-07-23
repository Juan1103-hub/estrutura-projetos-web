---
description: Iniciar novo projeto web com fluxo SDD completo (Discovery → PRD → SPEC → Plano → Aprovação)
agent: plan
---
Iniciar o fluxo SDD para um novo projeto web conforme `AGENTS.md` e a skill `tlc-spec-driven`.

ETAPAS OBRIGATÓRIAS (não pular nenhuma):

1. DISCOVERY — Entender problema, usuário, regras e objetivo. Fazer perguntas bloqueadoras via tool `question`.
   Antes de concluir, ler obrigatoriamente:
   - `templates/catalog.md` — para escolher template
   - `rules/stack-selection.md` — regras de stack
   - `rules/domain-routing.md` — identificar domínio crítico

2. PRD — Registrar requisitos, user stories, critérios de aceite. Salvar em `.specs/projects/$1/prd.md`.

3. PRD VALIDATOR — Identificar ambiguidades e perguntas bloqueadoras.

4. TECH DECISIONS — Definir decisões técnicas, alternativas, impactos. Salvar em `.specs/projects/$1/tech-decisions.md`.

5. SPEC — Detalhar tecnicamente a solução. Salvar em `.specs/projects/$1/spec.md`.

6. SPEC ENRICHER — Prever erros, edge cases, estados de UI, caminhos alternativos.

7. PLANNER — Dividir SPEC em tasks pequenas e ordenadas. Salvar em `.specs/projects/$1/tasks.md`.

8. SPRINT VALIDATOR — Verificar cobertura, dependências, riscos, testes. Salvar em `.specs/projects/$1/sprint-validator.md`.

CRIAR `.specs/projects/$1/STATE.md` com Decisions + Handoff ao final.

Antes de criar arquivos, clonar `.specs/_template/` para `.specs/projects/$1/`.

NÃO gerar código até receber `APROVAR PLANO E INICIAR`.

Nome do projeto: $1
Descrição inicial: $2