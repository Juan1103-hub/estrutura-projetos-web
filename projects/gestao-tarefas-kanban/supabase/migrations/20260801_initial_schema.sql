-- Sistema de Gestão de Tarefas Kanban - Vórtice Mineral
-- Schema inicial do banco de dados

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('supervisor', 'almoxarife', 'comprador', 'assistente_administrativo');
CREATE TYPE task_status AS ENUM ('backlog', 'a_fazer', 'em_andamento', 'aguardando_terceiros', 'aguardando_aprovacao', 'concluido', 'cancelado');
CREATE TYPE task_priority AS ENUM ('baixa', 'media', 'alta', 'critica');
CREATE TYPE task_category AS ENUM (
  'almoxarifado_controle_estoque',
  'almoxarifado_inventario',
  'almoxarifado_cadastro_materiais',
  'almoxarifado_ajustes_saldo',
  'almoxarifado_recebimento',
  'almoxarifado_organizacao',
  'almoxarifado_controle_minmax',
  'compras_solicitacao',
  'compras_cotacao',
  'compras_negociacao',
  'compras_pedido',
  'compras_followup',
  'compras_contratacao',
  'administrativo_relatorios',
  'administrativo_indicadores',
  'administrativo_cadastros',
  'administrativo_processos',
  'administrativo_auditorias',
  'administrativo_controle_documental'
);

-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  responsible_id UUID NOT NULL REFERENCES users(id),
  -- Responsáveis adicionais (tarefa compartilhada entre várias pessoas).
  -- O responsável principal fica em responsible_id; os demais entram aqui.
  responsible_ids UUID[] DEFAULT '{}',
  requester_id UUID NOT NULL REFERENCES users(id),
  status task_status NOT NULL DEFAULT 'a_fazer',
  priority task_priority NOT NULL DEFAULT 'media',
  category task_category NOT NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  help_requested BOOLEAN DEFAULT FALSE,
  help_reason TEXT,
  reopen_requested BOOLEAN DEFAULT FALSE,
  reopen_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice GIN para buscas de responsabilidade (inclui multi-responsáveis).
CREATE INDEX idx_tasks_responsible_ids ON tasks USING GIN (responsible_ids);

-- Checklist items table
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task history table (audit log)
CREATE TABLE task_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_responsible ON tasks(responsible_id);
CREATE INDEX idx_tasks_requester ON tasks(requester_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_attachments_task ON attachments(task_id);
CREATE INDEX idx_task_history_task ON task_history(task_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_checklist_items_task ON checklist_items(task_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log task changes to history
CREATE OR REPLACE FUNCTION log_task_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO task_history (task_id, user_id, action)
    VALUES (NEW.id, NEW.requester_id, 'created');
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO task_history (task_id, user_id, action, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.responsible_id, 'status_changed', 'status', OLD.status::TEXT, NEW.status::TEXT);
    END IF;

    -- Log priority changes
    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
      INSERT INTO task_history (task_id, user_id, action, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.responsible_id, 'priority_changed', 'priority', OLD.priority::TEXT, NEW.priority::TEXT);
    END IF;

    -- Log due date changes
    IF OLD.due_date IS DISTINCT FROM NEW.due_date THEN
      INSERT INTO task_history (task_id, user_id, action, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.responsible_id, 'due_date_changed', 'due_date', OLD.due_date::TEXT, NEW.due_date::TEXT);
    END IF;

    -- Log approval
    IF OLD.approved_at IS NULL AND NEW.approved_at IS NOT NULL THEN
      INSERT INTO task_history (task_id, user_id, action)
      VALUES (NEW.id, NEW.approved_by, 'approved');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task history
CREATE TRIGGER log_task_changes AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_task_change();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Helper: o usuário logado participa da tarefa (responsável principal,
-- responsável adicional, ou solicitante).
CREATE OR REPLACE FUNCTION task_visible_to(task_id uuid, uid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_id
      AND (t.responsible_id = uid
        OR t.requester_id = uid
        OR uid = ANY(t.responsible_ids))
  );
$$ LANGUAGE sql STABLE;

-- Tasks policies
CREATE POLICY "Supervisors can view all tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'supervisor'
    )
  );

CREATE POLICY "Users can view their assigned tasks" ON tasks
  FOR SELECT USING (
    task_visible_to(id, auth.uid())
  );

CREATE POLICY "Supervisors can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'supervisor'
    )
  );

CREATE POLICY "Supervisors can update all tasks" ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'supervisor'
    )
  );

CREATE POLICY "Users can update their assigned tasks" ON tasks
  FOR UPDATE USING (
    responsible_id = auth.uid() OR auth.uid() = ANY(responsible_ids)
  );

CREATE POLICY "Supervisors can delete tasks" ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'supervisor'
    )
  );

-- Checklist items policies
CREATE POLICY "Users can view checklist items for their tasks" ON checklist_items
  FOR SELECT USING (
    task_visible_to(checklist_items.task_id, auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'supervisor'
    )
  );

CREATE POLICY "Users can manage checklist items for their tasks" ON checklist_items
  FOR ALL USING (
    task_visible_to(checklist_items.task_id, auth.uid())
  );

-- Comments policies
CREATE POLICY "Users can view comments on their tasks" ON comments
  FOR SELECT USING (
    task_visible_to(comments.task_id, auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'supervisor'
    )
  );

CREATE POLICY "Users can create comments on their tasks" ON comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND task_visible_to(comments.task_id, auth.uid())
  );

-- Attachments policies
CREATE POLICY "Users can view attachments on their tasks" ON attachments
  FOR SELECT USING (
    task_visible_to(attachments.task_id, auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'supervisor'
    )
  );

CREATE POLICY "Users can upload attachments to their tasks" ON attachments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND task_visible_to(attachments.task_id, auth.uid())
  );

-- Task history policies (read-only for users)
CREATE POLICY "Users can view history of their tasks" ON task_history
  FOR SELECT USING (
    task_visible_to(task_history.task_id, auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'supervisor'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);
