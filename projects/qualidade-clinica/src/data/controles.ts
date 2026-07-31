export interface Botijao {
  id: string
  nome: string
  min: number
  max: number
}

export interface SalaLimite {
  id: string
  nome: string
  umidadeMin: number
  umidadeMax: number
  tempMin: number
  tempMax: number
}

export interface Incubadora {
  id: string
  nome: string
  min: number
  max: number
}

export interface Placa {
  id: string
  nome: string
  min: number
  max: number
}

export interface NitrogenioRow {
  semana: string
  [key: string]: string | number
}

export interface TemperaturaRow {
  data: string
  thermo_co2: number
  thermo_temp: number
  ksys1_co2: number
  ksys1_temp: number
  ksys2_co2: number
  ksys2_temp: number
  estufa1: number
  placa1: number
  placa2: number
  placa3: number
  tubos1: number
  tubos2: number
  tubos3: number
  placa1s: number
  lab_temp: number
  lab_umid: number
  crio_temp: number
  crio_umid: number
}

export const botijoes: Botijao[] = [
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
  { id: "bot11", nome: "Bot 11", min: 36, max: 42 },
  { id: "bot12", nome: "Bot 12", min: 36, max: 42 },
  { id: "bot13", nome: "Bot 13", min: 36, max: 42 },
]

export const salasLimitesInicial: SalaLimite[] = [
  { id: "sala1", nome: "Sala 1", umidadeMin: 40, umidadeMax: 60, tempMin: 20, tempMax: 25 },
  { id: "sala2", nome: "Sala 2", umidadeMin: 40, umidadeMax: 60, tempMin: 20, tempMax: 25 },
  { id: "sala3", nome: "Sala 3", umidadeMin: 40, umidadeMax: 60, tempMin: 20, tempMax: 25 },
  { id: "sala4", nome: "Sala 4", umidadeMin: 40, umidadeMax: 60, tempMin: 20, tempMax: 25 },
]

export const incubadorasInicial: Incubadora[] = [
  { id: "inc1", nome: "Incubadora 1", min: 36.5, max: 37.5 },
  { id: "inc2", nome: "Incubadora 2", min: 36.5, max: 37.5 },
  { id: "inc3", nome: "Incubadora 3", min: 36.5, max: 37.5 },
]

export const placasInicial: Placa[] = [
  { id: "placa1", nome: "Placa 1", min: 36, max: 38 },
  { id: "placa2", nome: "Placa 2", min: 36, max: 38 },
  { id: "placa3", nome: "Placa 3", min: 36, max: 38 },
  { id: "placa4", nome: "Placa 4", min: 36, max: 38 },
  { id: "placa5", nome: "Placa 5", min: 36, max: 38 },
  { id: "placa6", nome: "Placa 6", min: 36, max: 38 },
]

export const nitrogenioInicial: NitrogenioRow[] = [
  { semana: "Semana 1", bot1: 35, bot2: 40, bot3: 37, bot4: 33, bot5: 31, bot6: 38, bot7: 37, bot8: 36, bot9: 38, bot10: 37, bot11: 37, bot12: 38, bot13: 36 },
  { semana: "Semana 2", bot1: 38, bot2: 40, bot3: 39, bot4: 36, bot5: 33, bot6: 39, bot7: 38, bot8: 41, bot9: 40, bot10: 39, bot11: 38, bot12: 39, bot13: 38 },
  { semana: "Semana 3", bot1: 37, bot2: 39, bot3: 35, bot4: 34, bot5: 32, bot6: 40, bot7: 40, bot8: 39, bot9: 39, bot10: 40, bot11: 41, bot12: 38, bot13: 37 },
  { semana: "Semana 4", bot1: 35, bot2: 41, bot3: 38, bot4: 36, bot5: 37, bot6: 41, bot7: 37, bot8: 40, bot9: 38, bot10: 38, bot11: 39, bot12: 40, bot13: 39 },
]

export const temperaturaInicial: TemperaturaRow[] = [
  { data: "2025-01-01", thermo_co2: 8.4, thermo_temp: 37, ksys1_co2: 8, ksys1_temp: 37.1, ksys2_co2: 8, ksys2_temp: 37.1, estufa1: 37, placa1: 37, placa2: 37, placa3: 37, tubos1: 37, tubos2: 37, tubos3: 37, placa1s: 37, lab_temp: 32, lab_umid: 59, crio_temp: 23, crio_umid: 65 },
  { data: "2025-01-02", thermo_co2: 8.3, thermo_temp: 37, ksys1_co2: 7.9, ksys1_temp: 37, ksys2_co2: 8.2, ksys2_temp: 37, estufa1: 37, placa1: 37, placa2: 37, placa3: 37, tubos1: 37, tubos2: 37, tubos3: 37, placa1s: 37, lab_temp: 32, lab_umid: 56, crio_temp: 23, crio_umid: 61 },
]
