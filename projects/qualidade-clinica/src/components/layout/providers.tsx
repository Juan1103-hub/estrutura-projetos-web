"use client"

import { AuthProvider } from "@/components/layout/auth-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}