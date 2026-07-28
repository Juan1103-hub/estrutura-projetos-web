"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type Setor = "farmacia" | "laboratorio" | "enfermagem" | null

interface SetorContextType {
  setor: Setor
  setSetor: (s: Setor) => void
  isAuthenticated: boolean
  login: (setor: Setor, senha: string) => boolean
  logout: () => void
}

const SetorContext = createContext<SetorContextType | undefined>(undefined)

// Senhas mockadas por setor
const senhasSetores: Record<string, string> = {
  farmacia: "farmacia123",
  laboratorio: "lab123",
  enfermagem: "enfermagem123",
}

export function SetorProvider({ children }: { children: ReactNode }) {
  const [setor, setSetor] = useState<Setor>(null)

  const login = (novoSetor: Setor, senha: string): boolean => {
    if (!novoSetor) return false
    if (senhasSetores[novoSetor] === senha) {
      setSetor(novoSetor)
      return true
    }
    return false
  }

  const logout = () => {
    setSetor(null)
  }

  return (
    <SetorContext.Provider value={{
      setor,
      setSetor,
      isAuthenticated: !!setor,
      login,
      logout,
    }}>
      {children}
    </SetorContext.Provider>
  )
}

export function useSetor() {
  const context = useContext(SetorContext)
  if (!context) {
    throw new Error("useSetor must be used within SetorProvider")
  }
  return context
}

// Hook para verificar acesso a um setor específico
export function useSetorAccess(setorRequerido: string): boolean {
  const { setor } = useSetor()
  if (!setor) return false
  if (setor === "farmacia") return true // Farmácia tem acesso a tudo
  return setor === setorRequerido
}