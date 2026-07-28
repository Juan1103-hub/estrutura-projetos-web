"use client"

import { useState } from "react"
import { useSetor } from "@/lib/setor-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pill, FlaskConical, Stethoscope, LogOut } from "lucide-react"

const setores = [
  { id: "farmacia", nome: "Farmácia", icon: Pill, cor: "bg-rose-50 border-rose-200 text-rose-700" },
  { id: "laboratorio", nome: "Laboratório", icon: FlaskConical, cor: "bg-cyan-50 border-cyan-200 text-cyan-700" },
  { id: "enfermagem", nome: "Enfermagem", icon: Stethoscope, cor: "bg-blue-50 border-blue-200 text-blue-700" },
]

export function LoginSetor() {
  const { login, isAuthenticated, setor, logout } = useSetor()
  const [setorSelecionado, setSetorSelecionado] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")

  const handleLogin = () => {
    if (!setorSelecionado || !senha) {
      setErro("Selecione o setor e digite a senha")
      return
    }
    const sucesso = login(setorSelecionado as any, senha)
    if (!sucesso) {
      setErro("Senha incorreta para este setor")
    } else {
      setErro("")
    }
  }

  if (isAuthenticated) {
    const setorInfo = setores.find(s => s.id === setor)
    const Icon = setorInfo?.icon || Pill
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
        <div className={`p-2 rounded-lg ${setorInfo?.cor}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{setorInfo?.nome}</p>
          <p className="text-xs text-muted-foreground">Acesso autorizado</p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Acesso por Setor</CardTitle>
        <p className="text-sm text-muted-foreground">Selecione seu setor e digite a senha</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Setor</Label>
          <Select value={setorSelecionado} onValueChange={(v) => v && setSetorSelecionado(v)}>
            <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
            <SelectContent>
              {setores.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <s.icon className="h-4 w-4" />
                    {s.nome}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Senha</Label>
          <Input
            type="password"
            placeholder="Digite a senha do setor"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
        {erro && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{erro}</p>
        )}
        <Button onClick={handleLogin} className="w-full">
          Acessar Sistema
        </Button>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Senhas de teste:</strong></p>
          <p>Farmácia: farmacia123</p>
          <p>Laboratório: lab123</p>
          <p>Enfermagem: enfermagem123</p>
        </div>
      </CardContent>
    </Card>
  )
}