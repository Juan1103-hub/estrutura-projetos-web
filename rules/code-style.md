# Code Style — Padrões de Código

Padrões de código e convenções para projetos web Next.js + TypeScript.

---

## Tipografia

### Inter como padrão

- TODOS os textos usam Inter via `next/font/google`
- NUNCA usar `font-mono` para valores numéricos — usar Inter + `tabular-nums`
- `font-mono` SOMENTE para identificadores: CPF, CNPJ, barcode, sale ID

### Padrão de numeração

```tsx
// CORRETO: Inter + tabular-nums para valores
<span className="tabular-nums">
  R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
</span>

// ERRADO: font-mono para valores
<span className="font-mono">R$ 45.00</span>
```

## Componentes Select (base-ui)

### Sempre usar controlled mode

```tsx
// CORRETO: value + onValueChange
<Select
  value={field.value}
  onValueChange={field.onChange}
  disabled={isLoading}
>

// ERRADO: defaultValue não renderiza label do SelectItem
<Select
  onValueChange={field.onChange}
  defaultValue={field.value}
  disabled={isLoading}
>
```

## Forms com react-hook-form

### Sempre wrapper Form

```tsx
// CORRETO: Form wrapper obrigatório
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    {/* campos */}
  </form>
</Form>

// ERRADO: useFormContext retorna null sem wrapper
<form onSubmit={form.handleSubmit(onSubmit)}>
  {/* campos */}
</form>
```

## Ícones

- TODOS os ícones via Lucide React — NUNCA emojis no código
- Botões de ação: tamanho `h-4 w-4` ou `h-5 w-5`
- Botões icon-only: SEMPRE com `aria-label` para acessibilidade

## Acessibilidade

### aria-label obrigatório em botões de ação

```tsx
// CORRETO
<Button onClick={handleEdit} aria-label="Editar">
  <Pencil className="h-4 w-4" />
</Button>

// ERRADO: botão sem label para screen reader
<Button onClick={handleEdit}>
  <Pencil className="h-4 w-4" />
</Button>
```

### Toasts e notificações

- Usar `sonner` (já instalado) para feedback visual
- NUNCA usar `alert()`, `window.confirm()` ou `window.prompt()`
- Toasts: sucesso (verde), erro (vermelho), info (azul)

## zod

### Validação de enums (zod v4)

```tsx
// CORRETO: message em vez de required_error
z.enum(["entry", "exit"], {
  message: "Selecione o tipo de movimentação",
})

// ERRADO (zod v3): required_error não existe no v4
z.enum(["entry", "exit"], {
  required_error: "Selecione o tipo",
})
```

## Imports

- Imports absolutos via alias `@/*` (configurado em `tsconfig.json`), evitar `../../../`
- Ordem: bibliotecas externas → aliases internos (`@/components`, `@/lib`) → imports relativos → estilos
- Um import por linha; evitar `import * as X`

> Nota: este arquivo cobre exclusivamente projetos web (Next.js/React/TS).
