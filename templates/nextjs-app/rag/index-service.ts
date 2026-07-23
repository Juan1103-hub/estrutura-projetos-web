// index-service.ts — Indexação de entidades no pgvector
// Copiar e adaptar por entidade (ex: ProductIndexService, OrderIndexService)

import { indexDocument, type IndexDocument } from './vector-store'
import { toEmbeddableText } from './embedding'

export interface IndexableEntity {
  id: string
  name: string
  description?: string
  category?: string
  location?: string
  tags?: string[]
  price?: number
  currency?: string
}

export async function indexProduct(entity: IndexableEntity): Promise<void> {
  const content = toEmbeddableText({
    name: entity.name,
    description: entity.description ?? '',
    category: entity.category ?? '',
    location: entity.location ?? '',
    tags: entity.tags?.join(', ') ?? '',
    price: entity.price != null ? `${entity.price} ${entity.currency ?? ''}` : '',
  })

  const doc: IndexDocument = {
    content,
    metadata: {
      type: 'PRODUCT',
      productId: entity.id,
      name: entity.name,
      location: entity.location,
      category: entity.category,
    },
  }

  await indexDocument(doc)
}

export async function indexOrderHistory(params: {
  orderId: string
  customerId: string
  orderName: string
  orderLocation: string
}): Promise<void> {
  const content = `Customer ${params.customerId} purchased "${params.orderName}" in ${params.orderLocation}.`

  const doc: IndexDocument = {
    content,
    metadata: {
      type: 'ORDER_HISTORY',
      customerId: params.customerId,
      orderId: params.orderId,
    },
  }

  await indexDocument(doc)
}
