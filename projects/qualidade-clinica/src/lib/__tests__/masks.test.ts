import { describe, it, expect } from "vitest"
import { maskName, maskCPF, maskRG, maskPhone, maskEmail } from "../masks"

describe("maskName", () => {
  it("deve mascarar nome completo", () => {
    expect(maskName("Maria Silva")).toBe("M***a S***a")
  })

  it("deve mascarar nome único", () => {
    expect(maskName("João")).toBe("J**o")
  })

  it("deve preservar nome curto (2 chars)", () => {
    expect(maskName("Lu")).toBe("Lu")
  })

  it("deve lidar com string vazia", () => {
    expect(maskName("")).toBe("")
  })

  it("deve lidar com null/undefined", () => {
    expect(maskName(null as unknown as string)).toBe("")
    expect(maskName(undefined as unknown as string)).toBe("")
  })

  it("deve mascarar múltiplos sobrenomes", () => {
    expect(maskName("Ana Clara Souza Santos")).toBe("A*a C***a S***a S****s")
  })

  it("deve preservar nome com 3 letras", () => {
    expect(maskName("Ana")).toBe("A*a")
  })
})

describe("maskCPF", () => {
  it("deve mascarar CPF formatado", () => {
    expect(maskCPF("123.456.789-00")).toBe("***.456.789-**")
  })

  it("deve mascarar CPF sem formatação", () => {
    expect(maskCPF("12345678900")).toBe("***.456.789-**")
  })

  it("deve retornar original se inválido", () => {
    expect(maskCPF("123")).toBe("123")
  })
})

describe("maskRG", () => {
  it("deve mascarar RG", () => {
    expect(maskRG("12.345.678-9")).toBe("**********-9")
  })

  it("deve preservar RG curto", () => {
    expect(maskRG("ab")).toBe("ab")
  })
})

describe("maskPhone", () => {
  it("deve mascarar telefone", () => {
    expect(maskPhone("11987654321")).toBe("(11) ****-4321")
  })

  it("deve mascarar telefone formatado", () => {
    expect(maskPhone("(11) 98765-4321")).toBe("(11) ****-4321")
  })
})

describe("maskEmail", () => {
  it("deve mascarar email", () => {
    expect(maskEmail("maria@email.com")).toBe("ma***@email.com")
  })

  it("deve lidar com email sem domínio", () => {
    expect(maskEmail("invalido")).toBe("invalido")
  })
})