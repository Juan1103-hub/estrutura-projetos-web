# Código, Review e Testes

> Consolida: code-style + code-review + testing

---

## Convenções de Código

### Tipografia

- TODOS os textos usam Inter via `next/font/google`
- NUNCA usar `font-mono` para valores numéricos — usar Inter + `tabular-nums`
- `font-mono` SOMENTE para identificadores: CPF, CNPJ, barcode, sale ID

### Componentes Select (base-ui)

- Sempre usar controlled mode (`value` + `onValueChange`)
- Nunca `defaultValue` (não renderiza label do SelectItem)

### Formulários

- React Hook Form + Zod para validação
- Mensagens de erro inline (não `alert()`)
- Loading state durante submissão

### Números e Moeda

```tsx
// CORRETO
<span className="tabular-nums">
  R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
</span>
```

---

## Code Review

### Regra principal

Cada task L1 ou L2 passa por revisão proporcional ao risco **antes de iniciar a próxima task**. Não concluir L2 com achado Bloqueador ou Alto sem correção.

### Revisores por escopo

| Escopo | Revisor |
|---|---|
| Frontend/UI | `web-reviewer` |
| Backend, API, banco, Auth | `backend-reviewer` |
| L2 ou mudança sensível | Frontend + backend conforme escopo |

### Classificação de achados

| Severidade | Critério | Ação |
|---|---|---|
| **Bloqueador** | Falha funcional, vulnerabilidade, perda de dados | Corrigir antes de prosseguir |
| **Alto** | Violação de SPEC, regressão, segredo exposto | Corrigir antes de prosseguir |
| **Médio** | Má prática com impacto limitado | Corrigir ou justificar |
| **Baixo** | Estilo, convenção menor | Corrigir ou registrar débito |

### Checklist

1. Task e critérios de aceite atendidos
2. Apenas arquivos previstos alterados
3. Nenhum contrato/schema/permissão alterado sem previsão
4. Tratamento de erros adequado
5. Sem segredos ou dados sensíveis no código

---

## Testes

### Princípio fundamental

Testes derivam da **spec/critérios de aceite**, nunca do código já escrito.

### Tipos de teste

| Tipo | Framework | O que testar |
|---|---|---|
| Componente | Vitest + RTL | Renderização, interação, estados, acessibilidade |
| Integração | Vitest + MSW | Fluxos completos: navegação → submissão → resposta |
| E2E | Playwright | Login, CRUD principal, fluxo de pagamento |
| Acessibilidade | axe-core | Regras WCAG 2.1 AA |

### Convenções

- 1 arquivo de teste por componente/feature
- Fixtures dedicados, não dados inline
- Mock de APIs via MSW ou handlers dedicados
- Screenshots em pontos-chave para regressão visual
- Testes devem ser independentes e reproduzíveis
