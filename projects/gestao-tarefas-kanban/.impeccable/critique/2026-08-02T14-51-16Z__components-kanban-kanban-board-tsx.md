---
target: kanban board (Vórtice Mineral)
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
timestamp: 2026-08-02T14-51-16Z
slug: components-kanban-kanban-board-tsx
---
# Critique — Gestão de Tarefas Kanban · Vórtice Mineral

## Design Health Score
Avaliação via 2 sub-agentes independentes (A design review, B detector/browser).

| # | Heurística | Nota | Achado-chave |
|---|-----------|------|--------------|
| 1 | Visibility of system status | 3 | Drag overlay + ring-laranja no drop + "1 filtro ativo" + "Apoio solicitado" — bom feedback |
| 2 | Match system/real world | 3 | Pt-BR natural ("Vence em breve", "Aguardando Terceiros"); "Aguardando Terceiros" um pouco ambíguo p/ novato |
| 3 | User control & freedom | 3 | Esc/Fechar no modal, "Limpar" reseta filtros; SEM undo no drag |
| 4 | Consistency & standards | 4 | Tokens OKLCH coesos; violações só no "rainbow" das cores third-party |
| 5 | Error prevention | 3 | Aprovação requer confirmação+motivo; drag sem guardrail/undo |
| 6 | Recognition rather than recall | 2 | Categoria = 20 itens num dropdown (overload); busca só por título/desc |
| 7 | Flexibility/efficiency | 3 | busca, filtros, dnd, export, sino — poderoso; falta bulk/keyboard reorder |
| 8 | Aesthetic & minimalist | 4 | Densidade industrial, âmbar escasso nos primários; mancha = rainbow dos chips |
| 9 | Error recovery | 2 | Rejeição echo motivo; sem toast/undo no drag; sem "filtro zerou tudo" |
| 10 | Help & documentation | 2 | Labels claros; sem onboarding/legend/empty explain |
| **Total** | | **28/40** | Média 2.8 — band **Acceptable** (~70%) |

## Design Specificity Verdict
- **LLM:** A direção ("Sala de Controle Industrial", âmbar-pirita, ardósia, uppercase) é genuinamente autor-paga p/ Vórtice Mineral, NÃO categória-interchangeável. Porém a execução subverte a identidade em ~40%: pills de status/prioridade/categoria em cor rainbow third-party rebaixam p/ um kanban genérico.
- **Determinístico (B):** detector = 4 achados de font-size, todos **falsos positivos** (DESIGN.md documenta badges text-[10-12px]). O gap real é a deriva azul: 12 classes blue + 6 purple hard-coded fora da paleta (barra progresso bg-blue-500, avatares, pill "baixa", status a_fazer/em_andamento, border upload, pill approved).
- Resumo: especificidade de direção alta; execução de cards cai p/ categórica-interchangeable.

## Overall Impression
Ótimo esqueleto industrial; o maior boom é alinhar as cores dos cards à paleta comprometida (remover rainbow) e reduzir o ruído visual das 7 lanes. O detector pegou 1 funcional que A não viu: hydration-mismatch do dnd-kit.

## What's Working
1. **Identidade industrial de verdade** — âmbar-pirita escasso, ardósia, uppercase, ring-1 flat. Não é vibe SaaS.
2. **Radar de prazo + pedido de apoio** — triagem at-a-glance valiosa ("em 2 dias" rel + êmber/red + ⚠ apoio).
3. **Modal 5-concern->4-tab progressivo** — Informação/Checklist/Anexos/Comentários/Histórico, denso mas concluível.
4. **Interaction set honesto** — drag-drop + export + filtros + aprovação, tudo alcançável e descoberta por ícone+label.

## Priority Issues
- **[P0] Board 7-lanes com scroll horizontal (2384px)**: 5 de 7 lanes offscreen numa widesse; operador não vê urgência à vista. Fix: colapsar "Cancelado" num drill, agrupar "Aguardando…", ou toggle "1-line card" + ordem prior-Amb-Column. ($impeccable layout / distill)
- **[P1] Rainbow de cores third-party (One-Hue Slate violation)**: task-card (pills bg-blue-100/yellow/orange/red, progress bg-blue-500), kanban-column (count badge rainbow), task-info (avatar bg-blue-500, categoria bg-purple-500/10). Fix: rewrite p/ slate+teal+amber weights, red só overdue/critical, amber só brand/focus. ($impeccable polish)
- **[P2] Categoria 20-item dropdown**: overload ≥4. Fix: two-step (3 departamentos → ≤7 cat) ou filter chips. ($impeccable layout / distill)
- **[P2] Rotas de cor deadline vs prioridade**: "Alta" (orange) e deadline (orange) e atrasada (red) e critical (red) colidem. Fix: prazo com ícone/forma purse vs pill; overdue vermelho, urgency com chip ⚠. ($impeccable polish / clarify)
- **[P3] Sem undo de movimento (drag)**: a slip ao mover p/ coluna errada sem "Desfazer". Fix: toast "Movido p/ X [Desfazer]". ($impeccable animate / polish)
- **[P3] Hydration-mismatch (detector, determinístico)**: `aria-describedby="DndDescribedBy-N"` server vs client `-0` em cada card. Fix: SSR-consistent dnd id (suppressHydrationWarning ou estabilizar). ($impeccable optimize / polish)
- **[P3] Demo auto-login + sem legendas de fluxo p/ iniciante**: remover demo + legenda de Help afiliação. ($impeccable onboard)

## Persona Red Flags
- **Alex (power)**: sem keyboard/dnd-reorder surfaced, sem "show only my column", categoria 20 itens = clicks extras. O drag é o win, mas sem bulk.
- **Jordan (first-timer)**: 7 lanes jargon + demo auto-login quebra o modelo de auth; "Aguardando Terceiros" não se explicita; empty-state só no "Cancelado".
- **Sam (a11y)**: cores carregam sentido (deadline vs priority vs overdue vs col — todos cor-coded, alguine no colorblind); dnd sem affordance de teclado (sem handle/alt). Categoria 20 itens fere reconhecimento.

## Minor Observations
- Status label no modal mantém "Backlog" capitalizado vs colunas lower — nit de consistência (design quer uppercase só no painel).
- User chip usa bg-white/60 num tema ardósia — briga c/ tokens dark (kanban-board).
- Busca só title/desc; busca "responsável" não filtra e não avisa (empty-state seq).
- Export sem feedback de sucesso; sino mostra count sem detail (aria-live hoje ausente).
- O portal modal tabs viram ícones no mobile — perde label discoverability.

## Questions to Consider
- "Se eu remover o ambar de cada card, a estrutura ainda lê 'Vórtice' ou vira task app genérico?"
- "Esconder Cancelado + juntar 2 Lans Aguardando → o operador ganha velocidade p/ achar o vermelho/ambaroo de hoje?"
- "Qual é a cor mais redundante num card (pill prioridade? pill categoria? badge coluna?) que, se removida, deixa 'vermelho = atrasada' a ÚNICA cor vermelha restante?"
