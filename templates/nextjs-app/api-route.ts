// api-route.ts — API Route CRUD
// Copiar e adaptar entidade, campos e validação

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.number().positive('Preço deve ser positivo'),
  stock: z.number().int().min(0, 'Estoque não pode ser negativo'),
  categoryId: z.string().optional(),
})

// GET /api/products
export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })
  return NextResponse.json(products)
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = productSchema.parse(body)

    const product = await prisma.product.create({ data })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = productSchema.partial().parse(body)

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Produto não encontrado' },
      { status: 404 }
    )
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({ where: { id: params.id } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json(
      { error: 'Produto não encontrado' },
      { status: 404 }
    )
  }
}
