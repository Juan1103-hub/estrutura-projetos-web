# Scripts de Automação

Scripts utilitários do workspace.

## scaffolding-project.ps1

Cria a estrutura completa de pastas e specs para um novo projeto web.

```powershell
.\scripts\scaffold-project.ps1 -Nome "meu-app" -Descricao "Sistema de gestao de tarefas"
```

O que faz:
- Cria `projects/<nome>/` com `.gitkeep` e `.env.example`
- Cria `.specs/projects/<nome>/` com `_template/` copiado
- Cria `.specs/projects/<nome>/STATE.md`
- Atualiza `.specs/STATE.md` (global) adicionando o projeto na tabela

## pre-commit-checks.ps1

Verifica antes de cada commit:
- `opencode.json` é JSON válido com `$schema`, `instructions`, `permission`
- Skills em `.opencode/skills/*/SKILL.md` têm frontmatter `name`+`description`
- Regras essenciais em `rules/` existem
- Nenhum segredo (service_role, sk-* API keys, .env) no stage

```powershell
# Rodar manualmente
.\scripts\pre-commit-checks.ps1

# Instalar como hook do git
.\scripts\pre-commit-checks.ps1 -Install
```

Após rodar com `-Install`, o git chama automaticamente antes de cada commit.

## Como configurar git hooks (alternativa)

Para usar este diretório como hooksPath:

```powershell
git config core.hooksPath scripts
# Copiar pre-commit-checks.ps1 para pre-commit (sem extensão) ou symlink
```

Ou simplesmente rodar manualmente antes de commits importantes.