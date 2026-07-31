# Autenticação, Segurança e Banco de Dados

> Consolida: LoginConfig + SecurityChecklist + SupabaseConfig + security-secrets

---

## Autenticação JWT

### Modelo User

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Identificador único |
| email | String (unique) | Email do usuário |
| password_hash | String | Hash bcrypt da senha |
| nome | String | Nome do usuário |
| ativo | Boolean | Se o usuário está ativo |
| created_at | DateTime | Data de criação |
| updated_at | DateTime | Data de atualização |

### Rotas

- **POST /auth/register** — Recebe nome, email, password. Valida duplicidade (409). Gera hash bcrypt. Retorna `{ id, nome, email }` (201).
- **POST /auth/token** — Recebe email, password. Valida credenciais com bcrypt. Retorna `{ access_token, token_type: "bearer" }`. Token contém `sub`, `email`, `exp`, `iat`.
- **PUT /auth/password** (autenticada) — Requer `Authorization: Bearer <token>`. Recebe nova_senha + confirmar_senha. Valida igualdade (400). Atualiza hash. Não exige senha atual.

### Middleware

- Decorator/injeção `get_current_user`: extrai token → decodifica JWT → busca usuário no banco → retorna User ou 401.
- Todas as rotas CRUD devem usar este middleware.

### Variáveis de Ambiente (Backend)

| Variável | Descrição | Padrão |
|---|---|---|
| JWT_SECRET | Chave secreta para assinar tokens | (obrigatório) |
| JWT_ALGORITHM | Algoritmo de assinatura | HS256 |
| JWT_EXPIRY | Tempo de expiração do token | 3600 (1 hora) |

### Dependências (Python)

- `pyjwt`, `bcrypt`

### Frontend

- **AuthContext**: Provider React com `login()`, `logout()`, `updatePassword()`, `user`, `isAuthenticated`. Token em `localStorage`.
- **PrivateRoute**: Wrapper que verifica `isAuthenticated`. Redireciona para `/login` se não autenticado.
- **Requisições**: Header `Authorization: Bearer <token>` em todas as chamadas. Tratar 401 com logout automático.
- **Modal Alterar Senha**: Campos nova senha + confirmar. Não solicita senha atual.

### Variável de Ambiente (Frontend)

| Variável | Descrição |
|---|---|
| VITE_API_AUTH_URL | URL base da API para auth |

---

## Supabase como PostgreSQL

### ⚠️ REGRA DE ARQUITETURA — NÃO VIOLAR

**O Supabase é usado APENAS como banco de dados PostgreSQL gerenciado.**

- O frontend NUNCA se comunica diretamente com o Supabase
- O frontend NUNCA usa SDK do Supabase, anon key, ou supabase_url
- Toda comunicação com o banco passa exclusivamente pelo backend
- A conexão é via `postgresql+asyncpg://<user>:<password>@<host>:<port>/<db>`
- SQLAlchemy se conecta como faria com qualquer PostgreSQL

### Configuração

```env
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:<port>/<database>?pgbouncer=true
```

### Engine Assíncrona

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
engine = create_async_engine(DATABASE_URL, pool_size=5, max_overflow=10)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
```

### Dependências

- Adicionar: `asyncpg`, `greenlet`
- Remover: `aiosqlite`

### Migrações Alembic

Configurar `alembic.ini/env.py` com `create_async_engine`. Executar `alembic upgrade head`.

---

## Segredos e Variáveis

- Nenhum segredo hardcoded no código
- Nenhum segredo em variáveis `VITE_*` do frontend
- `JWT_SECRET` apenas no backend
- `DATABASE_URL`, chaves de integração, credenciais apenas no backend
- README lista variáveis obrigatórias sem revelar valores

---

## Checklist de Produção

### Validação final obrigatória

- [ ] Backend inicia sem erros
- [ ] Frontend compila sem erros
- [ ] Migrações Alembic executam com sucesso
- [ ] Docker compose sobe o ambiente
- [ ] Não há segredo no bundle frontend
- [ ] Rotas privadas exigem bearer token
- [ ] Frontend não acessa Supabase diretamente
- [ ] CORS de produção está configurável
- [ ] Rate limit existe para rotas sensíveis
- [ ] README documenta variáveis sem expor segredos

### CORS e Rate Limit

- CORS em produção restringe domínio real do frontend
- Login, cadastro, reset de senha têm rate limit
- Ações públicas sensíveis consideram CAPTCHA/Turnstile
- Backend retorna 429 quando limite excedido

### Logs e Observabilidade

- Logs não devem conter senhas, tokens, connection strings
- Falhas de auth e rate limit registradas para auditoria
- Erros de produção tratados sem expor detalhes internos
