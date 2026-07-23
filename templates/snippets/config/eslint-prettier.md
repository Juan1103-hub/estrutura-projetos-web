# ESLint + Prettier — Configuração do Workspace
#
# No projeto, criar:
#   npm install -D eslint @eslint/js typescript-eslint prettier eslint-config-prettier
#
# Copiar os arquivos .eslintrc.json e .prettierrc para a raiz do projeto.

## .eslintrc.json

```json
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "ignorePatterns": ["node_modules/", "dist/", ".next/"]
}
```

## .prettierrc

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

## Como usar

No `package.json` do projeto, adicionar scripts:

```json
{
  "scripts": {
    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,json}\""
  }
}
```

## Regras importantes

- NUNCA usar `console.log` em produção — usar `console.warn` ou `console.error`
- Sempre `no-console` como warn
- `@typescript-eslint/no-explicit-any` como warn (evitar `any`)
- Prettier SEMI=false (sem ponto e vírgula)
- Prettier singleQuote=true (aspas simples)
