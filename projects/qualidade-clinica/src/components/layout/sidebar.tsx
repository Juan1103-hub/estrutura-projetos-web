"use client"

import { useAuth } from "./auth-provider"
import { useSetor } from "@/lib/setor-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Pill,
  Settings,
  Shield,
  Thermometer,
  FileText,
  Package,
} from "lucide-react"

type NavLinkItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

type NavGroup = {
  group: string
  items: NavLinkItem[]
}

type NavItem = NavLinkItem | NavGroup

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "qualidade", "farmacia", "laboratorio", "enfermagem"],
  },
  {
    group: "Farmácia",
    items: [
      { label: "Indicadores", href: "/farmacia/indicadores", icon: Activity, roles: ["admin", "qualidade", "farmacia"] },
      { label: "Indicadores Extras", href: "/farmacia/indicadores-extras", icon: FileText, roles: ["admin", "qualidade", "farmacia"] },
      { label: "Matriz de Riscos", href: "/farmacia/riscos", icon: Shield, roles: ["admin", "qualidade", "farmacia"] },
      { label: "Med. Controlada", href: "/farmacia/medicacao-controlada", icon: Pill, roles: ["admin", "farmacia"] },
    ],
  },
  {
    group: "Laboratório",
    items: [
      { label: "Indicadores", href: "/laboratorio/indicadores", icon: Activity, roles: ["admin", "qualidade", "laboratorio"] },
      { label: "Controles", href: "/laboratorio/controles", icon: Thermometer, roles: ["admin", "laboratorio"] },
      { label: "Insumos", href: "/laboratorio/insumos", icon: Package, roles: ["admin", "laboratorio"] },
    ],
  },
  {
    label: "Administração",
    href: "/admin",
    icon: Settings,
    roles: ["admin"],
  },
]

function hasAccess(roles: string[], userRole: string | undefined) {
  if (!userRole) return true // dev mode: show all
  return roles.includes(userRole)
}

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const { setor } = useSetor()
  const pathname = usePathname()

  // Mapear setor para role
  const userRole = setor || profile?.role || "farmacia"

  return (
    <aside className="flex h-screen w-[260px] flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          QC
        </div>
        <span className="font-semibold text-sm">Qualidade Clínica</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item, i) => {
          if ("items" in item) {
            const visibleItems = item.items.filter((sub) => hasAccess(sub.roles, userRole))
            if (visibleItems.length === 0) return null
            return (
              <div key={i} className="mb-3">
                <p className="px-3 pb-1 text-xs font-medium tracking-wider uppercase text-sidebar-foreground/40">
                  {item.group}
                </p>
                {visibleItems.map((sub) => (
                  <NavLink
                    key={sub.href}
                    href={sub.href}
                    icon={sub.icon}
                    label={sub.label}
                    active={pathname.startsWith(sub.href)}
                  />
                ))}
              </div>
            )
          }
          if (!hasAccess(item.roles, userRole)) return null
          return (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname.startsWith(item.href)}
            />
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold uppercase">
            {profile?.display_name?.charAt(0) ?? setor?.charAt(0) ?? "?"}
          </div>
          <div className="flex-1 truncate text-sm">{profile?.display_name ?? setor ?? "Usuário"}</div>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}