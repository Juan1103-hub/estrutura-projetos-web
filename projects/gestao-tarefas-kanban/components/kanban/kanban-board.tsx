'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskWithRelations, TaskStatus, TASK_STATUS_LABELS } from '@/types/task';
import { TaskCard } from './task-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTasks } from '@/lib/mock-data';
import { KanbanColumn } from './kanban-column';
import { DraggableTaskCard } from './draggable-task-card';
import { TaskModal } from '@/components/task-modal/task-modal';
import { FiltersBar } from './filters';
import { filterTasks, uniqueResponsibles, TaskFilters } from '@/lib/tasks/filters';
import { canTransition } from '@/lib/tasks/transitions';
import { updateTask } from '@/app/actions/tasks';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useNotifications } from '@/hooks/use-notifications';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { getStoredUser } from '@/components/auth/login-form';
import { visibleTasks, canModifyTask, can, ROLE_LABELS } from '@/lib/auth/roles';
import { LogOut, Plus, Users, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExportButton } from '@/components/export/export-button';
import { useResponsive } from '@/hooks/use-responsive';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';
import { CreateTaskModal } from '@/components/task-modal/create-task-modal';
import { getSessionTasks } from '@/app/actions/tasks';
import { logout } from '@/app/actions/auth';

const columns: TaskStatus[] = [
  'backlog',
  'a_fazer',
  'em_andamento',
  'aguardando_terceiros',
  'aguardando_aprovacao',
  'concluido',
  'cancelado',
];

export function KanbanBoard() {
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskWithRelations[]>(mockTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragRejected, setDragRejected] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({});
  const notifications = useNotifications();
  const router = useRouter();
  const { stack: responsiveStack } = useResponsive();
  // Usuário logado (modo demo). Se ninguém logou, assume supervisor para
  // a demonstração não ficar bloqueada.
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  // `mounted` evita mismatch de hydration: no servidor o `sessionUser` é o
  // fallback (sem localStorage), mas no client vem do localStorage. Enquanto
  // não montar, usamos o mesmo fallback para renderizar identicamente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const sessionUser =
    currentUser ?? { id: 'demo-sup', name: 'Maria Santos', role: 'supervisor', roleLabel: 'Supervisor', email: 'supervisor@vortice.com' };
  // Durante a hidratação (não montado), exibe como supervisor neutro para que
  // servidor e client renderizem o MESMO header. Após o mount, usa o usuário real.
  // `loggingOut` segura o re-render do header com o fallback ("flash de outro
  // login") enquanto a navegação para /login não completa.
  // Durante a hidratação (mounted=false), exibe um perfil NEUTRO (sem papel
  // de supervisor) para que servidor e client renderizem o MESMO header SEM
  // revelar botões de supervisor para um funcionário. Se o fallback fosse
  // 'supervisor', um almoxarife veria "Nova Tarefa/Usuários" por um instante
  // antes do mount (flash da tela do supervisor).
  const displayUser =
    loggingOut
      ? { id: 'demo-sup', name: 'Saindo...', role: 'almoxarife' as const, roleLabel: '', email: '' }
      : mounted
        ? sessionUser
        : { id: 'demo-sup', name: 'Carregando...', role: 'almoxarife' as const, roleLabel: '', email: '' };
  // No SSR o useResponsive assume desktop (1024px); no mobile o client calcula
  // stack=true. Aplicar `stack` real só após o mount evita o hydration mismatch
  // das colunas (servidor renderiza horizontal, client renderiza vertical).
  const stack = mounted ? responsiveStack : false;

  // Só desloga após confirmação (AC: "deseja sair?"). Evita saída acidental.
  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('kanban_session_user');
      // Remove o cookie httpOnly (sessão do servidor) — aguarda terminar para
      // o middleware não redirecionar de volta enquanto navega.
      await logout();
    }
    setLogoutOpen(false);
    setLoggingOut(false);
    // Navega ANTES de limpar o estado: se setCurrentUser(null) rodasse aqui,
    // o header cairia no fallback "Maria Santos" por um instante (flash de
    // outro login). Com a navegação já em andamento, o board não re-renderiza
    // com o usuário errado.
    router.push('/login');
    setCurrentUser(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Mescla tarefas criadas na sessão demo com o mock inicial.
  useEffect(() => {
    getSessionTasks().then((sessionTasks) => {
      if (sessionTasks.length > 0) {
        setTasks((prev) => {
          const ids = new Set(prev.map((t) => t.id));
          return [...prev, ...sessionTasks.filter((t) => !ids.has(t.id))];
        });
      }
    });
  }, []);

  const findTask = (id: string) => tasks.find((t) => t.id === id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = findTask(String(active.id));
    const overId = String(over.id);

    if (!activeTask) return;

    // If dropped on another task, swap positions
    const overTask = findTask(overId);
    if (overTask) {
      if (activeTask.status === overTask.status) {
        // Reorder within same column
        const oldIndex = tasks.indexOf(activeTask);
        const newIndex = tasks.indexOf(overTask);
        setTasks((prev) => arrayMove(prev, oldIndex, newIndex));
      } else {
        // Move to a new column, respecting the status machine (AC-030).
        moveTaskToStatus(activeTask, overTask.status);
      }
      return;
    }

    // If dropped on a column (the column id starts with 'column-')
    if (overId.startsWith('column-')) {
      const status = overId.replace('column-', '') as TaskStatus;
      moveTaskToStatus(activeTask, status);
    }
  };

  /**
   * Move um card para um status respeitando a máquina de transições.
   * Se o destino for inválido, bloqueia o movimento (volta pra origem).
   * Quando o movimento é válido, persiste via updateTask e atualiza o estado.
   */
  const moveTaskToStatus = (task: TaskWithRelations, toStatus: TaskStatus) => {
    if (task.status === toStatus) return;
    if (!canTransition(task.status, toStatus)) {
      // Destino inválido (ex: Backlog → Concluído, ou sair de Cancelado/Concluído).
      setDragRejected(true);
      window.setTimeout(() => setDragRejected(false), 1500);
      return;
    }

    // Atualização otimista local + persistência (não bloqueia a UI).
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: toStatus } : t
      )
    );
    void updateTask({ id: task.id, status: toStatus }).catch(() => {
      // Falha ao persistir: reverte o status no estado local.
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
    });
  };

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleTaskUpdate = (updatedTask: TaskWithRelations) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
  };

  const handleTaskCreated = (newTask: TaskWithRelations) => {
    setTasks((prev) => [...prev, newTask]);
    // Dispara notificação de nova tarefa (AC-042): o hook gera a notificação
    // para o responsável principal.
    const assigneeName = newTask.responsible?.full_name;
    if (assigneeName) {
      window.dispatchEvent(
        new CustomEvent("kanban:new-task", {
          detail: {
            taskId: newTask.id,
            taskTitle: newTask.title,
            by: assigneeName,
          },
        })
      );
    }
  };

  // Tarefas visíveis considerando RBAC (AC-014: operacional vê as próprias) e filtros.
  // Usa displayUser (idêntico no server e client durante a hidratação) para que
  // os contadores das colunas não mudem entre render do servidor e do client.
  const rbacTasks = visibleTasks(displayUser.role, tasks, displayUser.id);
  const filteredTasks = filterTasks(rbacTasks, filters);
  const activeFilterCount = [
    filters.responsibleId,
    filters.category,
    filters.priority,
    filters.search,
  ].filter(Boolean).length;

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col">
        {/* Board Header */}
        <div className="mb-6 flex items-center gap-4 pl-1 pr-1">
          <Logo />
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              Quadro de Operações
            </h1>
            <p className="text-muted-foreground">
              Gestão de tarefas — Almoxarifado, Compras e Administrativo
            </p>
          </div>
          {can(displayUser.role, 'tasks.create') && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          )}
          {can(displayUser.role, 'users.manage') && (
            <Button variant="outline" className="gap-1.5" onClick={() => router.push('/usuarios')}>
              <Users className="h-4 w-4" />
              Usuários
            </Button>
          )}
          <ThemeToggle />
          <NotificationBell notifications={notifications} />
          {can(displayUser.role, 'tasks.view_all') && (
            <ExportButton tasks={filteredTasks} />
          )}
          <Link href="/perfil" className="hover:opacity-80">
            <Button variant="ghost" size="icon" aria-label="Meu perfil" className="h-6 w-6">
              <User className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5">
            <div className="text-right leading-tight">
              <p className="text-xs font-semibold">{displayUser.name}</p>
              <p className="text-[10px] text-muted-foreground">{displayUser.roleLabel}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Sair" onClick={() => setLogoutOpen(true)} className="h-6 w-6">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filtros e pesquisa */}
        <FiltersBar
          responsibleOptions={uniqueResponsibles(tasks)}
          filters={filters}
          onChange={setFilters}
          activeCount={activeFilterCount}
          showAdvanced={can(displayUser.role, 'tasks.view_all')}
        />

        {/* Kanban Board */}
        <div className={cn(
          "flex-1 min-h-0",
          stack ? "overflow-y-auto" : "overflow-x-auto overflow-y-auto snap-x snap-mandatory scroll-px-6 pb-2"
        )}>
          <div className={`${stack ? 'flex flex-col gap-6 pb-6' : 'flex gap-6 pb-6'}`}>
            {columns.map((status) => (
              <SortableContext
                key={status}
                items={getTasksByStatus(status).map((t) => t.id)}
                strategy={horizontalListSortingStrategy}
              >
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={getTasksByStatus(status)}
                  onTaskClick={handleTaskClick}
                  stack={stack}
                />
              </SortableContext>
            ))}
          </div>
        </div>
      </div>

      {/* Aviso de movimento bloqueado (transição inválida entre colunas). */}
      {dragRejected && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-lg dark:border-red-800 dark:bg-red-950/80 dark:text-red-200"
        >
          Movimento bloqueado: essa transição não é permitida
        </div>
      )}

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="opacity-80 rotate-2">
            <TaskCard task={findTask(activeId)!} />
          </div>
        ) : null}
      </DragOverlay>

      {/* Task Modal — permissões por papel (AC-014): aprovação só supervisor,
          editar/comentar para supervisor ou responsável (inclui tarefa compartilhada). */}
      <TaskModal
        task={selectedTask}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdate={handleTaskUpdate}
        canEdit={
          selectedTask
            ? canModifyTask(sessionUser.role, selectedTask, sessionUser.id)
            : false
        }
        canComment={
          selectedTask
            ? canModifyTask(sessionUser.role, selectedTask, sessionUser.id)
            : false
        }
        canApprove={can(sessionUser.role, 'tasks.approve')}
        canDelete={can(sessionUser.role, 'tasks.delete')}
        onDelete={handleTaskDelete}
      />

      {/* Modal de criação de tarefa (apenas supervisor — AC-015) */}
      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleTaskCreated}
        requester={{ id: sessionUser.id, name: sessionUser.name }}
      />

      {/* Confirmação de saída — evita logout acidental */}
      <AlertDialog open={logoutOpen} onOpenChange={(isOpen) => !isOpen && setLogoutOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja sair?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado do sistema. Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>Não, ficar aqui</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={loggingOut}
              onClick={() => {
                setLoggingOut(true);
                handleLogout();
              }}
            >
              {loggingOut ? "Saindo..." : "Sim, sair"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndContext>
  );
}
