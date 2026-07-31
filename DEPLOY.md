# DEPLOY.md — Go-Live (Supabase + Vercel)

> Ordem: 1) Supabase (banco+segurança) → 2) Vercel (deploy) → 3) Domínio → 4) Verificação final
>
> **Checklist de produção obrigatório** — todos os itens devem ser validados antes de cada deploy.

## FASE 1 — Supabase: banco de dados
1. Criar projeto (região próxima aos usuários).
2. Rodar migrations via CLI (`supabase db push`), nunca alterar schema manualmente em produção.
3. Conectar repositório Git no Supabase (Integrations) para deploy automático de migrations.
4. Plano Pro: habilitar Branching para testar migrations em preview.

## FASE 2 — Supabase: segurança (bloqueia go-live)
- [ ] RLS em **todas** as tabelas com dados de negócio
- [ ] Policies SELECT usam `auth.uid()`; nunca `USING (true)` em tabela não-pública
- [ ] UPDATE/INSERT têm `USING` **e** `WITH CHECK`
- [ ] Nenhuma policy usa `user_metadata` (editável pelo usuário) — usar `app_metadata`
- [ ] `service_role` key só em variáveis server-side; buscar por `NEXT_PUBLIC_` + `SERVICE_ROLE` (zero)
- [ ] Storage buckets: privados por padrão, signed URLs (~15min) para arquivos privados
- [ ] RPC com `SECURITY DEFINER` validam `auth.uid()`; `GRANT EXECUTE` restrito a `authenticated`
- [ ] Realtime: RLS nas tabelas expostas; subscriptions autenticadas
- [ ] SSL Enforcement ativado; Network Restrictions se aplicável
- [ ] MFA na conta Supabase; confirmação de e-mail ativada; SMTP customizado
- [ ] Senha mínima 8+; "Leaked password protection" ativado
- [ ] Rodar Security Advisor do Supabase e resolver críticos
- [ ] Teste negativo: consultar tabela com JWT de outro usuário → zero linhas

## FASE 3 — Vercel: deploy
1. Conectar repositório Git ao Vercel (deploy automático por branch).
2. Configurar `vercel.json` (versionado, sem segredos) ou usar dashboard.
3. Variáveis de ambiente no dashboard do Vercel (Project Settings > Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (públicas)
   - `SUPABASE_SERVICE_ROLE_KEY` (sensível, só server-side)
   - Marcar sensíveis como "Secret"
4. Adicionar headers de segurança em `vercel.json` ou `next.config.js`:
   ```json
   { "headers": [{ "source": "/(.*)", "headers": [
     { "key": "X-Frame-Options", "value": "DENY" },
     { "key": "X-Content-Type-Options", "value": "nosniff" },
     { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
   ]}]}
   ```
5. Rodar primeiro deploy e validar preview.

## FASE 4 — Vercel: domínio próprio
1. Dashboard > Project > Settings > Domains > Add.
2. Digitar domínio e seguir instruções do Vercel DNS.
3. No provedor DNS (Registro.br, GoDaddy, etc.):
   - Domínio raiz: registro A apontando para IP da Vercel, ou usar Vercel DNS (nameservers)
   - Subdomínio (`www`, `app`): CNAME para `cname.vercel-dns.com`
4. Vercel emite SSL automaticamente. Aguardar propagação (até 48h).

## FASE 5 — Verificação final
- [ ] Testar endpoint público sem auth com anon key → vazio, não os dados
- [ ] Testar storage privado sem signed URL → 403
- [ ] Confirmar bundle não contém `service_role` key (`grep -r "eyJ" .next/`)
- [ ] Confirmar HTTPS ativo e certificado válido
- [ ] Confirmar variáveis de ambiente de produção na Vercel
- [ ] Rodar Security Advisor do Supabase novamente pós-deploy
