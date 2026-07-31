"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Snowflake, Thermometer, Droplets, Save, AlertTriangle, CheckCircle2, Settings, SlidersHorizontal, GripHorizontal } from "lucide-react"
import { botijoes, salasLimitesInicial, incubadorasInicial, placasInicial, nitrogenioInicial, temperaturaInicial } from "@/data/controles"

export default function ControlesLabPage() {
  const [abaAtiva, setAbaAtiva] = useState("limites")
  const [nitrogenio, setNitrogenio] = useState(nitrogenioInicial)
  const [temperatura, setTemperatura] = useState(temperaturaInicial)
  const [botijoesState, setBotijoesState] = useState(botijoes)
  const [salasState, setSalasState] = useState(salasLimitesInicial)
  const [incubadorasState, setIncubadorasState] = useState(incubadorasInicial)
  const [placasState, setPlacasState] = useState(placasInicial)
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
          <p className="text-sm text-muted-foreground">Nitrogênio, temperatura, umidade e limites configuráveis</p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setAbaAtiva("limites")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            abaAtiva === "limites"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Limites
        </button>
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

      {/* Aba Limites */}
      {abaAtiva === "limites" && (
        <div className="space-y-6">
          {/* Nitrogênio — 13 bujões */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Snowflake className="h-4 w-4 text-cyan-600" />
                Nitrogênio — 13 Bujões
              </CardTitle>
              <p className="text-xs text-muted-foreground">Limites individuais por botijão (cm)</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Botijão</TableHead>
                      <TableHead className="text-center w-28">Mínimo (cm)</TableHead>
                      <TableHead className="text-center w-28">Máximo (cm)</TableHead>
                      <TableHead className="text-center w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {botijoesState.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.nome}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={b.min}
                            onChange={(e) => setBotijoesState(botijoesState.map(bj => bj.id === b.id ? { ...bj, min: parseInt(e.target.value) || 0 } : bj))}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={b.max}
                            onChange={(e) => setBotijoesState(botijoesState.map(bj => bj.id === b.id ? { ...bj, max: parseInt(e.target.value) || 0 } : bj))}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {b.max > b.min ? (
                            <span className="text-xs text-emerald-600 flex items-center justify-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> OK
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 flex items-center justify-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Inválido
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Umidade — 4 salas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="h-4 w-4 text-cyan-600" />
                Umidade — 4 Salas
              </CardTitle>
              <p className="text-xs text-muted-foreground">Limites individuais por sala (%)</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sala</TableHead>
                      <TableHead className="text-center w-28">Mínimo (%)</TableHead>
                      <TableHead className="text-center w-28">Máximo (%)</TableHead>
                      <TableHead className="text-center w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salasState.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.nome}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={s.umidadeMin}
                            onChange={(e) => setSalasState(salasState.map(sl => sl.id === s.id ? { ...sl, umidadeMin: parseInt(e.target.value) || 0 } : sl))}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={s.umidadeMax}
                            onChange={(e) => setSalasState(salasState.map(sl => sl.id === s.id ? { ...sl, umidadeMax: parseInt(e.target.value) || 0 } : sl))}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {s.umidadeMax > s.umidadeMin ? (
                            <span className="text-xs text-emerald-600 flex items-center justify-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> OK
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 flex items-center justify-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Inválido
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Temperatura — 4 salas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-600" />
                Temperatura Ambiente — 4 Salas
              </CardTitle>
              <p className="text-xs text-muted-foreground">Limites individuais por sala (°C)</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sala</TableHead>
                      <TableHead className="text-center w-28">Mínimo (°C)</TableHead>
                      <TableHead className="text-center w-28">Máximo (°C)</TableHead>
                      <TableHead className="text-center w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salasState.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.nome}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={s.tempMin}
                            onChange={(e) => setSalasState(salasState.map(sl => sl.id === s.id ? { ...sl, tempMin: parseFloat(e.target.value) || 0 } : sl))}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={s.tempMax}
                            onChange={(e) => setSalasState(salasState.map(sl => sl.id === s.id ? { ...sl, tempMax: parseFloat(e.target.value) || 0 } : sl))}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {s.tempMax > s.tempMin ? (
                            <span className="text-xs text-emerald-600 flex items-center justify-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> OK
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 flex items-center justify-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Inválido
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Incubadoras — 3 unidades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GripHorizontal className="h-4 w-4 text-purple-600" />
                Incubadoras — 3 Unidades
              </CardTitle>
              <p className="text-xs text-muted-foreground">Limites individuais por incubadora (°C)</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-center w-28">Mínimo (°C)</TableHead>
                      <TableHead className="text-center w-28">Máximo (°C)</TableHead>
                      <TableHead className="text-center w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incubadorasState.map((inc) => (
                      <TableRow key={inc.id}>
                        <TableCell className="font-medium">{inc.nome}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={inc.min}
                            onChange={(e) => setIncubadorasState(incubadorasState.map(i => i.id === inc.id ? { ...i, min: parseFloat(e.target.value) || 0 } : i))}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={inc.max}
                            onChange={(e) => setIncubadorasState(incubadorasState.map(i => i.id === inc.id ? { ...i, max: parseFloat(e.target.value) || 0 } : i))}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {inc.max > inc.min ? (
                            <span className="text-xs text-emerald-600 flex items-center justify-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> OK
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 flex items-center justify-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Inválido
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Placas — 6 unidades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GripHorizontal className="h-4 w-4 text-amber-600" />
                Placas — 6 Unidades
              </CardTitle>
              <p className="text-xs text-muted-foreground">Limites individuais por placa (°C)</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-center w-28">Mínimo (°C)</TableHead>
                      <TableHead className="text-center w-28">Máximo (°C)</TableHead>
                      <TableHead className="text-center w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {placasState.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.nome}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={p.min}
                            onChange={(e) => setPlacasState(placasState.map(pl => pl.id === p.id ? { ...pl, min: parseFloat(e.target.value) || 0 } : pl))}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={p.max}
                            onChange={(e) => setPlacasState(placasState.map(pl => pl.id === p.id ? { ...pl, max: parseFloat(e.target.value) || 0 } : pl))}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {p.max > p.min ? (
                            <span className="text-xs text-emerald-600 flex items-center justify-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> OK
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 flex items-center justify-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Inválido
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conteúdo Nitrogênio */}
      {abaAtiva === "nitrogenio" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nível do Nitrogênio — Janeiro</CardTitle>
            <p className="text-xs text-muted-foreground">
              Limites individuais configurados na aba "Limites"
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Semana</TableHead>
                    {botijoesState.map(b => (
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
                      {botijoesState.map(b => {
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
                      <TableCell className={`text-center ${checkTemp(row.placa1, placasState[0].min, placasState[0].max)}`}>{row.placa1}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.placa2, placasState[1].min, placasState[1].max)}`}>{row.placa2}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.placa3, placasState[2].min, placasState[2].max)}`}>{row.placa3}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.tubos1, 36, 38)}`}>{row.tubos1}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.tubos2, 36, 38)}`}>{row.tubos2}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.tubos3, 36, 38)}`}>{row.tubos3}</TableCell>
                      <TableCell className={`text-center ${checkTemp(row.placa1s, 36, 38)}`}>{row.placa1s}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col">
                          <span className={checkTemp(row.lab_temp, salasState[0].tempMin, salasState[0].tempMax)}>{row.lab_temp}</span>
                          <span className={checkTemp(row.lab_umid, salasState[0].umidadeMin, salasState[0].umidadeMax)}>{row.lab_umid}%</span>
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