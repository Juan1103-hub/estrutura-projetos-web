export function maskName(name: string): string {
  if (!name || name.length < 2) return name ?? ""
  const parts = name.trim().split(/\s+/)
  return parts
    .map((part) => {
      if (part.length <= 2) return part
      return part[0] + "*".repeat(part.length - 2) + part[part.length - 1]
    })
    .join(" ")
}

export function maskCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return cpf
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`
}

export function maskRG(rg: string): string {
  if (!rg || rg.length < 3) return rg ?? ""
  return "*".repeat(rg.length - 2) + rg.slice(-2)
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 10) return phone
  return `(${digits.slice(0, 2)}) ****-${digits.slice(-4)}`
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!domain) return email
  const visible = Math.min(2, local.length)
  return local.slice(0, visible) + "***@" + domain
}