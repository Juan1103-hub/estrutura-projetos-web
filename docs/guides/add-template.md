# Como Adicionar Template ao Workspace

## Local correto

- **Templates completos** (com `package.json`, prontos para clone): `templates/full/<nome>/`
- **Snippets** (blocos reutilizáveis sem `package.json`): `templates/snippets/<nome>/`

## Template completo

Requisitos:
- `package.json` funcional
- `README.md` explicando stack e uso
- `AGENTS.md` próprio (opcional mas recomendado — acelera onboarding do agente)
- Sem `.git`, `.env`, segredos, dados mockados reais

Passo a passo:
```powershell
# 1. Clonar ou copiar template para templates/full/
Copy-Item -Path "<origem>/*" -Destination "templates/full/novo-template/" -Recurse

# 2. Limpar
Remove-Item -Path "templates/full/novo-template/.git" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "templates/full/novo-template/.env" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "templates/full/novo-template/node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Garantir .env.example (sem valores reais)
# 4. Adicionar entrada em templates/catalog.md
```

## Snippet

Requisitos:
- Sem `package.json`, sem node_modules
- Apenas arquivos de código reutilizáveis
- `README.md` explicando o que é e como usar

```powershell
New-Item -ItemType Directory -Path "templates/snippets/novo-snippet" -Force
# Adicionar arquivos .tsx, .ts, .html, .css, .js
```

## Atualizar catálogo

Após adicionar, editar `templates/catalog.md`:
- Templates completos: adicionar linha na tabela apropriada
- Snippets: adicionar na seção correspondente

## Atualizar `docs/guides/add-template.md`

Este próprio arquivo. Manter consistente com estrutura atual.