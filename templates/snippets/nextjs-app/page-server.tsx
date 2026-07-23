// page-server.tsx — Server Component com listagem
// Copiar e adaptar entidade, colunas e campos

import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Produtos | MyApp',
  description: 'Gerenciamento de produtos',
}

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} registro(s)
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 min-h-[44px]"
        >
          <Plus size={16} />
          Novo Produto
        </Link>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Nome
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Preço
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Estoque
              </th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border hover:bg-muted/50"
              >
                <td className="py-3 px-4 font-medium">{product.name}</td>
                <td className="py-3 px-4 tabular-nums">
                  R${' '}
                  {product.price.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="py-3 px-4 tabular-nums">{product.stock}</td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/products/${product.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum produto cadastrado.
          </div>
        )}
      </div>
    </div>
  )
}
