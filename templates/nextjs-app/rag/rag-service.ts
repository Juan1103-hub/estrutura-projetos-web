// rag-service.ts — Serviço RAG (Retrieve → Augment → Generate)
// Copiar para src/lib/rag/rag-service.ts no projeto e adaptar

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { searchSimilarByType, searchSimilarByTypeAndCustomer } from './vector-store'

const SYSTEM_PROMPT = `
You are an intelligent recommendation assistant.
Work ONLY with the context provided — never invent items not listed.
Infer the user's interests from their query and history.
Keep the answer concise and friendly, explaining why each item fits.
Write the final response in Brazilian Portuguese.
`

interface RAGQuery {
  query: string
  customerId?: string
  catalogType?: string
  historyType?: string
  topK?: number
}

export async function generateRecommendation(params: RAGQuery): Promise<string> {
  const topK = params.topK ?? 4

  const [catalogResults, historyResults] = await Promise.all([
    searchSimilarByType(params.query, params.catalogType ?? 'PRODUCT', topK),
    params.customerId
      ? searchSimilarByTypeAndCustomer(
          params.query,
          params.historyType ?? 'ORDER_HISTORY',
          params.customerId,
          topK
        )
      : Promise.resolve([]),
  ])

  const augmentedPrompt = buildAugmentedPrompt({
    query: params.query,
    catalogResults,
    historyResults,
    customerId: params.customerId,
  })

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: SYSTEM_PROMPT,
    prompt: augmentedPrompt,
  })

  return text
}

function buildAugmentedPrompt(context: {
  query: string
  catalogResults: { content: string }[]
  historyResults: { content: string }[]
  customerId?: string
}): string {
  return `
The user searched for: "${context.query}".

== AVAILABLE ITEMS (retrieved from catalog) ==
${context.catalogResults.map((d) => d.content).join('\n---\n')}

== USER HISTORY (previously purchased/accessed) ==
${context.historyResults.length > 0 ? context.historyResults.map((d) => d.content).join('\n---\n') : 'No previous history.'}

Infer the user's interests from the search and history above.
Recommend up to 3 items chosen ONLY from the AVAILABLE ITEMS section.
Do NOT recommend anything the user already has.
Keep the whole response to 5 lines maximum: be short, explanatory and to the point.
Write the final recommendation in Brazilian Portuguese.
`
}
