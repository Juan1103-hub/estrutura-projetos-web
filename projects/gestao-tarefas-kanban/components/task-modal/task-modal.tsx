"use client";

import { useMemo, useState, useEffect } from "react";
import { TaskWithRelations, TASK_STATUS_LABELS, ChecklistItem } from "@/types/task";
import { CommentWithUser } from "@/types/comment";
import { Attachment } from "@/types/attachment";
import { TaskHistoryEntryWithUser } from "@/types/history";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TaskInfoSection } from "./task-info-section";
import { TaskChecklistSection } from "./task-checklist-section";
import { TaskCommentsSection } from "./task-comments-section";
import { TaskAttachmentsSection } from "./task-attachments-section";
import { TaskHistorySection } from "./task-history-section";
import { ApprovalSection } from "./approval-section";
import { approveTask, rejectTask } from "@/app/actions/approval";
import { RequestHelpButton } from "./request-help-button";
import { addComment as addCommentAction } from "@/app/actions/comments";
import {
  getChecklist,
  updateChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
} from "@/app/actions/checklist";
import {
  addAttachment as addAttachmentAction,
  getAttachments as getAttachmentsAction,
  deleteAttachment as deleteAttachmentAction,
} from "@/app/actions/attachments";
import { Info, CheckSquare, Paperclip, MessageSquare, History } from "lucide-react";

interface TaskModalProps {
  task: TaskWithRelations | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: (task: TaskWithRelations) => void;
  canEdit?: boolean;
  canComment?: boolean;
  canApprove?: boolean;
}

// Gera dados de demonstração coerentes com os contadores da tarefa.
function generateDemoData(task: TaskWithRelations) {
  // Guardas: responsável/solicitante podem vir nulos (FK ausente no Supabase).
  const responsible = task.responsible ?? {
    id: "sem-responsavel",
    full_name: "Sem responsável",
    email: "sem-responsavel@vortice.com",
    role: "operacional",
    avatar_url: null,
  };
  const requester = task.requester ?? {
    id: "sem-solicitante",
    full_name: "Sem solicitante",
    email: "sem-solicitante@vortice.com",
    role: "supervisor",
    avatar_url: null,
  };

  const comments: CommentWithUser[] = Array.from({ length: task.comments_count }, (_, i) => ({
    id: `demo-comment-${i}`,
    task_id: task.id,
    user_id: i % 2 === 0 ? responsible.id : requester.id,
    content:
      i % 2 === 0
        ? `Estou trabalhando nessa tarefa. Divergência anotada no item #${i + 1}.`
        : `Pode dar prioridade? O prazo está chegando e precisamos resolver antes.`,
    created_at: new Date(Date.now() - (i + 1) * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - (i + 1) * 3600 * 1000).toISOString(),
    user: i % 2 === 0 ? responsible : requester,
  }));

  const attachments: Attachment[] = Array.from({ length: task.attachments_count }, (_, i) => ({
    id: `demo-attachment-${i}`,
    task_id: task.id,
    user_id: responsible.id,
    file_name: i % 2 === 0 ? `relatorio_contagem_${i + 1}.pdf` : `foto_comprovante_${i + 1}.jpg`,
    file_size: (i + 1) * 512000,
    file_type: i % 2 === 0 ? "application/pdf" : "image/jpeg",
    storage_path: `tasks/${task.id}/demo-${i}`,
    created_at: new Date(Date.now() - (i + 2) * 86400 * 1000).toISOString(),
  }));

  const history: TaskHistoryEntryWithUser[] = [
    {
      id: `demo-history-0`,
      task_id: task.id,
      user_id: requester.id,
      action: "created",
      field_name: null,
      old_value: null,
      new_value: null,
      created_at: new Date(task.created_at).toISOString(),
      user: requester,
    },
    {
      id: `demo-history-1`,
      task_id: task.id,
      user_id: responsible.id,
      action: "status_changed",
      field_name: "status",
      old_value: "backlog",
      new_value: task.status,
      created_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
      user: responsible,
    },
    ...(task.help_requested
      ? [
          {
            id: `demo-history-2`,
            task_id: task.id,
            user_id: responsible.id,
            action: "requested_help",
            field_name: null,
            old_value: null,
            new_value: null,
            created_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
            user: responsible,
          },
        ]
      : []),
  ] as TaskHistoryEntryWithUser[];

  return { comments, attachments, history };
}

export function TaskModal({ task, open, onClose, onUpdate, canEdit = false, canComment = false, canApprove = false }: TaskModalProps) {

  // Aprovação é exclusiva de quem tem permissão de supervisor (tasks.approve).
  // Só canEdit (responsável) NÃO autoriza a revisão — evita que um operacional
  // aprove/reprove a própria tarefa (AC-014).
  const canReview = canApprove;
  const [editedTask, setEditedTask] = useState<TaskWithRelations | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [liveComments, setLiveComments] = useState<CommentWithUser[] | null>(null);
  const [liveChecklist, setLiveChecklist] = useState<ChecklistItem[] | null>(null);
  const [liveAttachments, setLiveAttachments] = useState<Attachment[] | null>(null);
  const [approvalResult, setApprovalResult] = useState<
    { approved?: boolean; rejected?: boolean; reason?: string } | null
  >(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // Sincroniza o estado editado com a tarefa aberta
  const currentTask = open ? (editedTask ?? task) : null;
  const demoData = useMemo(
    () => (currentTask ? generateDemoData(currentTask) : null),
    [currentTask]
  );

  // Carrega checklist e anexos persistidos quando o modal abre. Os hooks
  // DEVEM vir antes de qualquer return condicional (Rules of Hooks).
  useEffect(() => {
    if (open && task) {
      getChecklist(task.id, task.checklist_items).then(setLiveChecklist);
      getAttachmentsAction(task.id).then(setLiveAttachments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task?.id]);

  // Anexos reais: começa pelos demo (contador) e inclui os enviados na sessão.
  const attachments =
    liveAttachments ??
    (demoData?.attachments as Attachment[] | undefined) ??
    [];

  if (!task || !currentTask) return null;

  const handleFieldUpdate = (field: keyof TaskWithRelations, value: any) => {
    if (!currentTask) return;
    setEditedTask({ ...currentTask, [field]: value });
  };

  const handleUploadAttachment = async (file: File) => {
    if (!currentTask) return;
    const added = await addAttachmentAction({
      taskId: currentTask.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    setLiveAttachments((prev) => [...(prev ?? attachments), added]);
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!currentTask) return;
    await deleteAttachmentAction(currentTask.id, attachmentId);
    setLiveAttachments((prev) => (prev ?? attachments).filter((a) => a.id !== attachmentId));
  };

  // Comentários reais: começa pelos demo (gerados a partir do contador) e
  // passa a incluir os adicionados nesta sessão.
  const comments =
    liveComments ??
    (demoData?.comments as CommentWithUser[] | undefined) ??
    [];

  // Checklist real: quando o modal abre, mescla os itens base (mock) com os
  // persistidos na sessão desta tarefa.
  const checklistItems =
    liveChecklist ??
    (currentTask.checklist_items as ChecklistItem[]) ??
    [];

  const handleToggleChecklist = async (itemId: string) => {
    if (!currentTask) return;
    const item = checklistItems.find((i) => i.id === itemId);
    if (!item) return;
    const updated = await updateChecklistItem({
      taskId: currentTask.id,
      itemId,
      completed: !item.completed,
      baseItems: currentTask.checklist_items,
    });
    const next = checklistItems.map((i) =>
      i.id === updated.id ? updated : i
    );
    setLiveChecklist(next);
    propagateChecklist(next);
  };

  const handleAddChecklist = async (title: string) => {
    if (!currentTask) return;
    const added = await addChecklistItem({
      taskId: currentTask.id,
      title,
      position: (checklistItems ?? []).length,
    });
    const next = [...checklistItems, added];
    setLiveChecklist(next);
    propagateChecklist(next);
  };

  const handleDeleteChecklist = async (itemId: string) => {
    if (!currentTask) return;
    await deleteChecklistItem({ taskId: currentTask.id, itemId });
    const next = checklistItems.filter((i) => i.id !== itemId);
    setLiveChecklist(next);
    propagateChecklist(next);
  };

  /** Propaga o checklist atualizado para o board, mantendo o card ("1/3") sincronizado. */
  const propagateChecklist = (items: ChecklistItem[]) => {
    if (!currentTask) return;
    const nextTask = { ...currentTask, checklist_items: items };
    setEditedTask(nextTask);
    onUpdate?.(nextTask);
  };

  const handleAddComment = async (content: string) => {
    try {
      const comment = await addCommentAction({
        taskId: currentTask.id,
        content,
      });
      setLiveComments((prev) => [...(prev ?? comments), comment]);
      // Notifica o receptor (player / requisitante) conforme AC-025.
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("kanban:comment", {
            detail: {
              taskId: currentTask.id,
              taskTitle: currentTask.title,
              by: currentTask.responsible?.full_name ?? "Alguém",
            },
          })
        );
      }
    } catch (err) {
      console.error("Falha ao adicionar comentário:", err);
    }
  };

  const handleApprove = async () => {
    if (!currentTask) return;
    setApprovalError(null);
    const result = await approveTask({
      taskId: currentTask.id,
    });
    if (!result.success) {
      setApprovalError(result.error ?? "Erro ao aprovar");
      return;
    }
    // Abre tarefa concluída, atualiza no quadro e notifica (AC-028).
    const approvedTask: TaskWithRelations = { ...currentTask, status: "concluido" };
    setEditedTask(approvedTask);
    onUpdate?.(approvedTask);
    setApprovalResult({ approved: true });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kanban:approval", {
          detail: { taskId: currentTask.id, taskTitle: currentTask.title, action: "approved" },
        })
      );
    }
  };

  const handleReject = async (reason: string) => {
    if (!currentTask) return;
    setApprovalError(null);
    const result = await rejectTask({
      taskId: currentTask.id,
      reason,
    });
    if (!result.success) {
      setApprovalError(result.error ?? "Erro ao reprovar");
      return;
    }
    // Volta pra "Em Andamento" com a justificativa (AC-029)
    const updated: TaskWithRelations = {
      ...currentTask,
      status: "em_andamento",
      rejection_reason: reason,
    };
    setEditedTask(updated);
    onUpdate?.(updated);
    setApprovalResult({ rejected: true, reason });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kanban:approval", {
          detail: { taskId: currentTask.id, taskTitle: currentTask.title, action: "rejected" },
        })
      );
    }
  };

  const handleSave = () => {
    if (!currentTask) return;
    onUpdate?.(currentTask);
    onClose();
    setEditedTask(null);
  };

  const handleClose = () => {
    setEditedTask(null);
    setLiveComments(null);
    setLiveChecklist(null);
    setLiveAttachments(null);
    setApprovalResult(null);
    setApprovalError(null);
    setActiveTab("info");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-semibold">{currentTask.title}</DialogTitle>
          <span className="text-sm text-muted-foreground">
            {TASK_STATUS_LABELS[currentTask.status]}
          </span>
        </DialogHeader>

        <Separator />

        {/* T-014: Revisão de aprovação — só quando a tarefa aguarda aprovação */}
        {currentTask.status === "aguardando_aprovacao" && canReview && (
          <div className="px-6 pt-4">
            {approvalResult ? (
              <div className="rounded-xl border p-4 text-sm">
                {approvalResult.approved ? (
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    ✓ Tarefa aprovada e movida para Concluído.
                  </p>
                ) : (
                  <p className="text-red-700 dark:text-red-300 font-medium">
                    ✗ Tarefa reprovada — voltou para Em Andamento.
                  </p>
                )}
                {approvalResult.reason && (
                  <p className="mt-1 text-muted-foreground">
                    Justificativa enviada ao responsável: "{approvalResult.reason}"
                  </p>
                )}
              </div>
            ) : (
              <>
                {approvalError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">{approvalError}</p>
                )}
                <ApprovalSection
                  hasApprovalPending
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </>
            )}
          </div>
        )}

        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full min-h-0 flex flex-col">
            <TabsList className="mx-6 mt-4 flex flex-nowrap gap-1 overflow-x-auto">
              <TabsTrigger value="info" className="gap-2">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Informações</span>
              </TabsTrigger>
              <TabsTrigger value="checklist" className="gap-2">
                <CheckSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Checklist</span>
                {currentTask.checklist_items.length > 0 && (
                  <span className="ml-1 rounded-full bg-muted px-1.5 text-xs">
                    {currentTask.checklist_items.filter((i) => i.completed).length}/
                    {currentTask.checklist_items.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="attachments" className="gap-2">
                <Paperclip className="h-4 w-4" />
                <span className="hidden sm:inline">Anexos</span>
                {currentTask.attachments_count > 0 && (
                  <span className="ml-1 rounded-full bg-muted px-1.5 text-xs">
                    {currentTask.attachments_count}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="comments" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Comentários</span>
                {currentTask.comments_count > 0 && (
                  <span className="ml-1 rounded-full bg-muted px-1.5 text-xs">
                    {currentTask.comments_count}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="px-6 pb-6">
                <TabsContent value="info" className="mt-6 space-y-6">
                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    {canEdit ? (
                      <Textarea
                        value={currentTask.description || ""}
                        onChange={(e) => handleFieldUpdate("description", e.target.value)}
                        className="min-h-32 resize-none"
                        placeholder="Adicionar descrição..."
                      />
                    ) : (
                      <div className="text-sm text-foreground whitespace-pre-wrap rounded-lg border border-border p-3 min-h-32">
                        {currentTask.description || (
                          <span className="text-muted-foreground">Sem descrição</span>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Informações gerais */}
                  <TaskInfoSection
                    task={currentTask}
                    onUpdate={handleFieldUpdate}
                    canEdit={canEdit}
                  />

                  {/* T-024: Solicitar apoio ou reabertura (AC-048/049) */}
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Solicitações</h3>
                    <p className="text-xs text-muted-foreground">
                      {currentTask.status === "concluido"
                        ? "Tarefa concluída. Se houver erro, solicite reabertura."
                        : "Tarefa em andamento. Se precisar de ajuda, solicite apoio."}
                    </p>
                    <RequestHelpButton
                      taskId={currentTask.id}
                      isCompleted={currentTask.status === "concluido"}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="checklist" className="mt-6">
                  <TaskChecklistSection
                    items={checklistItems}
                    onUpdate={handleToggleChecklist}
                    onAdd={canEdit ? handleAddChecklist : undefined}
                    onDelete={canEdit ? handleDeleteChecklist : undefined}
                    canEdit={canEdit}
                  />
                </TabsContent>

                <TabsContent value="attachments" className="mt-6">
                  <TaskAttachmentsSection
                    attachments={attachments}
                    onUpload={canEdit ? handleUploadAttachment : undefined}
                    onDelete={canEdit ? handleDeleteAttachment : undefined}
                    canEdit={canEdit}
                  />
                </TabsContent>

                <TabsContent value="comments" className="mt-6">
                  <TaskCommentsSection
                    comments={comments}
                    onAdd={canComment ? handleAddComment : undefined}
                    canComment={canComment}
                  />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <TaskHistorySection history={demoData?.history ?? []} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        <Separator />

        {/* Footer com ações */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Criado em {new Date(currentTask.created_at).toLocaleDateString("pt-BR")}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
            {canEdit && (
              <Button onClick={handleSave}>Salvar Alterações</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
