import { UsersManager } from '@/components/users/users-manager';

export default function UsuariosPage() {
  return (
    <div className="h-screen p-6 bg-[var(--background)] bg-gradient-to-br from-slate-50 via-slate-100/60 to-amber-50/30 dark:from-[#111417] dark:via-slate-900 dark:to-slate-800">
      <UsersManager />
    </div>
  );
}
