---
description: Iniciar fluxo SDD (Specify) para feature nova em projeto existente
agent: plan
---
Iniciar fluxo SDD para uma feature nova no projeto existente: $1

Usar a skill `tlc-spec-driven` com profundidade L1 ou L2 (auto-ajustar conforme complexidade).

PASSOS:

1. Classificar complexidade:
   - L0: alteração trivial → alterar direto, sem SDD
   - L1: feature pequena/média → SDD reduzido (Specify + Execute)
   - L2: mudança sensível (schema, Auth, RLS, pagamento, dado pessoal) → SDD completo

2. Se L0: fazer a alteração direta, informar arquivo alterado e validação.

3. Se L1 ou L2:
   a. DISCOVERY — Entender o pedido. Ler `.specs/projects/$1/STATE.md` se existir.
   b. Identificar domínio crítico via `rules/domain-routing.md` e ler regra aplicável.
   c. Criar feature em `.specs/projects/$1/features/$2/`
   d. PRD → Tech Decisions → SPEC → Tasks → Sprint Validator
   e. NÃO implementar até receber `APROVAR PLANO E INICIAR`

4. Registrar tudo no STATE.md do projeto.

Projeto: $1
Feature: $2