---
description: Executar checklist completo de deploy contra DEPLOY.md
agent: build
---
Executar validação completa de deploy usando o subagente @deploy-checker.

O subagente deve:
1. Ler `DEPLOY.md` completo
2. Verificar cada item do checklist contra o projeto atual
3. Reportar status: PRONTO | COM RESSALVAS | NÃO PRONTO
4. Listar pendências bloqueadoras e não bloqueadoras
5. Sugerir próximas ações

Se o projeto estiver em `projects/$1`, trabalhar dentro dessa pasta.
Se não houver argumento, usar o projeto ativo em `.specs/projects/`.

Projeto: $1