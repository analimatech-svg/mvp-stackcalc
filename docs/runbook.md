# Runbook de Deploy e Operação — StackCalc MVP

**Versão**: 0.1
**Data**: 2026-03-30
**Público**: desenvolvedor ou operador que fará o deploy ou rotação de chaves

---

## 1. Visão geral da stack

| Camada | Tecnologia | Provedor recomendado |
|--------|-----------|---------------------|
| Front estático | HTML / CSS / JS vanilla | Cloudflare Pages |
| Proxy serverless | Cloudflare Worker | Cloudflare |
| LLM | Anthropic Claude API | Anthropic |
| Rate limit counter | Cloudflare KV | Cloudflare (incluído) |
| Domínio | DNS | Gerenciado na hospedagem atual da Mentoratech |

> **Alternativas**: Vercel (Front: Static Export + Functions) ou Netlify (Static + Functions). A escolha definitiva está pendente — registrar em ADR-002 quando decidir.

---

## 2. Variáveis de ambiente

### 2.1 Proxy (Worker / Function)

| Variável | Obrigatória | Descrição | Exemplo |
|----------|------------|-----------|---------|
| `LLM_API_KEY` | Sim | Chave de API do provedor LLM | `sk-ant-api03-...` |
| `LLM_MODEL` | Sim | ID do modelo a usar | `claude-haiku-4-5-20251001` |
| `TOKEN_SECRET` | Sim | Segredo para assinar/validar JWTs (≥ 32 chars aleatórios) | `abc123...` (gerar com `openssl rand -hex 32`) |
| `RATE_LIMIT_RPM` | Sim | Máximo de requisições ao Agente por usuário por mês | `20` |
| `ALLOWED_ORIGIN` | Sim | Domínio do front para CORS | `https://app.stackcalc.com.br` |
| `KV_NAMESPACE` | Cloudflare | ID do namespace KV para rate limit | (gerado pelo Cloudflare) |

**NUNCA** colocar esses valores em:
- Código-fonte versionado (`.js`, `.env` commitado)
- Logs de CI/CD
- Comentários ou issues do repositório

### 2.2 Front (SPA)

O front **não deve ter variáveis secretas**. Variáveis de configuração públicas aceitáveis:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `PROXY_URL` | URL do endpoint do proxy | `https://agent.stackcalc.com.br/agent` |
| `APP_VERSION` | Versão da planilha de referência | `v2.0` |

---

## 3. Deploy do front estático

### Opção A — Cloudflare Pages (recomendado)

```bash
# 1. Conectar repositório no painel Cloudflare Pages
#    Repository: analimatech-svg/mvp-stackcalc
#    Branch de produção: main
#    Build command: (nenhum — arquivos estáticos)
#    Build output: / (raiz)

# 2. Configurar domínio personalizado no painel:
#    app.stackcalc.com.br → CNAME para pages.dev

# 3. Deploy automático a cada push na branch main
```

### Opção B — Deploy manual via Wrangler CLI

```bash
# Instalar Wrangler
npm install -g wrangler

# Autenticar
wrangler login

# Deploy do front
wrangler pages deploy . --project-name=stackcalc-app
```

### Opção C — GitHub Pages (mais simples, sem proxy integrado)

```bash
# Habilitar GitHub Pages no repositório:
#   Settings → Pages → Source: Deploy from branch → main / root

# Domínio: configurar CNAME no DNS apontando para <org>.github.io
```

---

## 4. Deploy do proxy (Cloudflare Worker)

```bash
# 1. Criar arquivo wrangler.toml na raiz do Worker:
cat > worker/wrangler.toml << 'EOF'
name = "stackcalc-agent"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "KV"
id = "<KV_NAMESPACE_ID>"
EOF

# 2. Definir secrets (NÃO usar variáveis de ambiente de texto plano para secrets)
wrangler secret put LLM_API_KEY
# → digitar a chave quando solicitado (não aparece no terminal)

wrangler secret put TOKEN_SECRET
wrangler secret put LLM_MODEL

# 3. Definir variáveis não-secretas em wrangler.toml [vars]
# RATE_LIMIT_RPM = "20"
# ALLOWED_ORIGIN = "https://app.stackcalc.com.br"

# 4. Deploy
wrangler deploy

# 5. Verificar
curl -X POST https://stackcalc-agent.<seu-subdominio>.workers.dev/agent \
  -H "Authorization: Bearer <token-de-teste>" \
  -H "Content-Type: application/json" \
  -d '{"tipoAnalise":"defesa_tecnica","classificacao":"Médio","scoreEscopo":72,"horasTotal":320,"riscosChecados":[]}'
```

---

## 5. Girar chaves (rotação de secrets)

### Girar LLM_API_KEY

```bash
# 1. Gerar nova chave no painel do provedor LLM
# 2. Atualizar no Worker:
wrangler secret put LLM_API_KEY
# → colar nova chave

# 3. Revogar chave antiga no painel do provedor
# 4. Verificar que o proxy continua respondendo
curl -X POST https://... -H "Authorization: Bearer <token>" ...
```

### Girar TOKEN_SECRET

> **Atenção**: girar TOKEN_SECRET invalida todos os tokens ativos. Todos os usuários precisarão fazer login novamente.

```bash
# 1. Gerar novo segredo
openssl rand -hex 32

# 2. Atualizar no Worker:
wrangler secret put TOKEN_SECRET
# → colar novo segredo

# 3. Comunicar manutenção aos usuários ativos antes de girar em produção
```

---

## 6. Configurar usuários autorizados (MVP)

No MVP, o acesso ao Agente é liberado por lista de e-mails autorizados (sem webhook Hotmart ainda).

```bash
# Arquivo: worker/src/authorized-users.js
# (NÃO commitar e-mails reais — usar variável de ambiente ou KV)

# Opção recomendada: armazenar lista no Cloudflare KV
wrangler kv:key put --namespace-id=<KV_ID> "authorized:<email@example.com>" '{"tier":"full","quotaMensal":20}'

# Ou via painel: Workers & Pages → KV → namespace → Add entry
```

---

## 7. Monitoramento

### Verificar quota de um usuário

```bash
wrangler kv:key get --namespace-id=<KV_ID> "ratelimit:<userId>:<YYYY-MM>"
# Retorna: {"count": 5, "resetAt": "2026-04-01T00:00:00Z"}
```

### Ver logs do Worker em tempo real

```bash
wrangler tail stackcalc-agent
# Filtra logs sem PII — confirmar antes de usar em produção
```

### Métricas de custo (LLM)

- Acessar painel do provedor LLM (ex.: console.anthropic.com).
- Verificar uso mensal por chave.
- Alertar se custo mensal > R$ 50 (referência: 25 usuários × 20 req × ~R$ 0,10/req com haiku).

---

## 8. Rollback

### Front estático

No Cloudflare Pages:
- Painel → Deployments → selecionar deploy anterior → "Rollback to this deployment"

### Worker

```bash
# Listar versões
wrangler deployments list

# Rollback para versão específica
wrangler rollback <deployment-id>
```

---

## 9. Checklist de primeiro deploy

- [ ] Repositório conectado ao provedor de CI/CD.
- [ ] Secrets criados no provedor (nunca em texto plano no código).
- [ ] CORS configurado para permitir apenas o domínio do front.
- [ ] KV namespace criado e binding configurado.
- [ ] Pelo menos 1 usuário autorizado na lista.
- [ ] Teste manual do happy path (Escopo → Agente) em staging.
- [ ] Teste de TC-AGT-02 (token inválido → 401).
- [ ] Teste de TC-AGT-04 (quota esgotada → 429).
- [ ] Versão da planilha de referência exibida no rodapé do app (`APP_VERSION = v2.0`).

---

## 10. Domínios e DNS

| Domínio | Destino | Tipo |
|---------|---------|------|
| `www.stackcalc.com.br` | Site do framework (público) | CNAME → Cloudflare Pages |
| `app.stackcalc.com.br` | App completo (área logada) | CNAME → Cloudflare Pages |
| `agent.stackcalc.com.br` | Proxy serverless | Cloudflare Worker Route |
| `mentoratech.com.br/stackcalc` | Página de vendas (já existente) | Gerenciado pela Mentoratech |

> DNS deve ser configurado no painel da hospedagem atual da Mentoratech. Verificar TTL antes de apontar para nova origem.
