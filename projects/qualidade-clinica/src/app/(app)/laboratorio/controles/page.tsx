"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Snowflake, Thermometer, Droplets, Save, AlertTriangle, CheckCircle2 } from "lucide-react"

// Botijões do Excel LAB
const botijoes = [
  { id: "bot1", nome: "Bot 1", min: 35, max: 41 },
  { id: "bot2", nome: "Bot 2", min: 35, max: 41 },
  { id: "bot3", nome: "Bot 3", min: 35, max: 41 },
  { id: "bot4", nome: "Bot 4", min: 25, max: 38 },
  { id: "bot5", nome: "Bot 5", min: 25, max: 38 },
  { id: "bot6", nome: "Bot 6", min: 36, max: 42 },
  { id: "bot7", nome: "Bot 7", min: 36, max: 42 },
  { id: "bot8", nome: "Bot 8", min: 36, max: 42 },
  { id: "bot9", nome: "Bot 9", min: 36, max: 42 },
  { id: "bot10", nome: "Bot 10", min: 36, max: 42 },
]

// Equipamentos do Excel LAB
const equipamentos = [
  { id: "thermo", nome: "Incubadora THERMO", tipo: "co2_temp" },
  { id: "ksys1", nome: "Incubadora K-systems 1", tipo: "co2_temp" },
  { id: "ksys2", nome: "Incubadora K-systems 2", tipo: "co2_temp" },
  { id: "estufa1", nome: "Estufa 1", tipo: "temp" },
  { id: "placa1", nome: "Placa aq.1", tipo: "temp" },
  { id: "placa2", nome: "Placa aq.2", tipo: "temp" },
  { id: "placa3", nome: "Placa aq.3", tipo: "temp" },
  { id: "tubos1", nome: "Sup. Tubos1", tipo: "temp" },
  { id: "tubos2", nome: "Sup Tubos2", tipo: "temp" },
  { id: "tubos3", nome: "Sup Tubos3", tipo: "temp" },
  { id: "placa1s", nome: "Placa aq.1s", tipo: "temp" },
  { id: "lab", nome: "Laboratório", tipo: "temp_umid" },
  { id: "crio", nome: "Sala Crio", tipo: "temp_umid" },
]

// Dados mockados nitrogênio (semanal)
const nitrogenioInicial = [
  { semana: "Semana 1", bot1: 35, bot2: 40, bot3: 37, bot4: 33, bot5: 31, bot6: 38, bot7: 37, bot8: 36, bot9: 38, bot10: 37 },
  { semana: "Semana 2", bot1: 38, bot2: 40, bot3: 39, bot4: 36, bot5: 33, bot6: 39, bot7: 38, bot8: 41, bot9: 40, bot10: 39 },
  { semana: "Semana 3", bot1: 37, bot2: 39, bot3: 35, bot4: 34, bot5: 32, bot6: 40, bot7: 40, bot8: 39, bot9: 39, bot10: 40 },
  { semana: "Semana 4", bot1: 35, bot2: 41, bot3: 38, bot4: 36, bot5: 37, bot6: 41, bot7: 37, bot8: 40, bot9: 38, bot10: 38 },
]

// Dados mockados temperatura (diário)
const temperaturaInicial = [
  { data: "2025-01-01", thermo_co2: 8.4, thermo_temp: 37, ksys1_co2: 8, ksys1_temp: 37.1, ksys2_co2: 8, ksys2_temp: 37.1, estufa1: 37, placa1: 37, placa2: 37, placa3: 37, tubos1: 37, tubos2: 37, tubos3: 37, placa1s: 37, lab_temp: 32, lab_umid: 59, crio_temp: 23, crio_umid: 65 },
  { data: "2025-01-02", thermo_co2: 8.3, thermo_temp: 37, ksys1_co2: 7.9, ksys1_temp: 37, ksys2_co2: 8.2, ksys2_temp: 37, estufa1: 37, placa1: 37, placa2: 37, placa3: 37, tubos1: 37, tubos2: 37, tubos3: 37, placa1s: 37, lab_temp: 32, lab_umid: 56, crio_temp: 23, crio_umid: 61 },
]

export default function ControlesLabPage() {
  const [abaAtiva, setAbaAtiva] = useState("nitrogenio")
  const [nitrogenio, setNitrogenio] = useState(nitrogenioInicial)
  const [temperatura, setTemperatura] = useState(temperaturaInicial)
  const [editandoNitro, setEditandoNitro] = useState<{semana: string, bot: string} | null>(null)
  const [editandoTemp, setEditandoTemp] = useState<{data: string, campo: string} | null>(null)

  const checkNivel = (valor: number, min: number, max: number) => {
    if (valor < min || valor > max) return "text-red-600 bg-red-50"
    return "text-emerald-600 bg-emerald-50"
  }

  const checkTemp = (valor: number, min: number, max: number) => {
    if (valor < min || valor > max) return "text-red-600"
    return "text-emerald-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Controles Laboratório</h1>
          <p className="text-sm text-muted-foreground">Nitrogênio líquido e temperatura/umidade</p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      {/* Abas simples */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setAbaAtiva("nitrogenio")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            abaAtiva === "nitrogenio"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Snowflake className="h-4 w-4" />
          Nitrogênio
        </button>
        <button
          onClick={() => setAbaAtiva("temperatura")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            abaAtiva === "temperatura"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Thermometer className="h-4 w-4" />
          Temperatura/Umidade
        </button>
      </div>

      {/* Conteúdo Nitrogênio */}
      {abaAtiva === "nitrogenio" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nível do Nitrogênio — Janeiro</CardTitle>
            <p className="text-xs text-muted-foreground">
              Bot 1/2/3: min 35cm máx 41cm | Bot 4/5: min 25cm máx 38cm | Bot 6-10: min 36cm máx 42cm
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Semana</TableHead>
                    {botijoes.map(b => (
                      <TableHead key={b.id} className="text-center">
                        <div className="flex flex-col items-center">
                          <span>{b.nome}</span>
                          <span className="text-[10px] text-muted-foreground">{b.min}-{b.max}cm</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nitrogenio.map((row) => (
                    <TableRow key={row.semana}>
                      <TableCell className="font-medium">{row.semana}</TableCell>
                      {botijoes.map(b => {
                        const valor = row[b.id as keyof typeof row] as number
                        const status = checkNivel(valor, b.min, b.max)
                        return (
                          <TableCell key={b.id} className={`text-center ${status}`}>
                            <button
                              onClick={() => setEditandoNitro({ semana: row.semana, bot: b.id })}
                              className="w-full hover:underline"
                            >
                              {valor}
                            </button>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Dentro da faixa</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>Fora da faixa</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo Temperatura */}
      {abaAtiva === "temperatura" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Controle de Temperatura e Umidade</CardTitle>
            <p className="text-xs text-muted-foreground">Registro diário — Janeiro 2025</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-center">THERMO<br/><span className="text-[10px]">CO2/Temp</span></TableHead>
                    <TableHead className="text-center">K-sys 1<br/><span className="text-[10px]">CO2/Temp</span></TableHead>
                    <TableHead className="text-center">K-sys 2<br/><span className="text-[10px]">CO2/Temp</span></TableHead>
                    <TableHead className="text-center">Estufa 1</TableHead>
                    <TableHead className="text-center">Placa 1</TableHead>
                    <TableHead className="text-center">Placa 2</TableHead>
                    <TableHead className="text-center">Placa 3</TableHead>
                    <TableHead className="text-center">Tubos 1</TableHead>
                    <TableHead className="text-center">Tubos 2</TableHead>
                    <TableHead className="text-center">Tubos 3</TableHead>
                    <TableHead className="text-center">Placa 1s</TableHead>
                    <TableHead className="text-center">Lab<br/><span className="text-[10px]">Temp/Umid</span></TableHead>
                    <TableHead className="text-center">Crio<br/><span className="text-[10px]">Temp/Umid</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {temperatura.map((row) => (
                    <TableRow key={row.data}>
                      <TableCell className="tabular-nums">{new Date(row.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col">
                          <span className={checkTemp(row.thermo_co2, 7, 9)}>{row.thermo_co2}</span>
                          <span className={checkTemp(row.thermo_temp, 36.5, 37.5)}>{row.thermo_temp}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col">
                          <span className={checkTemp(row.ksys1_co2, 7, 9)}>{row.ksys1_co2}</span>
                          <span className={checkTemp(row.ksys1_temp, 36.5, 37.5)}>{row.ksys1_temp}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col">
                          <span className={checkTemp(row.ksys2_co2, 7, 9)}>{row.ksys2_co2}</span>
                          <span className={checkTemp(row.ksys2_temp, 36.5, 37.5)}>{row.ksys2_temp}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-center ${checkTemp(row.estufa1, 36.5, 37.5)}`}>{row.estufa1}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.placa1, 36, 38)}`}>{row.placa1}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.placa2, 36, 38)}`}>{row.placa2}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.placa3, 36, 38)}`}>{row.placa3}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.tubos1, 36, 38)}`}>{row.tubos1}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.tubos2, 36, 38)}`}>{row.tubos2}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.tubos3, 36, 38)}`}>{row.tubos3}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.placa1s, 36, 38)}`}>{row.placa1s}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col">
                          <span className={checkTemp(row.lab_temp, 20, 25)}>{row.lab_temp}</span>
                          <span className={checkTemp(row.lab_umid, 40, 60)}>{row.lab_umid}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col">
                          <span className={checkTemp(row.crio_temp, 18, 22)}>{row.crio_temp}</span>
                          <span className={checkTemp(row.crio_umid, 30, 50)}>{row.crio_umid}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}