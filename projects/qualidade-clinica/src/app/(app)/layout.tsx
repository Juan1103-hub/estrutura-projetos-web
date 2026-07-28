import { Providers } from "@/components/layout/providers"
import { Sidebar } from "@/components/layout/sidebar"
import { SetorProvider } from "@/lib/setor-context"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SetorProvider>
      <Providers>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
          </main>
        </div>
      </Providers>
    </SetorProvider>
  )
}