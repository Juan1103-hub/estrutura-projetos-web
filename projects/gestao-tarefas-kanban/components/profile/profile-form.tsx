"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateProfile, updatePassword, uploadAvatar, type ProfileData } from "@/app/actions/profile";
import { User, Lock, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface ProfileFormProps {
  initialData: ProfileData;
}

type Message = { type: "success" | "error"; text: string } | null;

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [profile, setProfile] = useState(initialData);
  const [message, setMessage] = useState<Message>(null);
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    avatar: false,
  });

  // Estado do formulário de perfil
  const [formData, setFormData] = useState({
    full_name: initialData.full_name,
    email: initialData.email,
  });

  // Estado do formulário de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((l) => ({ ...l, profile: true }));
    setMessage(null);

    try {
      const result = await updateProfile({
        full_name: formData.full_name,
        email: formData.email,
      });

      if (result.ok) {
        setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
        setProfile((p) => ({
          ...p,
          full_name: formData.full_name,
          email: formData.email,
        }));
      } else {
        setMessage({ type: "error", text: result.error || "Erro ao atualizar perfil" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro inesperado. Tente novamente." });
    } finally {
      setLoading((l) => ({ ...l, profile: false }));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((l) => ({ ...l, password: true }));
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem" });
      setLoading((l) => ({ ...l, password: false }));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres" });
      setLoading((l) => ({ ...l, password: false }));
      return;
    }

    try {
      const result = await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.ok) {
        setMessage({ type: "success", text: "Senha alterada com sucesso!" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({ type: "error", text: result.error || "Erro ao alterar senha" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro inesperado. Tente novamente." });
    } finally {
      setLoading((l) => ({ ...l, password: false }));
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "A imagem deve ter no máximo 5MB" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Selecione apenas arquivos de imagem" });
      return;
    }

    setLoading((l) => ({ ...l, avatar: true }));
    setMessage(null);

    try {
      const result = await uploadAvatar(file);

      if (result.ok && result.url) {
        setMessage({ type: "success", text: "Avatar atualizado!" });
        setProfile((p) => ({ ...p, avatar_url: result.url! }));
      } else {
        setMessage({ type: "error", text: result.error || "Erro ao enviar avatar" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro inesperado. Tente novamente." });
    } finally {
      setLoading((l) => ({ ...l, avatar: false }));
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === "success" ? "default" : "destructive"}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <Label
            htmlFor="avatar-upload"
            className="cursor-pointer inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            {loading.avatar ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {loading.avatar ? "Enviando..." : "Alterar foto"}
          </Label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={loading.avatar}
          />
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG ou GIF. Máximo 5MB.</p>
        </div>
      </div>

      {/* Formulário de perfil */}
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nome completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData((d) => ({ ...d, full_name: e.target.value }))}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Cargo</Label>
          <Input value={profile.role} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">
            O cargo é definido pelo administrador do sistema
          </p>
        </div>

        <Button type="submit" disabled={loading.profile}>
          {loading.profile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </form>

      {/* Formulário de senha */}
      <div className="border-t pt-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
          <Lock className="h-5 w-5" />
          Alterar senha
        </h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((d) => ({ ...d, currentPassword: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((d) => ({ ...d, newPassword: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((d) => ({ ...d, confirmPassword: e.target.value }))
              }
              required
            />
          </div>

          <Button type="submit" variant="outline" disabled={loading.password}>
            {loading.password && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Alterar senha
          </Button>
        </form>
      </div>
    </div>
  );
}
