# Tasks: Sistema de Gestão de Tarefas Kanban - Vórtice Mineral

> feature: gestao-tarefas-kanban

## T-001 — Configurar projeto Next.js 16 com TypeScript e Tailwind v4 [concluida]
- Refs: US-006, US-009, US-023
- Arquivos: 
  - projects/gestao-tarefas-kanban/package.json
  - projects/gestao-tarefas-kanban/next.config.js
  - projects/gestao-tarefas-kanban/tsconfig.json
  - projects/gestao-tarefas-kanban/tailwind.config.js
  - projects/gestao-tarefas-kanban/.env.local.example
- Notas: Base do projeto com Next.js 16, React 19, TypeScript, Tailwind v4. Criar estrutura de pastas app router.

## T-002 — Configurar Supabase e criar schema do banco de dados [concluida]
- Refs: US-006, US-007, US-008, US-011, US-017
- Arquivos:
  - projects/gestao-tarefas-kanban/supabase/migrations/20260801_initial_schema.sql
  - projects/gestao-tarefas-kanban/lib/supabase/client.ts
  - projects/gestao-tarefas-kanban/lib/supabase/server.ts
- Notas: Tabelas users, tasks, comments, attachments, task_history, notifications. RLS habilitado em todas as tabelas. Dependência: T-001 concluída.

## T-003 — Instalar e configurar shadcn/ui com componentes base [concluida]
- Refs: US-009, US-019
- Arquivos:
  - projects/gestao-tarefas-kanban/components.json
  - projects/gestao-tarefas-kanban/components/ui/button.tsx
  - projects/gestao-tarefas-kanban/components/ui/card.tsx
  - projects/gestao-tarefas-kanban/components/ui/dialog.tsx
  - projects/gestao-tarefas-kanban/components/ui/input.tsx
  - projects/gestao-tarefas-kanban/components/ui/select.tsx
  - projects/gestao-tarefas-kanban/components/ui/badge.tsx
  - projects/gestao-tarefas-kanban/components/ui/avatar.tsx
  - projects/gestao-tarefas-kanban/components/ui/dropdown-menu.tsx
- Notas: Componentes básicos shadcn/ui. Dependência: T-001 concluída.

## T-004 — Implementar autenticação com Supabase Auth [concluida]

- Refs: US-006, AC-012, AC-013, AC-014
- Arquivos:
  - projects/gestao-tarefas-kanban/app/(auth)/login/page.tsx
  - projects/gestao-tarefas-kanban/app/(auth)/layout.tsx
  - projects/gestao-tarefas-kanban/lib/auth/session.ts
  - projects/gestao-tarefas-kanban/middleware.ts
  - projects/gestao-tarefas-kanban/types/auth.ts
- Notas: Tela de login, validação de credenciais, middleware de proteção de rotas. Dependência: T-002 concluída.

## T-005 — Criar sistema de perfis e permissões (RBAC) [concluida]

- Refs: US-006, AC-014
- Arquivos:
  - projects/gestao-tarefas-kanban/lib/auth/permissions.ts
  - projects/gestao-tarefas-kanban/lib/auth/roles.ts
  - projects/gestao-tarefas-kanban/hooks/use-permissions.ts
  - projects/gestao-tarefas-kanban/types/roles.ts
- Notas: Perfis: Supervisor, Almoxarife, Comprador, Assistente Administrativo. Controle de permissões por perfil. Dependência: T-004 concluída.

## T-006 — Criar tipos TypeScript para tarefas e entidades [concluida]
- Refs: US-007, US-009
- Arquivos:
  - projects/gestao-tarefas-kanban/types/task.ts
  - projects/gestao-tarefas-kanban/types/comment.ts
  - projects/gestao-tarefas-kanban/types/attachment.ts
  - projects/gestao-tarefas-kanban/types/notification.ts
  - projects/gestao-tarefas-kanban/types/category.ts
- Notas: Tipos completos para Task, Comment, Attachment, Notification, Category, Priority, Status, etc. Dependência: T-002 concluída.

## T-007 — Implementar ações de servidor para CRUD de tarefas [concluida]

- Refs: US-007, US-008, AC-015, AC-016, AC-017, AC-018, AC-019
- Arquivos:
  - projects/gestao-tarefas-kanban/app/actions/tasks.ts
  - projects/gestao-tarefas-kanban/lib/validations/task.ts
- Notas: Server Actions: createTask, updateTask, deleteTask, getTask, getTasks. Validação com Zod. Dependência: T-005 e T-006 concluídas.

## T-008 — Criar componente principal do quadro Kanban [concluida]
- Refs: US-009, AC-020, AC-021, AC-022
- Arquivos:
  - projects/gestao-tarefas-kanban/app/(dashboard)/kanban/page.tsx
  - projects/gestao-tarefas-kanban/components/kanban/board.tsx
  - projects/gestao-tarefas-kanban/components/kanban/column.tsx
  - projects/gestao-tarefas-kanban/components/kanban/card.tsx
  - projects/gestao-tarefas-kanban/lib/kanban/columns.ts
- Notas: Quadro Kanban com 7 colunas, cards com informações resumidas, contador de tarefas por coluna. Dependência: T-007 concluída.

## T-009 — Implementar drag and drop com @dnd-kit [concluida]
- Refs: US-010, AC-023, AC-024
- Arquivos:
  - projects/gestao-tarefas-kanban/components/kanban/board.tsx
  - projects/gestao-tarefas-kanban/components/kanban/draggable-card.tsx
  - projects/gestao-tarefas-kanban/components/kanban/droppable-column.tsx
  - projects/gestao-tarefas-kanban/app/actions/tasks.ts
- Notas: Drag and drop de cards entre colunas, validação de permissões. Dependência: T-008 concluída.

## T-010 — Criar modal de detalhes da tarefa [concluida]

- Refs: US-007, US-011, AC-017
- Arquivos:
  - projects/gestao-tarefas-kanban/components/tasks/task-modal.tsx
  - projects/gestao-tarefas-kanban/components/tasks/task-header.tsx
  - projects/gestao-tarefas-kanban/components/tasks/task-details.tsx
  - projects/gestao-tarefas-kanban/components/tasks/task-checklist.tsx
- Notas: Modal com todos os detalhes da tarefa, edição inline, checklist. Dependência: T-008 concluída.

## T-011 — Implementar sistema de comentários [concluida]

- Refs: US-011, AC-025
- Arquivos:
  - projects/gestao-tarefas-kanban/components/tasks/comments-section.tsx
  - projects/gestao-tarefas-kanban/components/tasks/comment-item.tsx
  - projects/gestao-tarefas-kanban/components/tasks/comment-form.tsx
  - projects/gestao-tarefas-kanban/app/actions/comments.ts
- Notas: Timeline de comentários, adicionar comentário, menção com @usuário. Dependência: T-010 concluída.

## T-012 — Implementar upload e listagem de anexos [concluida]

- Refs: US-011, AC-026
- Arquivos:
  - projects/gestao-tarefas-kanban/components/tasks/attachments-section.tsx
  - projects/gestao-tarefas-kanban/components/tasks/attachment-item.tsx
  - projects/gestao-tarefas-kanban/app/actions/attachments.ts
  - projects/gestao-tarefas-kanban/lib/storage/upload.ts
- Notas: Upload para Supabase Storage, listagem de anexos, download. Limite 10MB por arquivo. Dependência: T-010 concluída.

## T-013 — Implementar checklist de tarefas [concluida]

- Refs: US-007, US-011, AC-017, AC-027
- Arquivos:
  - projects/gestao-tarefas-kanban/components/tasks/checklist.tsx
  - projects/gestao-tarefas-kanban/components/tasks/checklist-item.tsx
  - projects/gestao-tarefas-kanban/app/actions/checklist.ts
- Notas: Adicionar/remover itens, marcar como concluído, progresso visual. Dependência: T-010 concluída.

## T-014 — Implementar aprovação e reprovação de tarefas [concluida]

- Refs: US-012, AC-028, AC-029
- Arquivos:
  - projects/gestao-tarefas-kanban/components/tasks/approval-section.tsx
  - projects/gestao-tarefas-kanban/app/actions/tasks.ts
- Notas: Botões aprovar/reprovar, justificativa de reprovação, movimentação de coluna. Dependência: T-010 concluída.

## T-015 — Criar sistema de notificações em tempo real [concluida]

- Refs: US-013, US-018, AC-030, AC-031, AC-042, AC-043
- Arquivos:
  - projects/gestao-tarefas-kanban/components/notifications/notification-bell.tsx
  - projects/gestao-tarefas-kanban/components/notifications/notification-list.tsx
  - projects/gestao-tarefas-kanban/components/notifications/notification-item.tsx
  - projects/gestao-tarefas-kanban/app/actions/notifications.ts
  - projects/gestao-tarefas-kanban/lib/notifications/realtime.ts
- Notas: Realtime via Supabase Realtime, notificações de nova tarefa, comentário, prazo. Dependência: T-007 concluída.

## T-016 — Implementar alertas de prazo e tarefas atrasadas [concluida]

- Refs: US-013, AC-030, AC-031
- Arquivos:
  - projects/gestao-tarefas-kanban/lib/tasks/deadlines.ts
  - projects/gestao-tarefas-kanban/components/kanban/card-indicators.tsx
  - projects/gestao-tarefas-kanban/app/api/cron/check-deadlines/route.ts
- Notas: Cálculo de prazos, indicadores visuais (laranja vence em breve, vermelho atrasada), cron job. Dependência: T-008 concluída.

## T-017 — Criar dashboard gerencial com indicadores [concluida]

- Refs: US-014, AC-032, AC-033, AC-034
- Arquivos:
  - projects/gestao-tarefas-kanban/app/(dashboard)/dashboard/page.tsx
  - projects/gestao-tarefas-kanban/components/dashboard/stats-cards.tsx
  - projects/gestao-tarefas-kanban/components/dashboard/productivity-chart.tsx
  - projects/gestao-tarefas-kanban/components/dashboard/completion-rate.tsx
  - projects/gestao-tarefas-kanban/app/actions/analytics.ts
- Notas: Cards de métricas, gráficos de produtividade, taxa de conclusão. Dependência: T-007 concluída.

## T-018 — Implementar indicadores por departamento [concluida]

- Refs: US-020, US-022, AC-046, AC-047, AC-050, AC-051
- Arquivos:
  - projects/gestao-tarefas-kanban/components/dashboard/department-stats.tsx
  - projects/gestao-tarefas-kanban/lib/analytics/department-metrics.ts
  - projects/gestao-tarefas-kanban/types/category.ts
- Notas: Métricas específicas por departamento (Almoxarifado, Compras, Administrativo). Dependência: T-017 concluída.

## T-019 — Criar sistema de filtros e pesquisa avançada [concluida]

- Refs: US-015, AC-035, AC-036, AC-037
- Arquivos:
  - projects/gestao-tarefas-kanban/components/kanban/filters.tsx
  - projects/gestao-tarefas-kanban/components/kanban/search-bar.tsx
  - projects/gestao-tarefas-kanban/hooks/use-filters.ts
  - projects/gestao-tarefas-kanban/lib/tasks/filters.ts
- Notas: Filtros por responsável, categoria, prioridade, período. Pesquisa por texto. Dependência: T-008 concluída.

## T-020 — Implementar exportação para Excel e PDF [concluida]

- Refs: US-016, AC-038, AC-039
- Arquivos:
  - projects/gestao-tarefas-kanban/components/export/export-button.tsx
  - projects/gestao-tarefas-kanban/app/api/export/excel/route.ts
  - projects/gestao-tarefas-kanban/app/api/export/pdf/route.ts
  - projects/gestao-tarefas-kanban/lib/export/excel.ts
  - projects/gestao-tarefas-kanban/lib/export/pdf.ts
- Notas: Exportação de tarefas em Excel, relatórios em PDF com gráficos. Usar xlsx e jspdf. Dependência: T-017 concluída.

## T-021 — Criar histórico completo de alterações (auditoria) [concluida]

- Refs: US-017, AC-040, AC-041
- Arquivos:
  - projects/gestao-tarefas-kanban/components/tasks/history-tab.tsx
  - projects/gestao-tarefas-kanban/components/tasks/history-item.tsx
  - projects/gestao-tarefas-kanban/lib/audit/track-changes.ts
  - projects/gestao-tarefas-kanban/app/actions/audit.ts
- Notas: Timeline de alterações, rastreamento de quem fez o quê e quando, trigger no banco. Dependência: T-010 concluída.

## T-022 — Implementar tema claro e escuro [concluida]

- Refs: US-019, AC-044, AC-045
- Arquivos:
  - projects/gestao-tarefas-kanban/components/theme/theme-provider.tsx
  - projects/gestao-tarefas-kanban/components/theme/theme-toggle.tsx
  - projects/gestao-tarefas-kanban/app/layout.tsx
  - projects/gestao-tarefas-kanban/lib/theme/use-theme.ts
- Notas: Theme Provider com next-themes, toggle claro/escuro, persistência de preferência. Dependência: T-003 concluída.

## T-023 — Implementar layout responsivo para tablet e mobile [concluida]

- Refs: US-023, AC-052, AC-053
- Arquivos:
  - projects/gestao-tarefas-kanban/components/kanban/board.tsx
  - projects/gestao-tarefas-kanban/components/kanban/mobile-board.tsx
  - projects/gestao-tarefas-kanban/components/layout/mobile-nav.tsx
  - projects/gestao-tarefas-kanban/app/globals.css
- Notas: Breakpoints responsivos, layout mobile simplificado, navegação mobile. Dependência: T-008 concluída.

## T-024 — Implementar funcionalidades de solicitar apoio e reabertura [concluida]

- Refs: US-021, AC-048, AC-049
- Arquivos:
  - projects/gestao-tarefas-kanban/components/tasks/request-help-button.tsx
  - projects/gestao-tarefas-kanban/components/tasks/reopen-request-button.tsx
  - projects/gestao-tarefas-kanban/app/actions/task-requests.ts
- Notas: Botões solicitar apoio e reabertura, justificativa, notificação ao supervisor. Dependência: T-010 concluída.

## T-025 — Criar testes E2E com Playwright [concluida]

- Refs: US-006, US-007, US-008, US-009, US-010, US-011, US-012, US-013, US-014, US-015, US-016, US-017, US-018, US-019, US-020, US-021, US-022, US-023
- Arquivos:
  - projects/gestao-tarefas-kanban/tests/auth.spec.ts
  - projects/gestao-tarefas-kanban/tests/kanban.spec.ts
  - projects/gestao-tarefas-kanban/tests/dashboard.spec.ts
  - projects/gestao-tarefas-kanban/tests/filters.spec.ts
  - projects/gestao-tarefas-kanban/playwright.config.ts
- Modelo: claude-sonnet-5
- Esforço: alto
- Notas: Testes E2E cobrindo todos os critérios de aceite com anotação @spec:AC-xxx. Dependência: todas as outras tarefas concluídas.
