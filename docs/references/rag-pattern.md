# RAG Pattern — Next.js + Supabase pgvector

Padrão arquitetural de **Retrieval-Augmented Generation** (RAG) adaptado
do repositório `MichelliBrito/rag-spring-ai` para o stack:

Next.js 16 + Supabase (pgvector) + Prisma + OpenAI/LLM

---

## Arquitetura geral

```
Indexação (write):
  Entidade → toEmbeddableText() → OpenAI embedding → salvar no pgvector

Consulta (read):
  Query → embedding() → pgvector similarity search → augmented prompt → LLM → resposta
```

## Componentes

### 1. Embedding Service (`lib/rag/embedding.ts`)
Converte texto em vetor de embedding via OpenAI.

```typescript
export async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return res.data[0].embedding
}
```

### 2. Vector Store (`lib/rag/vector-store.ts`)
Abstração sobre Supabase pgvector com filtro por metadados.

```typescript
export async function searchSimilar(
  table: string,
  queryText: string,
  filters?: Record<string, unknown>,
  topK = 5
): Promise<Document[]> {
  const queryEmbedding = await embed(queryText)
  const { data } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: topK,
    filter_input: filters ?? {},
    table_name: table,
  })
  return data ?? []
}
```

### 3. RAG Service (`lib/rag/rag-service.ts`)
Orquestra o ciclo Retrieve → Augment → Generate.

```typescript
export async function generateRecommendation(params: {
  query: string
  customerId: string
  topK?: number
}): Promise<string> {
  // 1. RETRIEVAL — busca similaridade no pgvector
  const catalog = await searchSimilar('products', params.query, { type: 'PRODUCT' })
  const history = await searchSimilar('orders', params.query, {
    type: 'ORDER_HISTORY', customerId: params.customerId,
  })

  // 2. AUGMENTATION — monta prompt com contexto
  const prompt = buildAugmentedPrompt(params.query, catalog, history)

  // 3. GENERATION — chama LLM
  return callLLM(prompt)
}
```

## Schema Prisma (pgvector)

```prisma
// Exemplo: tabela de documentos vetoriais
model Document {
  id        String   @id @default(cuid())
  content   String   // texto embeddable
  metadata  Json     // { type: "PRODUCT", customerId: "...", etc }
  embedding Vector   // pgvector: gerado via trigger ou app layer
  createdAt DateTime @default(now())

  @@index([metadata], type: Gin)
}
```

> **Atenção**: adicionar `extensions: [pgvector]` no datasource do Prisma
> schema e habilitar a extensão no Supabase:
> ```sql
> CREATE EXTENSION IF NOT EXISTS vector;
> ```

## Função SQL de busca (obrigatória no Supabase)

```sql
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter_input jsonb DEFAULT '{}'::jsonb,
  table_name text DEFAULT 'documents'
)
RETURNS TABLE(id text, content text, metadata jsonb, similarity float)
LANGUAGE plpgsql SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT id, content, metadata,
            1 - (embedding <=> %L::vector) AS similarity
     FROM %I
     WHERE metadata @> %L
     ORDER BY embedding <=> %L::vector
     LIMIT %L',
    query_embedding, table_name, filter_input, query_embedding, match_count
  );
END;
$$;
```

## Casos de uso comuns

| Feature | Indexa | Busca | Gera |
|---|---|---|---|
| Recomendação de produtos | Catálogo + histórico | Nome do pedido | Sugestão contextual |
| FAQ inteligente | Artigos/base de conhecimento | Pergunta do usuário | Resposta com fontes |
| Busca semântica | Conteúdo textual | Query do usuário | Resultados rankeados |
| Suporte contextual | Tickets + respostas | Descrição do problema | Sugestão de solução |

## Regras

1. **Nunca gerar embedding no client** — sempre Server Action ou API route
2. **Metadata filtering obrigatório** — separar domínios por `type` no JSONB
3. **Security invoker** na função de busca (`SECURITY INVOKER`)
4. **RLS** na tabela de documentos vetoriais
5. **System prompt fixo** — nunca concatenar input do usuário direto no system
6. **Augmented prompt sempre** — contexto recuperado + instrução de não alucinar
7. **TopK pequeno** — 3 a 10 resultados para manter contexto enxuto
