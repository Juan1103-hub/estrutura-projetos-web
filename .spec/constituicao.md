# Constituição — v1.0.0 (preset: Saúde / Clínico)

<!--
  Princípios para produtos de saúde/clínica que guardam dados pessoais e
  dados sensíveis de pacientes (LGPD art. 5º, II + art. 11 — dados de saúde;
  CF art. 196 — saúde como direito de todos; ANPD orientações sobre dados
  sensíveis).

  Níveis: [DEVE] obrigatório · [RECOMENDADO] forte · [PODE] permitido/explícito.
  Todo [DEVE] precisa de verificação executável. Formatos aceitos:
    - verificação(teste): @principle:P-xxx
    - verificação(proibido): `regex` em `glob`
    - verificação(obrigatório): `regex` em `glob`

  Ajuste os globs/regex à sua stack — estes são pontos de partida REAIS,
  não decoração: o audit roda cada um deles.
-->

## P-001 [DEVE] Dados de um paciente nunca são expostos a outro paciente

Todo endpoint/consulta que retorna prontuário, resultado, diagnóstico ou
qualquer dado de saúde filtra pelo paciente autenticado (ou pelo profissional
com vínculo comprovado). Listagens agregadas (estatísticas de demanda, por
exemplo) não identificam indivíduos.

- verificação(teste): @principle:P-001

## P-002 [DEVE] Acesso a dados sensíveis de saúde é registrado (trilha de auditoria)

Toda leitura/escrita de dado de saúde registra quem acessou, o quê, quando
e por qual finalidade. LGPD art. 37 + art. 11, §1º: registro das
operações de tratamento de dados sensíveis.

- verificação(teste): @principle:P-002

## P-003 [DEVE] Dados de saúde exigem base legal específica

Tratamento de dados de saúde exige consentimento específico e destacado
(LGPD art. 11, I) ou uma das hipóteses do art. 11, II (tutela da saúde,
procedimento realizado por profissional de saúde, etc.). Nunca usar
legítimo interesse para dados sensíveis de saúde.

- verificação(teste): @principle:P-003

## P-004 [DEVE] Dados pessoais e de saúde nunca aparecem em logs

CPF, e-mail, telefone, nome de paciente, CID, código de procedimento,
resultado de exame e afins nunca vão para console/log em texto puro.

- verificação(proibido): `console\.(log|error|warn)\(.*(cpf|nome|email|telefone|cid|resultado|diagnostico|prontuario)` em `**/*.{ts,tsx,js,jsx}`

## P-005 [DEVE] RLS em toda tabela com dados de paciente

Toda tabela que armazena dados de saúde ou dados pessoais de paciente tem
RLS habilitado com policy filtrando por `user_id`, `organization_id` ou
`professional_id` conforme o contexto de acesso. Nunca `USING (true)`.

- verificação(teste): @principle:P-005

## P-006 [DEVE] service_role nunca no client

A chave `service_role` do Supabase nunca aparece em código client-side,
variáveis `NEXT_PUBLIC_*`, bundle do frontend ou commit.

- verificação(proibido): `service_role` em `**/*.{ts,tsx,js,jsx}`
- verificação(proibido): `NEXT_PUBLIC_.*SUPABASE.*SERVICE` em `**/*.{ts,tsx,js,jsx}`

## P-007 [RECOMENDADO] Minimização: só coletar dados que o cuidado clínico exige

Cada campo pessoal/sensível coletado tem justificativa clínica documentada
na spec da feature que o coleta (LGPD art. 6º, III — necessidade).
Não coletar "porque pode ser útil no futuro".

## P-008 [RECOMENDADO] Anonimização em ambientes não-produção

Dados de teste e demonstração em dev/staging devem ser sintéticos ou
anonimizados. Nenhum dado real de paciente em ambiente não-produção.

- verificação(proibido): `cpf|(\d{3}\.\d{3}\.\d{3}-\d{2})` em `**/seed*.sql`
- verificação(proibido): `@\w+\.\w+\.\w+` em `**/*.{ts,tsx,js,jsx}`

## P-009 [PODE] Portabilidade dos dados do paciente

O paciente PODE exportar seus dados em formato legível por máquina
(LGPD art. 18, V — portabilidade).

## P-010 [PODE] Exclusão a pedido do titular

O titular pode solicitar exclusão dos dados; o sistema PODE manter o mínimo
legal (registros de auditoria, dados com prazo legal de retenção) com
justificativa documentada.

---

## P-011 [DEVE] Autenticação JWT obrigatória em todo endpoint privado

Toda rota que acessa dados de paciente ou dados sensíveis exige token JWT
válido. O middleware `get_current_user` extrai, valida e busca o usuário
no banco. Tokens expiram em no máximo 1 hora. Regra completa:
`rules/auth-security.md` → Autenticação JWT.

- verificação(proibido): `app\.(get|post|put|delete|patch)\(` em `projects/*/src/**/*.{ts,tsx,js,jsx}`

## P-012 [DEVE] Supabase usado APENAS como PostgreSQL gerenciado

O frontend NUNCA se comunica diretamente com o Supabase. Nenhum SDK,
anon key ou supabase_url no client-side. Toda comunicação com o banco
passa pelo backend via `DATABASE_URL` + asyncpg. Regra completa:
`rules/auth-security.md` → Supabase como PostgreSQL.

- verificação(proibido): `createClient|createBrowserClient|supabaseUrl|NEXT_PUBLIC_.*SUPABASE(?!_URL)` em `projects/*/src/**/*.{ts,tsx,js,jsx}`
- verificação(proibido): `@supabase/` em `projects/*/src/**/*.{ts,tsx,js,jsx}`

## P-013 [DEVE] Nenhum segredo no frontend

JWT_SECRET, DATABASE_URL, service_role e credenciais ficam APENAS no
backend. O frontend recebe apenas variáveis `NEXT_PUBLIC_*` para
configuração pública (URL da API, etc.). Regra completa:
`rules/auth-security.md` → Segredos e Variáveis.

- verificação(proibido): `JWT_SECRET|DATABASE_URL|SERVICE_ROLE|API_KEY` em `projects/*/src/**/*.{ts,tsx,js,jsx}`
- verificação(proibido): `NEXT_PUBLIC_.*SECRET|NEXT_PUBLIC_.*KEY|NEXT_PUBLIC_.*PASSWORD` em `projects/*/src/**/*.{ts,tsx,js,jsx}`

## P-014 [DEVE] Checklist de produção antes de cada deploy

Antes de subir para produção, o sistema deve passar por checklist
obrigatório: backend compila, frontend compila, migrações rodam,
nenhum segredo no bundle, rotas privadas exigem token, frontend não
acessa Supabase diretamente, CORS configurado, rate limit ativo.
Reg completa: `rules/auth-security.md` → Checklist de Produção.

- verificação(obrigatório): `[Cc]hecklist` em `DEPLOY.md`

## P-015 [DEVE] CORS e Rate Limit em produção

CORS restringe domínio real do frontend. Rotas sensíveis (login,
cadastro, reset de senha) têm rate limit. Backend retorna 429
quando limite excedido. Regra completa:
`rules/auth-security.md` → CORS e Rate Limit.

- verificação(obrigatório): `cors|rate.limit|429` em `projects/*/src/**/*.{ts,tsx,js,jsx}`
