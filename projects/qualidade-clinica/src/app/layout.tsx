import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

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
    <html lang="pt-BR" className={`h-full antialiased ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  )
}