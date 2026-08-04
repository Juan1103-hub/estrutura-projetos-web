import { Metadata } from "next";
import { ProfileForm } from "@/components/profile/profile-form";
import { fetchProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Meu Perfil",
};

export default async function ProfilePage() {
  const profile = await fetchProfile();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/kanban" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao quadro
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          <div className="border-b px-6 py-4">
            <h1 className="text-xl font-semibold">Meu Perfil</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>

          <div className="p-6">
            {profile ? (
              <ProfileForm initialData={profile} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Não foi possível carregar seu perfil.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
