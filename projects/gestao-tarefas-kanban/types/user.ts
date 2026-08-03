export type UserRole =
  | 'supervisor'
  | 'almoxarife'
  | 'comprador'
  | 'assistente_administrativo';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  supervisor: 'Supervisor',
  almoxarife: 'Almoxarife',
  comprador: 'Comprador',
  assistente_administrativo: 'Assistente Administrativo',
};
