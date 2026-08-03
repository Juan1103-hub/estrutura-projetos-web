# Configuração do Supabase

Este guia explica como configurar o banco de dados Supabase para o sistema.

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Project Name**: gestao-tarefas-kanban
   - **Database Password**: (escolha uma senha forte)
   - **Region**: South America (São Paulo) - mais próximo do Brasil
5. Clique em "Create new project"
6. Aguarde ~2 minutos até o projeto ser provisionado

## 2. Copiar Credenciais

Após o projeto ser criado:

1. No dashboard do Supabase, vá em **Settings** > **API**
2. Copie os valores:
   - **Project URL** (exemplo: `https://xxxx.supabase.co`)
   - **anon public** key (chave pública)
   - **service_role** key (chave de serviço - **NUNCA exponha no client!**)

3. Crie o arquivo `.env.local` na raiz do projeto e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3004
```

## 3. Executar Migration (Criar Schema)

Há duas formas de executar a migration:

### Opção A: Via Dashboard do Supabase (Recomendado)

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Abra o arquivo [supabase/migrations/20260801_initial_schema.sql](supabase/migrations/20260801_initial_schema.sql)
4. Copie TODO o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em "Run" (ou pressione Ctrl+Enter)
7. Verifique se executou sem erros

### Opção B: Via Supabase CLI (Avançado)

Se preferir usar a CLI do Supabase:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Linkar ao projeto (você será solicitado a escolher o projeto)
supabase link

# Executar a migration
supabase db push
```

## 4. Verificar Instalação

Após executar a migration:

1. No dashboard do Supabase, vá em **Table Editor**
2. Verifique se as seguintes tabelas foram criadas:
   - `users`
   - `tasks`
   - `checklist_items`
   - `comments`
   - `attachments`
   - `task_history`
   - `notifications`

## 5. Criar Usuários de Teste (Opcional)

Para testar o sistema, você pode criar usuários manualmente:

1. No dashboard do Supabase, vá em **Authentication** > **Users**
2. Clique em "Add user"
3. Preencha e-mail e senha
4. Após criar, vá em **Table Editor** > **users**
5. Clique em "Insert" > "Insert row"
6. Preencha:
   - `id`: (copie o UUID do usuário criado em Authentication)
   - `email`: (mesmo e-mail do usuário)
   - `full_name`: Nome completo
   - `role`: Escolha entre:
     - `supervisor` (acesso total)
     - `almoxarife` (acesso limitado)
     - `comprador` (acesso limitado)
     - `assistente_administrativo` (acesso limitado)

## Schema do Banco

O schema completo inclui:

- **users**: Usuários do sistema (estende Supabase Auth)
- **tasks**: Tarefas do Kanban
- **checklist_items**: Itens de checklist das tarefas
- **comments**: Comentários nas tarefas
- **attachments**: Anexos das tarefas
- **task_history**: Histórico de alterações (auditoria)
- **notifications**: Notificações em tempo real

### Perfis de Usuário

- **supervisor**: Acesso completo (criar, editar, excluir tarefas, aprovar/reprovar)
- **almoxarife**: Ver e atualizar apenas suas tarefas
- **comprador**: Ver e atualizar apenas suas tarefas
- **assistente_administrativo**: Ver e atualizar apenas suas tarefas

### Políticas de Segurança (RLS)

Todas as tabelas têm Row Level Security (RLS) habilitado:

- Supervisores veem todas as tarefas
- Colaboradores veem apenas suas tarefas (onde são responsáveis ou solicitantes)
- Usuários só podem editar tarefas atribuídas a eles
- Histórico e notificações respeitam as permissões das tarefas relacionadas

## Próximos Passos

Após configurar o Supabase:

1. Reinicie o servidor de desenvolvimento: `npm run dev`
2. O sistema estará pronto para implementar as features de autenticação e Kanban
