# UI/UX e Frontend

> Consolida: design-tokens + accessibility

---

## Design Tokens

### Paleta

- Usar OKLCH para cores (melhor perceptual)
- Definir tokens CSS customizados no `globals.css`
- Modo light + dark obrigatório

### Tipografia

- Inter como fonte padrão via `next/font/google`
- Escala: 12, 14, 16, 18, 20, 24, 30, 36px
- `tabular-nums` para valores numéricos

### Espaçamento

- Base 4px (multiplos de 4: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
- Consistência entre componentes

### Contraste

- Texto principal: mínimo 4.5:1 (WCAG AA)
- Texto grande: mínimo 3:1
- Componentes interativos: mínimo 3:1

---

## Acessibilidade (WCAG 2.1 AA)

### Obrigatório

- Todos os elementos interativos acessíveis via teclado
- `aria-label` em botões e links sem texto visível
- `role` apropriado em elementos customizados
- Contraste mínimo 4.5:1 para texto
- Touch targets mínimo 44x44px

### Formulários

- Labels associados via `htmlFor`/`id`
- Mensagens de erro com `aria-describedby`
- Campos obrigatórios com `aria-required`
- Feedback de sucesso/erro acessível

### Navegação

- Skip link para pular para conteúdo principal
- Focus ring visível em todos os elementos interativos
- Ordem de tabulação lógica
- `aria-current="page"` no link ativo

### Componentes shadcn/ui

- Usar componentes shadcn/ui como base (já têm acessibilidade built-in)
- Não remover aria props dos componentes
- Testar com screen reader (VoiceOver/NVDA)

### Validação

```bash
# Verificar com axe-core
npx @axe-core/cli https://localhost:3000
```

- Zero erros de acessibilidade antes de merge
- Avisos documentados e justificados

---

## Comunicação com o Usuário

### NUNCA usar alert() ou confirm()

- Usar componentes Modal/Dialog para confirmações
- Usar Toast/Snackbar para notificações
- Mensagens de erro inline nos formulários

### Formato de Datas e Números

- Datas: formato brasileiro `dd/mm/aaaa`
- Hora: formato brasileiro `HH:mm`
- Números: separador de milhar com ponto, decimal com vírgula
- Moeda: `R$ 1.234,56` (padrão brasileiro)
- Respeitar fuso horário do Brasil (UTC-3)
