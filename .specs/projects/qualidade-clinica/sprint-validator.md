# Sprint Validator — qualidade-clinica

## Cobertura de requisitos

| RF/US | Task | Teste | Status |
|---|---|---|---|
| RF-001/002/003, US-001/002 | T-007/008/009 | indicator-rpc, target-compare | pendente |
| RF-004/005 | T-010 | risk-grade | pendente |
| RF-006/007, US-006 | T-011 | lot-trace, E2E | pendente |
| RF-008 | T-013 | — | pendente |
| RF-009 | T-014 | range-check | pendente |
| RF-010, US-005 | T-015 | range-check | pendente |
| RF-011/012/013, US-003 | T-016/017 | allocate-atomic, E2E cryo-flow | pendente |
| RF-014, US-004 | T-018 | disposal-rpc | pendente |
| RF-015 | T-019 | — | pendente |
| RF-016 | T-002/003 | rls-policies, route-guard, E2E login | pendente |
| RF-017/018, US-007 | T-005/020 | alert-cron | pendente |
| RF-019 | T-004 | audit-trigger | pendente |
| RF-020 | T-021/022 | diff visual (usuário) | pendente |
| RF-021 | T-023 | import-validation | pendente |
| RF-022 | T-009/011/014/017 | — | pendente |
| RF-023, RNF-001 | T-004/006 | masks | pendente |
| RNF-002/003/004 | T-002/004/007/016/024 | rls + rpc atômicas | pendente |
| RNF-005 | T-017 (paginação server-side) | — | pendente |
| RNF-006 | /audit-ui por tela | — | pendente |
| RNF-007 | gate por task | — | pendente |

## Dependências

- T-021/T-022/T-023 dependem dos arquivos Excel reais (FAR/LAB) — **usuário fornece**; batches 1–3 não dependem e podem começar.
- T-008/009 dependem de T-007; T-013 reutiliza T-007–009; T-017 depende de T-016; T-018 depende de T-016; T-020 agrega alertas de T-014/015/018/019.
- Ordem: Batch 1 → 2 → 3 → 4 (sequencial; workers sub-agent ofertados na execução).

## Riscos

- Réplica fiel de exportação pode ser inviável para layouts muito irregulares → mitigação: piloto T-021 valida a abordagem antes do batch completo; fallback = relatório limpo + anexo da planilha original.
- Dados históricos sujos/inconsistentes nas planilhas → mitigação: ETL com relatório de inconsistências, carga atômica por arquivo.
- Faixas/limites desconhecidos até a importação → mitigação: seeds parametrizáveis, confirmação com usuário no T-023.
- Escopo grande (24 tasks) → mitigação: batches com checkpoint de verificação; MVP pode congelar escopo após Batch 3 se necessário (exportação fica para fase 2).

## Validação

- [x] Tasks cobrem todos os RFs
- [x] Tasks cobrem todos os critérios de aceite mapeados
- [x] Dependências resolvidas ou registradas (Excel real = pendência do usuário)
- [x] Riscos identificados com mitigação
- [x] Testes planejados para cada task crítica
- [x] Ordem de execução definida (4 batches)

## Próximo passo

Aguardar `APROVAR PLANO E INICIAR` do usuário.
