"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UserRole, ROLE_LABELS } from "@/lib/auth/roles";
import { getStoredUser } from "@/components/auth/login-form";
import { can } from "@/lib/auth/roles";
import {
  listUsers as listUsersAction,
  createUser as createUserAction,
  updateUserRole as updateUserRoleAction,
  deleteUser as deleteUserAction,
  ManagedUser,
} from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { ArrowLeft, Plus, Pencil, Trash2, Users } from "lucide-react";

const ROLES: UserRole[] = ["supervisor", "almoxarife", "comprador", "assistente_administrativo"];

const ROLE_BADGE: Record<UserRole, string> = {
  supervisor: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800/60",
  almoxarife: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-200 dark:border-teal-800/60",
  comprador: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-800/60",
  assistente_administrativo: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/40 dark:text-violet-200 dark:border-violet-800/60",
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "—";

interface ModalState {
  open: boolean;
  editing: ManagedUser | null;
}

export function UsersManager() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false, editing: null });
  const [deleting, setDeleting] = useState<ManagedUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [currentUser] = useState(() => getStoredUser());

  // Apenas supervisor gerencia usuários (users.manage).
  const allowed = currentUser ? can(currentUser.role, "users.manage") : false;

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listUsersAction();
    setLoading(false);
    if (!result.ok || !result.users) {
      setListError(result.error ?? "Erro ao carregar usuários");
      return;
    }
    setUsers(result.users);
    setListError(null);
  }, []);

  useEffect(() => {
    // Só carrega a lista se o usuário tem permissão (users.manage).
    // Sem isso, um operacional que acessar a rota dispararia a action
    // e o servidor lançaria "Sem permissão para esta ação".
    if (allowed) load();
  }, [load, allowed]);

  const handleSaved = async () => {
    setModal({ open: false, editing: null });
    await load();
  };

  const handleDeleted = async () => {
    if (!deleting) return;
    setBusy(true);
    const result = await deleteUserAction({ id: deleting.id });
    setBusy(false);
    setDeleting(null);
    if (!result.ok) {
      setListError(result.error ?? "Erro ao excluir usuário");
      return;
    }
    await load();
  };

  if (!allowed) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <Users className="h-10 w-10 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-semibold">Acesso restrito</h1>
          <p className="text-muted-foreground">
            Somente o supervisor pode gerenciar usuários do sistema.
          </p>
          <Link
            href="/kanban"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/80"
          >
            Voltar ao Quadro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4 pl-1 pr-1">
        <Logo />
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight uppercase">Usuários</h1>
          <p className="text-muted-foreground">
            Cadastro e gestão de colaboradores do sistema
          </p>
        </div>
        <Link
          href="/kanban"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Quadro
        </Link>
        <Button onClick={() => setModal({ open: true, editing: null })} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Lista */}
      <div className="flex-1 min-h-0 overflow-auto rounded-xl ring-1 ring-foreground/10 bg-card/60">
        {listError && (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-300" role="alert">
            {listError}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando usuários...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum usuário cadastrado ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="h-10 px-4 font-medium">Colaborador</th>
                <th className="h-10 px-4 font-medium">E-mail</th>
                <th className="h-10 px-4 font-medium">Perfil</th>
                <th className="h-10 px-4 font-medium hidden md:table-cell">Criado em</th>
                <th className="h-10 px-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-200">
                          {getInitials(u.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="p-3 px-4 text-muted-foreground">{u.email}</td>
                  <td className="p-3 px-4">
                    <Badge variant="outline" className={ROLE_BADGE[u.role]}>
                      {u.roleLabel}
                    </Badge>
                  </td>
                  <td className="p-3 px-4 text-muted-foreground hidden md:table-cell">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="p-3 px-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar perfil de ${u.full_name}`}
                        className="h-8 w-8"
                        onClick={() => setModal({ open: true, editing: u })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${u.full_name}`}
                        className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400"
                        onClick={() => setDeleting(u)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de criação/edição */}
      <UserFormModal
        modal={modal}
        onClose={() => setModal({ open: false, editing: null })}
        onSaved={handleSaved}
      />

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <span className="font-medium text-foreground">{deleting?.full_name}</span>? Essa ação não pode ser desfeita e remove o acesso ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={busy} onClick={handleDeleted}>
              {busy ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface UserFormModalProps {
  modal: ModalState;
  onClose: () => void;
  onSaved: () => void;
}

function UserFormModal({ modal, onClose, onSaved }: UserFormModalProps) {
  const isEdit = !!modal.editing;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("almoxarife");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sincroniza ao abrir (criação ou edição).
  useEffect(() => {
    if (modal.open) {
      setFullName(modal.editing?.full_name ?? "");
      setEmail(modal.editing?.email ?? "");
      setPassword("");
      setRole(modal.editing?.role ?? "almoxarife");
      setError(null);
    }
  }, [modal]);

  const handleClose = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("almoxarife");
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    if (!fullName.trim()) {
      setError("O nome é obrigatório");
      return;
    }
    if (!isEdit && !email.trim()) {
      setError("O e-mail é obrigatório");
      return;
    }
    if (!isEdit && password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setSubmitting(true);
    if (isEdit && modal.editing) {
      const result = await updateUserRoleAction({ id: modal.editing.id, role });
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error ?? "Erro ao salvar");
        return;
      }
      onSaved();
    } else {
      const result = await createUserAction({
        email,
        password,
        fullName,
        role,
      });
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error ?? "Erro ao criar usuário");
        return;
      }
      onSaved();
    }
  };

  return (
    <Dialog open={modal.open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Editar Perfil" : "Novo Usuário"}
          </DialogTitle>
          <span className="text-sm text-muted-foreground">
            {isEdit
              ? `Alterar o perfil de acesso de ${modal.editing?.full_name}`
              : "Cadastrar um colaborador para acessar o sistema"}
          </span>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-300" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="user-name" className="text-sm font-medium">Nome *</Label>
            <Input
              id="user-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Pedro Almeida"
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email" className="text-sm font-medium">E-mail {isEdit ? "" : "*"}</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: pedro@vortice.com"
              disabled={isEdit}
              aria-required={!isEdit}
            />
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado.
              </p>
            )}
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="user-password" className="text-sm font-medium">Senha *</Label>
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                aria-required="true"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="user-role" className="text-sm font-medium">Perfil de acesso</Label>
            <Select value={role} onValueChange={(v) => setRole((v ?? "almoxarife") as UserRole)}>
              <SelectTrigger id="user-role" className="w-full">
                <SelectValue>{ROLE_LABELS[role]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Supervisor tem acesso total; os demais perfis têm acesso às próprias tarefas.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-end gap-2 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Salvando..." : isEdit ? "Salvar" : "Criar Usuário"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
