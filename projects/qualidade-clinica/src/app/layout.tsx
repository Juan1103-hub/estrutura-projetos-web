import type { Metadata } from "next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Qualidade Clínica",
  description: "Sistema de Gestão da Qualidade",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased font-sans" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  )
}