import { defineConfig } from "vitest/config"
import path from "node:path"

// Config do projeto gestao-tarefas-kanban.
// O alias "@/..." aponta para a raiz do projeto (espelha o tsconfig),
// permitindo testar os módulos do app (ex: app/actions/comments).
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.js", "test/**/*.spec.test.js", "../../test/**/*.spec.test.js"],
  },
})