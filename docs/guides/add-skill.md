# Como Adicionar Skill ao Workspace

## Local correto

Skills project-local vivem em `.opencode/skills/<nome>/SKILL.md`.

OpenCode busca skills em (ordem):
1. `.opencode/skills/<nome>/SKILL.md`
2. `~/.config/opencode/skills/<nome>/SKILL.md`
3. `.claude/skills/<nome>/SKILL.md`
4. `~/.claude/skills/<nome>/SKILL.md`
5. `.agents/skills/<nome>/SKILL.md`
6. `~/.agents/skills/<nome>/SKILL.md`

## Regras do frontmatter

Obrigatório:
- `name` — deve match `^[a-z0-9]+(-[a-z0-9]+)*$`, 1-64 chars, deve match nome da pasta
- `description` — 1-1024 chars, específica suficiente para IA escolher corretamente

Opcional:
- `license`
- `compatibility`
- `metadata` (map string→string)

## Passo a passo

```powershell
# 1. Criar pasta
New-Item -ItemType Directory -Path ".opencode/skills/minha-skill" -Force

# 2. Criar SKILL.md
# Ver `.opencode/skills/tlc-spec-driven/SKILL.md` como exemplo de estrutura
```

SKILL.md mínimo:
```markdown
---
name: minha-skill
description: Descrição específica do que a skill faz e quando usar.
---

## O que faz
- item 1
- item 2

## Quando usar
- condição 1
```

## Validação

1. `SKILL.md` em caixa alta (não `skill.md`)
2. Frontmatter com `name` e `description`
3. `name` match nome da pasta
4. Nome único em todos os locations

## Permissões

Por padrão, skills são `allow` (config em `opencode.json`):
```json
"permission": { "skill": { "*": "allow" } }
```

Para restringir:
```json
"permission": {
  "skill": {
    "*": "allow",
    "internal-*": "deny",
    "experimental-*": "ask"
  }
}
```