# PRD — qualidade-clinica

> Sistema de gestão da qualidade (QMS) para clínica de reprodução humana assistida.
> Substitui as planilhas Excel FAR (Farmácia) e LAB (Laboratório).

## Contexto

A clínica controla hoje indicadores de qualidade, mapeamento de riscos, rastreio de
medicamentos controlados, criopreservação de sêmen, níveis de nitrogênio, temperatura
de equipamentos e recebimento de insumos em planilhas Excel com dezenas de abas e
200+ colunas. Problemas: sem controle de acesso, sem auditoria, sem alertas, risco de
perda de dados, dificuldade de rastreabilidade em auditorias (acreditação/ANVISA).
Ambiente regulado: formulários codificados (ex.: FO NSP 003, FO-LAB 012), substâncias
controladas (Portaria SVS/MS 344/98 — Propofol, Fentanila), dados sensíveis de saúde
(LGPD Art. 11).

## Usuários

- **Farmácia**: lança indicadores, rastreia medicamentos controlados, consulta estoque de lotes.
- **Laboratório (embriologia/andrologia)**: lança indicadores, níveis de N2, temperaturas, amostras, meios.
- **Qualidade**: gerencia indicadores e metas, revisa riscos, aprova descartes, exporta formulários.
- **Admin**: gerencia usuários, organização, permissões; acessa tudo.
- **Auditor (leitura)**: consulta registros e trilhas de auditoria sem editar. `[PENDENTE: confirmar necessidade]`

## Requisitos Funcionais

### Módulo Farmácia

- RF-001: CRUD de indicadores (código do formulário, descrição, forma de medir, unidade) gerenciável pela qualidade; 4 indicadores iniciais da Farmácia importados das planilhas.
- RF-002: Lançamento mensal de valores por indicador, com meta vigente, comparação automática valor × meta e destaque visual fora da meta.
- RF-003: Gráfico de linha/barra por indicador e por período (filtro mês/ano).
- RF-004: Matriz de riscos por setor: atividade, "O Que? E Se?", consequência, severidade, probabilidade, **grau = severidade × probabilidade (calculado)**, contingência, tratamento, plano de ação, monitoramento, meta, responsável, data de revisão.
- RF-005: Filtro de riscos por setor e grau, com semáforo (baixo/médio/alto).
- RF-006: Rastreio de medicação controlada: data, paciente, medicamento, lote, quantidade, ID receita, observações; cadastro rápido por medicamento (filtro dinâmico).
- RF-007: Busca de medicação por paciente, lote ou período; rastreabilidade completa por lote (recall/auditoria).

### Módulo Laboratório

- RF-008: Indicadores do Laboratório (mesma estrutura RF-001/002/003) com dashboard consolidado lado a lado (dezenas de indicadores).
- RF-009: Controle de nitrogênio: botijões Bot 1–10, leitura semanal, limites mín/máx por grupo de botijões, validação de faixa com alerta, histórico anual navegável por mês.
- RF-010: Andrologia: lançamento diário de temperatura/umidade por equipamento (estufas, placas, suportes, sala lab, sala crio); alerta fora da faixa; registro de não conformidades vinculado a equipamento/data.
- RF-011: Congelamento de sêmen — amostras próprias: data, palhetas, rack, caçapa, botijão, data descarte, motivo, gravidez; código de rastreio da palheta gerado automaticamente.
- RF-012: Congelamento — sêmen doado: doador, banco, ICSI/IIU, SG, nascimento, peso.
- RF-013: "Mapa do botijão": localização física (botijão/rack/caçapa) pesquisável e visual, com ocupação livre/ocupada.
- RF-014: Descarte de amostra: solicitação → pendente → aprovação por qualidade/admin com **termo de autorização anexado** (upload); registra data, motivo, solicitante, aprovador. Alerta de descarte pendente.
- RF-015: Controle de meios/reagentes: fornecedor, insumo, data recebimento, lote, validade, temperatura de recebimento, aspecto visual, responsável; alerta de próximos do vencimento; filtro por fornecedor/mês/insumo.

### Transversais

- RF-016: Autenticação (Supabase Auth) com papéis: farmácia, laboratório, qualidade, admin. Isolamento por `organization_id` (RLS) — 1 org inicial, preparado multi-unidade.
- RF-017: Dashboard geral: indicadores críticos dos 2 módulos + alertas pendentes.
- RF-018: Central de alertas in-app: vencimento de meios, descarte pendente, temperatura/umidade fora da faixa, N2 fora do limite, indicador abaixo da meta; badge no menu.
- RF-019: Trilha de auditoria imutável: quem alterou qual registro, quando, valor anterior/novo; log de acesso a dados pessoais sensíveis (LGPD).
- RF-020: Exportação Excel/PDF com **réplica fiel do layout das planilhas**, incluindo código do formulário (ex.: FO NSP 003).
- RF-021: Importação inicial dos dados históricos dos arquivos Excel reais (FAR/LAB) com validação e relatório de inconsistências.
- RF-022: Filtro por período (mês/ano) em todas as séries temporais.
- RF-023: Consentimento LGPD do titular (paciente/doador): versão da política, data, finalidades; imutável.

## Requisitos Não Funcionais

- RNF-001: LGPD — dados sensíveis de saúde identificados com consentimento; mascaramento parcial em listagens; nunca em logs de app, URLs ou analytics; criptografia em trânsito/repouso.
- RNF-002: RLS em todas as tabelas por `organization_id` + papel; `service_role` nunca no client.
- RNF-003: Retenção legal: dados clínicos ≥ 20 anos (CFM 1.821/2007); criopreservação enquanto amostra existir + prazo legal; logs de auditoria ≥ 5 anos; expurgo programado, nunca hard-delete de dado clínico.
- RNF-004: Movimentações com múltiplos itens atômicas (RPC transacional); imutabilidade de registros confirmados (correção por estorno/retificação).
- RNF-005: Performance: tabela de congelamento com 2000+ linhas — paginação server-side, índices por botijão/rack/caçapa/lote/paciente.
- RNF-006: Acessibilidade WCAG 2.1 AA; UI PT-BR; sem emojis (Lucide).
- RNF-007: Testes: Vitest (unit/componente) + Playwright (E2E fluxos críticos); gate de testes antes de cada task.

## User Stories (principais)

- US-001: Como farmacêutica, quero lançar o valor mensal do indicador FO NSP 003 e ver imediatamente se ficou fora da meta.
  - Critérios: valor × meta com destaque; gráfico atualizado; filtro por período.
- US-002: Como responsável da qualidade, quero cadastrar um novo indicador com meta sem depender de desenvolvedor.
  - Critérios: CRUD de indicadores restrito a qualidade/admin; meta com vigência.
- US-003: Como embriologista, quero localizar a palheta de um paciente no mapa do botijão (rack/caçapa/posição).
  - Critérios: busca por paciente/código; visualização de ocupação; código de rastreio único.
- US-004: Como qualidade, quero aprovar um descarte apenas com o termo assinado anexado.
  - Critérios: sem anexo não aprova; registro de solicitante/aprovador/data; alerta de pendência.
- US-005: Como andrologista, quero ser alertado quando a temperatura de uma estufa sair da faixa.
  - Critérios: validação no lançamento; alerta na central; não conformidade vinculada.
- US-006: Como auditor, quero rastrear todas as dispensas de Fentanila de um lote específico.
  - Critérios: busca por lote retorna pacientes/datas/quantidades; exportável.
- US-007: Como gestor, quero ver num só painel os indicadores fora da meta e alertas pendentes dos 2 módulos.

## Pendências

- [PENDENTE]: usuário fornecerá os arquivos Excel FAR e LAB na implementação (importação + layouts de exportação).
- [PENDENTE]: confirmar se papel "auditor (somente leitura)" é necessário no MVP.
- [PENDENTE]: limites exatos por grupo de botijões e faixas por equipamento — virão das planilhas reais.
- [PENDENTE]: política de privacidade/termo de consentimento — texto fornecido pela clínica.
