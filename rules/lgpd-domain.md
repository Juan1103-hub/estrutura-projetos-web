# Regras de Domínio — LGPD / Dados Pessoais

Aplicar obrigatoriamente em projetos ou features com dado pessoal (nome,
CPF, e-mail, telefone, endereço, biometria, geolocalização, IP, dados
financeiros pessoais, saúde, comportamento, opinião política, religiosa,
sexual, etc.). Roteado por `rules/domain-routing.md`.

---

## Descoberta obrigatória (Discovery)

Antes de definir schema, RLS, APIs ou telas, esclarecer e registrar no PRD:

1. Quais dados pessoais são coletados? Listar cada um.
2. Para cada dado, qual a **base legal** (consentimento, contrato,
   obrigação legal, legítimo interesse, exercício de direitos, tutela)?
3. Qual a **finalidade** de cada dado? Está clara para o titular?
4. Há dados sensíveis (saúde, biometria, orientação, etnia, filiação
   sindical/partidária, religião)? Exigem proteção reforçada.
5. Há crianças/adolescentes? Exige consentimento dos responsáveis.
6. Há transferência internacional de dados? Para quais países/provedores?
7. Há compartilhamento com terceiros (parceiros, Instagram Meta, etc.)?
8. Há perfilamento ou decisões automatizadas? Titular tem direito de
   revisão humana.
9. Qual o tempo de retenção por dado? Após, apagar ou anonimizar.
10. Há processo de exclusão / portabilidade / acesso do titular previsto?
11. Quem é o DPO ou responsável pela proteção de dados? (LGPD obriga para
    determinados casos.)
12. Há registro de consentimento (quando, como, o que aceitou, versão)?
13. Há política de privacidade versionada e aceitação explícita?
14. Há cookies/rastreadores? Banner de consentimento de cookies?

Se a resposta for desconhecida e afetar schema, segurança ou compliance,
registrar a suposição no PRD e pedir confirmação antes de implementar.

## Invariantes obrigatórias

- **Minimização**: coletar somente o necessário para a finalidade declarada.
- **Finalidade explícita**: cada dado tem propósito documentado no PRD.
- **Consentimento**: registrar quem, quando, qual versão da política
  aceitou, quais finalidades. Imutável; nova versão exige novo aceite.
- **Retenção**: cada dado tem TTL definido. Após, anonimizar ou excluir.
  Nunca manter "por segurança" sem base legal.
- **Anonimização**: ao anonimizar, o dado não pode ser reidentificado por
  combinação com outros campos. Documentar técnica.
- **Pseudonimização**: se usar, registrar chave de reidentificação
  separada do dado, com controle de acesso distinto.
- **Direitos do titular**: API/UI para acesso, correção, exclusão,
  portabilidade, revogação de consentimento. Não pode ser "manual only".
- **Logs de acesso**: quem acessou qual dado pessoal, quando, por qual
  finalidade. Log imutável.
- **Não expor dados pessoais em logs de aplicação, error messages,
  analytics, query string, URL ou metadados de evento.**
- **Não usar dado pessoal como ID de chave primária** (CPF como PK, por
  exemplo). Usar ID interno opaco; CPF é somente campo indexado.
- **RRS**: toda tabela com dado pessoal tem RLS filtrando por `user_id`
  ou `organization_id`. Nunca `USING (true)`.
- **Mascaramento**: exibir parcialmente em listagens (ex.: `***.123.456-**`).
- **Backup**: dado pessoal em backup também sujeito a retenção e exclusão.

## Segurança

- Criptografia em trânsito (TLS 1.2+ obrigatório, HSTS recomendado).
- Criptografia em repouso para dados sensíveis (Supabase at-rest default).
- Hash de senhas com bcrypt/argon2, nunca MD5/SHA1.
- Tokens de acesso com expiração curta; refresh com rotação.
- service_role nunca no client.
- MFA para contas com acesso a dados pessoais em massa.
- Não commitar dados pessoais reais em fixtures, exemplos, documentação.
  Usar dados sintéticos.

## Cookies e rastreadores

- Banner de consentimento de cookies antes de carregar scripts de
  tracking (Analytics, Meta Pixel, etc.).
- Cookies essenciais (sessão, CSRF) não exigem consentimento.
- Cookies de marketing exigem opt-in explícito, não pré-assinalado.
- Persistir preferência de cookies; honrar "Do Not Track" quando aplicável.

## Transferência internacional

- Se usar provedor fora do Brasil (Vercel, Supabase, OpenAI, etc.),
  registrar o destino, a base legal para transferência e garantias
  aplicáveis (cláusulas contratuais, certificação, etc.).
- ANPD pode exigir relatório de transferência internacional.

## URLs e exposição

- Nunca usar `?cpf=`, `?email=`, `?phone=` em query string.
- Não refletir dado pessoal em URL amigável (`/usuarios/joao-silva` →
  `/usuarios/abc123xyz`).
- Não incluir dado pessoal em metadados de Open Graph, sitemap, robots.

## Critérios de aceite

Uma feature com dado pessoal só está pronta quando:

1. Lista de dados pessoais coletados está no PRD com finalidade e base legal.
2. Consentimento registrado (quando aplicável) com versão da política.
3. RLS aplicada e testada com usuário de menor privilégio.
4. Retenção documentada e implementada (TTL ou job de expurgo).
5. Direitos do titular disponíveis: acesso, correção, exclusão, portabilidade.
6. Logs de acesso imutáveis registram quem acessou qual dado.
7. Nenhum dado pessoal em logs de app, query string, analytics.
8. Mascaramento em listagens de PII sensível.
9. Banner de cookies implementado se houver tracking.
10. Anonimização ou exclusão real (não soft-delete mascarado) após retenção.