# Como Iniciar Projeto Novo

## Forma rápida (comando customizado)

```
/new-project meu-app "Sistema de gestão de tarefas"
```

O comando executa o fluxo SDD automaticamente.

## Forma manual

### 1. Confirmar stack e template

Antes de criar qualquer arquivo, concluir Discovery:
- Ler `templates/catalog.md` e `templates/README.md`
- Ler `rules/stack-selection.md`
- Identificar domínio crítico em `rules/domain-routing.md`
- Justificar template contra 2+ alternativas

### 2. Criar estrutura de specs

Usar o script de scaffolding (recomendado):
```powershell
.\scripts\scaffold-project.ps1 -Nome "meu-app" -Descricao "Sistema de gestao de tarefas"
```

Ou manualmente:
```powershell
Copy-Item -Path ".specs/_template/*" -Destination ".specs/projects/meu-app/" -Recurse
New-Item -ItemType File -Path ".specs/projects/meu-app/STATE.md" -Force
```

Preencher: `prd.md`, `tech-decisions.md`, `spec.md`, `tasks.md`, `sprint-validator.md`.

Atualizar `.specs/STATE.md` (global) adicionando projeto na tabela.

### 3. Aprovação

Apresentar plano consolidado. Aguardar:
```
APROVAR PLANO E INICIAR
```

### 4. Criar projeto

```powershell
# Escolher template
$template = "templates/full/next-shadcn-admin-dashboard"

# Criar pasta do projeto
New-Item -ItemType Directory -Path "projects/meu-app" -Force

# Copiar template
Copy-Item -Path "$template/*" -Destination "projects/meu-app/" -Recurse

# Não copiar .git, .env, segredos
```

### 5. Configurar projeto

Dentro de `projects/meu-app/`:
- Renomear no `package.json`
- Ajustar `tsconfig.json` paths
- Adicionar Supabase: `@supabase/supabase-js`, `@supabase/ssr`
- Configurar `.env.example` (sem valores reais)
- Rodar `impeccable init` (uma vez)
- Adicionar testes: `vitest`, `@testing-library/react`, `@playwright/test`

### 6. Implementar tasks

Uma task por vez → code review → commit → próxima task.