"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

/**
 * Busca o perfil do usuário logado.
 */
export async function fetchProfile(): Promise<ProfileData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, avatar_url, created_at")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  }

  return data as ProfileData;
}

/**
 * Atualiza o perfil do usuário (nome e email).
 */
export async function updateProfile(input: {
  full_name?: string;
  email?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Usuário não autenticado" };
  }

  // Atualiza email no auth se mudou
  if (input.email && input.email !== user.email) {
    const { error: authError } = await supabase.auth.updateUser({
      email: input.email,
    });
    if (authError) {
      return { ok: false, error: `Erro ao atualizar email: ${authError.message}` };
    }
  }

  // Atualiza nome na tabela users
  if (input.full_name) {
    const { error } = await supabase
      .from("users")
      .update({ full_name: input.full_name.trim() })
      .eq("id", user.id);

    if (error) {
      return { ok: false, error: `Erro ao atualizar nome: ${error.message}` };
    }
  }

  return { ok: true };
}

/**
 * Atualiza a senha do usuário.
 */
export async function updatePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { ok: false, error: "Usuário não autenticado" };
  }

  // Verifica senha atual
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.currentPassword,
  });

  if (verifyError) {
    return { ok: false, error: "Senha atual incorreta" };
  }

  // Atualiza para nova senha
  const { error } = await supabase.auth.updateUser({
    password: input.newPassword,
  });

  if (error) {
    return { ok: false, error: `Erro ao atualizar senha: ${error.message}` };
  }

  return { ok: true };
}

/**
 * Upload de avatar (imagem de perfil).
 */
export async function uploadAvatar(
  file: File
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Usuário não autenticado" };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}.${ext}`;

  // Upload para o bucket avatars
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { ok: false, error: `Erro no upload: ${uploadError.message}` };
  }

  // Gera URL pública
  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  // Atualiza avatar_url na tabela users
  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return { ok: false, error: `Erro ao salvar URL: ${updateError.message}` };
  }

  return { ok: true, url: publicUrl };
}
