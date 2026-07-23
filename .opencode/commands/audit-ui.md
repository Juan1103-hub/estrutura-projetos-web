---
description: Auditar UI via skill impeccable (detect anti-patterns, a11y, contraste, touch targets)
agent: build
---
Executar auditoria de UI na página ou componente indicado.

PASSOS:

1. Carregar a skill `impeccable` via `skill(name="impeccable")`.
2. Ler `.opencode/rules/impeccable.md` para mapeamento de comandos.
3. Executar comando `audit`:
   - Se $1 for URL: abrir no browser (chrome-devtools ou playwright)
   - Se $1 for arquivo: analisar conteúdo
4. Verificar:
   - [ ] Anti-patterns Impeccable ausentes (gradient text, grid decorativo, etc)
   - [ ] Acessibilidade WCAG 2.1 AA (aria-label, contraste, touch targets)
   - [ ] Design tokens OKLCH aplicados
   - [ ] Inter + tabular-nums para valores
   - [ ] Nenhum emoji (Lucide icons)
   - [ ] prefers-reduced-motion se houver animação
5. Reportar achados por severidade.
6. Se houver correções: sugeri-las mas NÃO aplicar sem confirmação.

Alvo: $1