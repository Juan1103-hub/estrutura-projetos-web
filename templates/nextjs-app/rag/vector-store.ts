// vector-store.ts — Abstração pgvector + Supabase
// Copiar para src/lib/rag/vector-store.ts no projeto
// Requer: função SQL match_documents (ver references/rag-pattern.md)

import { createClient } from '@supabase/supabase-js'
import { embed } from './embedding'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Document {
  id: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export interface IndexDocument {
  content: string
  metadata: Record<string, unknown>
}

export async function searchSimilar(
  queryText: string,
  options?: {
    matchCount?: number
    filters?: Record<string, unknown>
    tableName?: string
  }
): Promise<Document[]> {
  const queryEmbedding = await embed(queryText)

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: options?.matchCount ?? 5,
    filter_input: options?.filters ?? {},
    table_name: options?.tableName ?? 'documents',
  })

  if (error) throw new Error(`Vector search failed: ${error.message}`)
  return data ?? []
}

export async function searchSimilarByType(
  queryText: string,
  type: string,
  topK = 5
): Promise<Document[]> {
  return searchSimilar(queryText, {
    matchCount: topK,
    filters: { type },
  })
}

export async function searchSimilarByTypeAndCustomer(
  queryText: string,
  type: string,
  customerId: string,
  topK = 5
): Promise<Document[]> {
  return searchSimilar(queryText, {
    matchCount: topK,
    filters: { type, customerId },
  })
}

export async function indexDocument(
  doc: IndexDocument,
  tableName = 'documents'
): Promise<void> {
  const queryEmbedding = await embed(doc.content)

  const { error } = await supabase.from(tableName).insert({
    content: doc.content,
    metadata: doc.metadata,
    embedding: queryEmbedding,
  })

  if (error) throw new Error(`Index failed: ${error.message}`)
}
