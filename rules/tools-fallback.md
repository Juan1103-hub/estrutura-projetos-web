# Ferramentas, MCPs e Fallback

Regra curta obrigatória no `AGENTS.md`. Este arquivo detalha a verificação de
disponibilidade e o fallback manual de ferramentas, MCPs, skills, subagentes e
integrações.

---

## Regra principal

Antes de exigir ou usar skill, subagente, MCP, navegador, comando ou
integração:

1. Verificar se está disponível no ambiente.
2. Usar a ferramenta quando disponível e adequada.
3. Se indisponível, executar a melhor validação manual possível.
4. Declarar claramente a limitação e a validação não automatizada.
5. **Nunca declarar sucesso de ferramenta não executada.**

## Skills

- Skills são acionadas por intenção e contexto, nunca apenas pela presença
  isolada de uma palavra.
- Antes de usar uma skill, verificar se ela existe no ambiente (lista de
  skills disponíveis) e ler suas instruções.
- Se a skill não existir, executar o equivalente manual e declarar a limitação.
  Ex.: `tlc-spec-driven` indisponível → reproduzir manualmente Specify,
  Design, Tasks, Execute; `impeccable` indisponível → validação visual manual
  com checklist de acessibilidade e anti-patterns.

## MCPs e navegador

- `chrome-devtools` e Playwright são desejáveis para validação de UI (console,
  rede, screenshots).
- Indisponibilidade não bloqueia entregas L0/L1 de baixo risco, mas deve ser
  informada.
- Para projeto novo e L2: indisponibilidade de ferramenta crítica exige
  validação manual equivalente, registro da limitação e aprovação explícita
  quando o risco residual for alto.

## Subagentes

- `web-code-reviewer` e `backend-code-reviewer` são desejáveis para revisão
  proporcional ao risco (ver `rules/code-review.md`).
- Se indisponíveis, executar auto-revisão estruturada com o checklist de
  revisão e declarar a limitação.

## Comandos e CLIs

- Antes de exigir comando (`node`, `npx`, `impeccable`, etc.), verificar
  disponibilidade no ambiente.
- Nunca instalar dependências ou ferramentas fora do diretório de trabalho
  sem confirmação do usuário.
- Se o comando falhar, investigar com evidências (logs, exit code) antes de
  propor correção.

## Context7 e documentação

- Context7 MCP é desejável para documentação atualizada de bibliotecas.
- Se indisponível, consultar documentação oficial via web e declarar a fonte.
