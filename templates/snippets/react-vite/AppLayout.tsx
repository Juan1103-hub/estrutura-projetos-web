// AppLayout.tsx — Layout com sidebar + main content
// Copiar e adaptar itens da sidebar e rotas

import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number }>
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Usuários', href: '/users', icon: Users },
  { label: 'Configurações', href: '/settings', icon: Settings },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <span className="text-lg font-semibold text-sidebar-foreground">
            MyApp
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1" aria-label="Menu principal">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <button
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 w-full"
            aria-label="Sair da conta"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="flex items-center h-16 px-4 border-b border-border lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-foreground hover:bg-muted"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3 text-lg font-semibold">MyApp</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
