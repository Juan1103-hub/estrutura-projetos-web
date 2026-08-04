-- Corrige a criação de tarefas via UI no Supabase.
--
-- O trigger `log_task_changes` (AFTER INSERT/UPDATE ON tasks) insere na tabela
-- `task_history`, mas essa tabela só tinha policy de SELECT. Quando o supervisor
-- cria uma tarefa pelo app, o trigger roda no contexto RLS do usuário e o Postgres
-- bloqueia com "new row violates row-level security policy for table task_history",
-- fazendo a criação inteira falhar (e o checklist nunca ser gravado).
--
-- A solução: permitir INSERT/UPDATE para o trigger. O `task_history` é um log de
-- auditoria gerado pelo sistema; qualquer usuário autenticado que participe da
-- tarefa pode ser registrado pelo trigger (o `user_id` vem da própria row da tasks).
-- A leitura continua restrita às tasks visíveis (policy de SELECT existente).

-- Idempotente: dropa as policies existentes antes de recriar.
DROP POLICY IF EXISTS "Users can insert task history via trigger" ON task_history;
DROP POLICY IF EXISTS "Users can update task history via trigger" ON task_history;

CREATE POLICY "Users can insert task history via trigger"
  ON task_history
  FOR INSERT
  WITH CHECK (
    -- O histórico é gravado pelo trigger a partir da task afetada; permitir a
    -- inserção para qualquer usuário autenticado (a tarefa em si já tem RLS).
    auth.uid() IS NOT NULL
  );

-- O trigger também registra UPDATE (status/prioridade/prazo/aprovação). Sem essa
-- policy, atualizar uma tarefa (ex: mover card de coluna) falharia do mesmo jeito.
CREATE POLICY "Users can update task history via trigger"
  ON task_history
  FOR UPDATE
  USING (
    task_visible_to(task_history.task_id, auth.uid())
  );

-- ---------------------------------------------------------------
-- Corrige o checklist no CREATE: a policy de INSERT de checklist_items só
-- permitia `task_visible_to` (responsável/solicitante). Quando o SUPERVISOR cria
-- uma tarefa e já informa o checklist, ele não é responsável — a inserção era
-- filtrada silenciosamente pelo RLS e os itens nunca eram gravados.
-- Solução: adicionar a exceção de supervisor à policy "Users can manage checklist
-- items for their tasks", usando WITH CHECK com a mesma checagem da policy
-- "Supervisors can create tasks" (usuário logado com role supervisor).
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage checklist items for their tasks" ON checklist_items;

CREATE POLICY "Users can manage checklist items for their tasks" ON checklist_items
  FOR ALL USING (
    task_visible_to(checklist_items.task_id, auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'supervisor'
    )
  );

-- ---------------------------------------------------------------
-- Corrige a recursão de RLS em `task_visible_to`: a função consulta `tasks`,
-- e era usada dentro da policy de SELECT de `tasks`. Quando o PostgREST/RLS
-- avaliava a policy, a subquery em `tasks` re-avaliava as policies de tasks,
-- chamando `task_visible_to` de novo → loop infinito → "stack depth limit
-- exceeded". Esse erro quebrava QUALQUER SELECT/INSERT em tasks como usuário
-- autenticado (o supervisor logado não conseguia ler nem criar nada).
-- Solução: marcar a função como SECURITY DEFINER (executa com privilégios do
-- owner, ignorando RLS) e fixar search_path para evitar escalada.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.task_visible_to(task_id uuid, uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_id
      AND (t.responsible_id = uid
        OR t.requester_id = uid
        OR uid = ANY(t.responsible_ids))
  );
$$;

REVOKE ALL ON FUNCTION public.task_visible_to(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.task_visible_to(uuid, uuid) TO authenticated, anon;
