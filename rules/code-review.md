# Revisão de Código

Regra curta obrigatória no `AGENTS.md`. Este arquivo detalha o processo de
revisão proporcional ao risco.

---

## Regra principal

Cada task L1 ou L2 deve passar por revisão proporcional ao risco **antes de
iniciar a próxima task**. Não concluir L2 com achado **Bloqueador** ou
**Alto** sem correção ou exceção aprovada explicitamente.

## Revisores por escopo

| Escopo da task | Revisor | Quando |
|---|---|---|
| Frontend/UI | `web-code-reviewer` (subagente) | Quando disponível |
| Backend, API, banco, Auth, Supabase | `backend-code-reviewer` (subagente) | Quando disponível |
| L2 ou mudança sensível | Frontend **e** backend, conforme escopo | Sempre |
| L1 | Auto-revisão estruturada + subagente quando disponível | Sempre |
| L0 | Auto-revisão guiada por checklist + validação focada | Sempre |

Se o subagente especializado não estiver disponível, executar auto-revisão
estruturada com o checklist abaixo e declarar a limitação.

## Classificação de achados

| Severidade | Critério | Ação |
|---|---|---|
| **Bloqueador** | Falha funcional, vulnerabilidade de segurança, perda de dados, violação crítica de acessibilidade | Corrigir antes de prosseguir |
| **Alto** | Violação de SPEC/critério de aceite, regressão, ausência de validação de autorização, segredo exposto | Corrigir antes de prosseguir |
| **Médio** | Má prática com impacto limitado, ausência de tratamento de erro secundário | Corrigir ou justificar |
| **Baixo** | Estilo, convenção menor, oportunidade de melhoria | Corrigir ou registrar débito |

## Checklist de revisão

1. A task e todos os critérios de aceite foram atendidos.
2. Apenas arquivos previstos foram alterados; sem escopo expandido.
3. Nenhum contrato, endpoint, API, schema ou permissão alterado sem previsão
   na SPEC e aprovação.
4. Sem regressões aparentes em fluxos existentes.
5. Estados de loading, vazio, sucesso e erro tratados quando aplicável.
6. Validações, permissões, autenticação e RLS preservados.
7. Sem código morto, duplicado, hardcoded indevido, segredo exposto ou log
   sensível.
8. Testes definidos executados — ou registrados como não executados, com
   motivo e evidência real do resultado.
9. Código segue os padrões do projeto (`rules/code-style.md`).
10. UI: acessibilidade verificada (`rules/accessibility.md`), anti-patterns
    Impeccable ausentes, validação no navegador quando ferramenta disponível.
11. Dependências novas, impactos de performance e acessibilidade avaliados
    quando aplicável.

## Resultado da revisão

Toda revisão deve retornar:

- Status: `APROVADO`, `REPROVADO` ou `APROVADO COM RESSALVAS`.
- Critérios de aceite avaliados, um por um.
- Arquivos revisados.
- Achados por severidade (Bloqueador/Alto/Médio/Baixo).
- Testes executados e resultado real.
- Próxima ação recomendada.

## Regra de continuidade

- `APROVADO` → task concluída, próxima liberada.
- `APROVADO COM RESSALVAS` → aguardar confirmação do usuário antes da próxima
  task.
- `REPROVADO` → criar task de correção pequena, corrigir somente o
  identificado e revisar novamente. Nunca iniciar a próxima task com a atual
  reprovada.
