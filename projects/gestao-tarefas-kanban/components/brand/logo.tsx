import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Tamanho do fallback (o marcador âmbar industrial) quando a logo ainda não está no public/. */
  size?: "sm" | "md";
}

/**
 * Logo da Vórtice Mineral.
 *
 * Exibe a logo a partir de `/vortice-logo.jpg` quando o arquivo existir em
 * `public/`; enquanto a imagem não for fornecida, mostra um marcador âmbar
 * industrial (barra vertical) que mantém o padrão visual da Sala de Controle.
 */
export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <div className={cn("flex shrink-0 items-center", className)}>
      {/* Logo real (quando public/vortice-logo.jpg existir) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/vortice-logo.jpg"
        alt="Vórtice Mineral"
        className={cn(
          "h-auto w-auto rounded-lg object-contain",
          size === "md" ? "max-h-14 max-w-52" : "max-h-10 max-w-32"
        )}
        onError={(e) => {
          // Fallback: esconde a imagem e mostra o marcador industrial
          (e.currentTarget as HTMLImageElement).style.display = "none";
          const fallback = (e.currentTarget as HTMLImageElement)
            .nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = "block";
        }}
      />
      {/* Fallback industrial enquanto não houver logo em public/ */}
      <div
        className="hidden h-12 w-1.5 rounded-full bg-gradient-to-b from-orange-500 to-amber-600"
        aria-hidden
      />
    </div>
  );
}
