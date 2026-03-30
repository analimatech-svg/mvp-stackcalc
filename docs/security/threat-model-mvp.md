# Modelo de Ameaças — StackCalc MVP

**Versão**: 0.1
**Data**: 2026-03-30
**Metodologia**: STRIDE simplificado
**Escopo**: MVP com front estático + proxy serverless + API LLM

---

## 1. Ativos a proteger

| Ativo | Sensibilidade | Impacto se comprometido |
|-------|--------------|------------------------|
| Chave de API do LLM (`LLM_API_KEY`) | Alto | Abuso de quota; custo financeiro; bloqueio do serviço |
| Segredo de token (`TOKEN_SECRET`) | Alto | Forjamento de tokens; acesso não autorizado ao Agente |
| Dados de estimativa do usuário | Médio | Dados de negócio do cliente podem ser confidenciais |
| Quota do usuário (rate limit) | Médio | Abuso → custo alto; degradação para outros usuários |
| Código do front (JS) | Baixo | Lógica de negócio exposta; não contém secrets |

---

## 2. Superfície de ataque

```
[ Browser ] ──HTTPS──> [ CDN / Bucket estático ]   (arquivos públicos)
[ Browser ] ──HTTPS──> [ Proxy Function ]           (endpoint /agent)
[ Proxy ]   ──HTTPS──> [ API LLM ]                 (comunicação interna)
```

### Endpoints expostos

| Endpoint | Tipo | Autenticação |
|----------|------|-------------|
| `GET /*` (arquivos estáticos) | Público | Nenhuma |
| `POST /agent` | Privado | JWT via `Authorization: Bearer` |

---

## 3. Ameaças por categoria (STRIDE)

### 3.1 Spoofing (falsificação de identidade)

| ID | Ameaça | Mitigação |
|----|--------|-----------|
| S1 | Atacante forja token JWT para acessar o Agente sem pagar | Assinar JWT com `TOKEN_SECRET` seguro (HS256 / RS256); validar no proxy a cada requisição |
| S2 | Atacante usa token de outro usuário | Incluir `userId` no payload do JWT; validar no proxy |

### 3.2 Tampering (adulteração)

| ID | Ameaça | Mitigação |
|----|--------|-----------|
| T1 | Usuário adultera payload da requisição para injetar prompt malicioso | Proxy constrói o prompt no servidor com template fixo; dados do usuário são inseridos como variáveis, não como instrução |
| T2 | Atacante intercepta resposta do LLM para modificar análise | HTTPS em todas as comunicações; verificar integridade se necessário |

### 3.3 Repudiation (repúdio)

| ID | Ameaça | Mitigação |
|----|--------|-----------|
| R1 | Usuário nega ter gerado requisições abusivas | Log imutável no proxy: `userId`, timestamp, `tipoAnalise`, tokens usados (sem payload completo para privacidade) |

### 3.4 Information Disclosure (vazamento de informação)

| ID | Ameaça | Mitigação |
|----|--------|-----------|
| I1 | `LLM_API_KEY` exposta no JS do front | **Nunca** colocar a chave no front; somente no proxy (ADR-001) |
| I2 | `TOKEN_SECRET` hardcoded no código | Somente em variáveis de ambiente do provedor; nunca em código versionado |
| I3 | Dados de estimativa do usuário enviados ao LLM incluem PII | Proxy sanitiza payload antes de enviar: sem nome, e-mail, dados de pagamento |
| I4 | Resposta do LLM contém dados de outro usuário (vazamento de contexto) | Não manter histórico de conversa entre sessões distintas; cada req é independente |
| I5 | Logs do proxy expõem dados sensíveis | Logar apenas metadados (userId, tokens usados, tipo de análise, status); nunca o texto da análise ou dados do projeto |

### 3.5 Denial of Service (negação de serviço)

| ID | Ameaça | Mitigação |
|----|--------|-----------|
| D1 | Usuário faz loop de requisições ao Agente esgotando quota | Rate limit por usuário/mês no proxy (`RATE_LIMIT_RPM`) |
| D2 | Atacante descobre endpoint do proxy e faz scraping | Rate limit por IP + validação de token; considerar CORS restrito ao domínio da SPA |
| D3 | Prompt injection explode tamanho do contexto | Truncar `contextoAdicional` no proxy (ex.: máx. 500 chars); limite de tokens na chamada LLM |

### 3.6 Elevation of Privilege (escalada de privilégio)

| ID | Ameaça | Mitigação |
|----|--------|-----------|
| E1 | Usuário free tenta acessar Agente (feature gated) | Proxy verifica claim de tier no JWT; sem tier válido → 403 |
| E2 | Usuário com quota esgotada tenta burlar counter | Counter armazenado no servidor (KV do proxy), não no browser |

---

## 4. Dados enviados ao LLM — inventário

O proxy envia ao LLM **somente** os seguintes dados (estruturados, sem PII):

```
- tipoAnalise: string enum
- classificacao: string enum
- scoreEscopo: number (0–100)
- horasTotal: number
- riscosChecados: string[] (rótulos do checklist)
- contextoAdicional: string (máx. 500 chars, inserido pelo usuário)
```

**Nunca enviado ao LLM:**
- Nome ou e-mail do usuário
- ID de transação Hotmart
- Dados de pagamento
- Código-fonte do projeto do cliente
- Token JWT ou qualquer credencial

---

## 5. Política de retenção de dados

| Dado | Onde armazenado | Retenção |
|------|----------------|----------|
| Estado da calculadora | `sessionStorage` do browser | Apagado ao fechar aba |
| Logs do proxy | Provedor de log (ex.: Cloudflare Logs) | 30 dias (ajustável) |
| Contagem de rate limit | KV do provedor | 31 dias (janela mensal) |
| Histórico de análise do Agente | `localStorage` do browser (MVP) | Até o usuário limpar ou P1 de histórico na nuvem |

---

## 6. Controles de segurança do MVP

| Controle | Status | Prioridade |
|---------|--------|-----------|
| HTTPS em todos os endpoints | Obrigatório — CDN e proxy já fornecem | P0 |
| JWT assinado para acesso ao proxy | A implementar | P0 |
| Rate limit por usuário/mês | A implementar | P0 |
| Secrets somente em variáveis de ambiente | Obrigatório desde o início | P0 |
| CORS restrito ao domínio da SPA | A configurar no proxy | P0 |
| Sanitização de payload antes do LLM | A implementar no proxy | P0 |
| Truncar contextoAdicional no proxy | A implementar | P0 |
| Logs sem PII | A implementar | P0 |
| Revisão de dependências (supply chain) | Dependências mínimas no MVP | P1 |
| Auditoria OWASP Top 10 | Pós-MVP | P1 |

---

## 7. O que está fora do escopo de segurança do MVP

- Autenticação multifator (MFA)
- Criptografia de dados em repouso (sem banco de dados no MVP)
- Pen test externo
- Varredura de vulnerabilidades automatizada (CI)
- Conformidade LGPD formal (considerar pós-MVP ao coletar dados pessoais)
