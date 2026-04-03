# Plano de Implementação — StackCalc MVP

**Versão**: 0.1
**Data**: 2026-04-03
**Meta**: MVP validável com pilotos em ~5 semanas a partir do início

---

## Premissas

- 1 desenvolvedor principal em tempo parcial (~3–4 h/dia útil).
- Planilha `StackCalc_v2_0.xlsx` disponível para upload no repositório.
- Provedor serverless escolhido: **Cloudflare** (Workers + Pages + KV) — ver [ADR-001](../adr/ADR-001-proxy-llm.md).
- Conta Anthropic com acesso à API ativa.
- Acesso ao DNS da Mentoratech para configurar subdomínios.

> Se alguma premissa mudar, revisar estimativas das fases afetadas.

---

## Visão geral do cronograma

```
Semana 1   Semana 2   Semana 3   Semana 4   Semana 5+
────────── ────────── ────────── ────────── ──────────
[Fase 0]
Setup &
Infra

           [Fase 1]
           Paridade
           Calculadora

                      [Fase 2]
                      Proxy &
                      Agente

                                 [Fase 3]
                                 Auth &
                                 UX/UI

                                            [Fase 4]
                                            QA &
                                            Piloto
```

---

## Fase 0 — Setup e Infraestrutura

**Duração**: 3–4 dias úteis
**Bloqueia**: tudo

### Tarefas

| # | Tarefa | Entregável | Prioridade |
|---|--------|-----------|-----------|
| 0.1 | Criar conta Cloudflare e projeto Pages | Projeto `stackcalc-app` no Cloudflare | P0 |
| 0.2 | Criar namespace KV no Cloudflare | KV ID anotado no runbook | P0 |
| 0.3 | Configurar DNS: `app.stackcalc.com.br` → Cloudflare Pages | CNAME ativo | P0 |
| 0.4 | Configurar DNS: `agent.stackcalc.com.br` → Worker route | Route ativa | P0 |
| 0.5 | Carregar `StackCalc_v2_0.xlsx` em `references/` no repositório | Arquivo versionado | P0 |
| 0.6 | Criar secrets no Cloudflare: `LLM_API_KEY`, `TOKEN_SECRET`, `LLM_MODEL` | Secrets criados (nunca em código) | P0 |
| 0.7 | Deploy inicial do front estático (só HTML/CSS/JS existente) em Cloudflare Pages | URL pública funcionando | P0 |
| 0.8 | Registrar decisão de provedor em `docs/adr/ADR-002-hospedagem.md` | ADR-002 commitada | P1 |

### Critério de conclusão da Fase 0

- [ ] `https://app.stackcalc.com.br` carrega o front atual sem erros.
- [ ] Secrets configurados no painel Cloudflare (nenhum em código).
- [ ] Planilha no repositório em `references/StackCalc_v2_0.xlsx`.

---

## Fase 1 — Paridade da Calculadora

**Duração**: 5–6 dias úteis
**Depende de**: Fase 0 (planilha no repositório)
**Bloqueia**: QA final, Piloto

### Contexto

O arquivo `stackcalc.js` já existe na SPA. O objetivo é **auditar e corrigir** as fórmulas para garantir que os totais batem com a planilha (desvio ≤ 5%).

### Tarefas

| # | Tarefa | Entregável | Prioridade |
|---|--------|-----------|-----------|
| 1.1 | Extrair valores "ouro" de `StackCalc_v2_0.xlsx` para cada nível de complexidade | Tabela preenchida em `docs/qa/test-plan.md` § 2.2 | P0 |
| 1.2 | Extrair texto exato do tier Vermelho do Escopo | Campo preenchido em `test-plan.md` § 3.1 | P0 |
| 1.3 | Auditar fórmulas de `stackcalc.js`: Horas Dev, Doc, Gestão+Conting., Total | Lista de divergências | P0 |
| 1.4 | Corrigir divergências identificadas em `stackcalc.js` | Código corrigido + commit | P0 |
| 1.5 | Criar testes automatizados para TC-PAR-01 a TC-PAR-04 em `tests/calc.test.js` | Testes passando (Vitest ou Jest) | P0 |
| 1.6 | Criar testes para TC-LIM-01 a TC-LIM-04 (limites e invariantes) | Testes passando | P0 |
| 1.7 | Criar testes para TC-ESC-01 a TC-ESC-03 (score de prontidão) | Testes passando | P0 |
| 1.8 | Adicionar versão de referência no rodapé do app (`StackCalc v2.0`) | Visível na UI | P0 |
| 1.9 | Configurar `package.json` mínimo com script `test` | `npm test` funciona sem build step complexo | P1 |

### Estrutura de testes sugerida

```
tests/
├── calc.test.js        # Paridade e limites da calculadora (TC-PAR-*, TC-LIM-*)
├── escopo.test.js      # Score de prontidão (TC-ESC-*)
└── validador.test.js   # Checklist de riscos (TC-VAL-*)
```

### Critério de conclusão da Fase 1

- [ ] Todos os casos TC-PAR-01 a TC-PAR-04 passando com desvio ≤ 5%.
- [ ] Todos os casos TC-LIM-01 a TC-LIM-04 passando.
- [ ] Todos os casos TC-ESC-01 a TC-ESC-03 passando.
- [ ] Versão de referência visível no rodapé do app.

---

## Fase 2 — Proxy Serverless e Agente

**Duração**: 5–6 dias úteis
**Depende de**: Fase 0 (secrets configurados)
**Pode rodar em paralelo com**: Fase 1 (são independentes)

### Contexto

Implementar o Cloudflare Worker que serve de proxy seguro entre o front e o LLM. Ver [ADR-001](../adr/ADR-001-proxy-llm.md) e [system-overview.md](../architecture/system-overview.md).

### Tarefas

| # | Tarefa | Entregável | Prioridade |
|---|--------|-----------|-----------|
| 2.1 | Criar estrutura do Worker: `worker/src/index.js`, `worker/wrangler.toml` | Arquivos commitados | P0 |
| 2.2 | Implementar validação de JWT (`TOKEN_SECRET`) | Retorna 401 para token inválido/expirado | P0 |
| 2.3 | Implementar rate limit por usuário/mês no KV (`RATE_LIMIT_RPM`) | Retorna 429 quando excedido | P0 |
| 2.4 | Implementar CORS restrito ao domínio do front (`ALLOWED_ORIGIN`) | Outros origins recebem 403 | P0 |
| 2.5 | Implementar construção do prompt no servidor (não no front) | Função `buildPrompt(body)` | P0 |
| 2.6 | Implementar sanitização do payload (truncar `contextoAdicional` a 500 chars) | Sem PII no payload do LLM | P0 |
| 2.7 | Implementar chamada à API do LLM com `LLM_API_KEY` via `env` | Resposta retornada ao front | P0 |
| 2.8 | Implementar tratamento de erros: timeout (60s), 401 LLM, 429 LLM, resposta vazia | Erros retornam payload estruturado ao front | P0 |
| 2.9 | Integrar o front (`app.js`) com o endpoint do proxy | Botão "Gerar" funciona end-to-end | P0 |
| 2.10 | Implementar estados do Agente na UI: vazio / gerando / pronto / erro | Conforme `docs/ux/ui-spec.md` § 4.5 | P0 |
| 2.11 | Deploy do Worker em staging e teste manual do happy path | Análise gerada sem expor chave | P0 |
| 2.12 | Logar metadados no Worker: `userId`, `tipoAnalise`, `tokensUsados`, `status` | Log sem PII | P1 |

### Script de geração de token (MVP — emissor manual)

Para o MVP, criar um script local que gera tokens para usuários autorizados:

```
scripts/
└── generate-token.js   # node scripts/generate-token.js user@email.com full 20
                        # → imprime JWT para colar no e-mail do piloto
```

### Critério de conclusão da Fase 2

- [ ] TC-AGT-01 (happy path) passando em staging.
- [ ] TC-AGT-02 (sem token → 401) passando.
- [ ] TC-AGT-04 (quota → 429) passando.
- [ ] TC-AGT-07 (sem PII no payload) verificado manualmente.
- [ ] Chave LLM não aparece em DevTools (Network tab).

---

## Fase 3 — Auth, Gate de Acesso e UX/UI

**Duração**: 4–5 dias úteis
**Depende de**: Fase 2 (proxy funcional)

### Tarefas de autenticação

| # | Tarefa | Entregável | Prioridade |
|---|--------|-----------|-----------|
| 3.1 | Definir estrutura do token JWT (claims: `userId`, `email`, `tier`, `exp`) | Documentado em `docs/security/threat-model-mvp.md` | P0 |
| 3.2 | Criar KV com lista de usuários autorizados (e-mails dos pilotos) | KV populado via Wrangler CLI | P0 |
| 3.3 | Implementar tela de entrada de token na SPA (campo de colar token) | UI funcional; token salvo em `sessionStorage` | P0 |
| 3.4 | Implementar verificação de token no front ao carregar app | Sem token → exibe tela de acesso negado | P0 |
| 3.5 | Desabilitar botão "Gerar" do Agente se sem token válido | Agente inativo sem auth | P0 |
| 3.6 | Script `generate-token.js` para emitir tokens dos pilotos | Funcional localmente | P0 |

### Tarefas de UX/UI

| # | Tarefa | Entregável | Prioridade |
|---|--------|-----------|-----------|
| 3.7 | Implementar painel de Resumo Rápido (sempre visível) com 3 métricas | Conforme `ui-spec.md` § 2 | P0 |
| 3.8 | Implementar modal "Comece aqui" (primeira visita, flag em `localStorage`) | Exibido 1x apenas | P0 |
| 3.9 | Revisar contraste dos textos (mínimo 4,5:1 vs fundo) | Nenhuma falha crítica de contraste | P0 |
| 3.10 | Adicionar `aria-live="polite"` no painel de resultado do Agente | Acessibilidade do estado de geração | P0 |
| 3.11 | Garantir `<label>` ou `aria-label` em todos os inputs | Auditoria rápida com DevTools | P0 |
| 3.12 | Implementar botão "Copiar texto" no resultado do Agente | `navigator.clipboard.writeText()` | P1 |
| 3.13 | Exibir mensagem de quota restante do Agente na UI | Dado retornado pelo proxy no header ou body | P1 |

### Critério de conclusão da Fase 3

- [ ] Usuário sem token não consegue chamar o Agente.
- [ ] Usuário com token válido passa pelo fluxo completo (Escopo → Agente).
- [ ] Painel de Resumo Rápido atualiza em tempo real.
- [ ] Modal "Comece aqui" aparece na primeira visita.

---

## Fase 4 — QA, Deploy em Produção e Piloto

**Duração**: 3–4 dias úteis (QA) + contínuo (piloto)
**Depende de**: Fases 1, 2 e 3 completas

### Tarefas de QA

| # | Tarefa | Entregável | Prioridade |
|---|--------|-----------|-----------|
| 4.1 | Executar todos os casos P0 do `test-plan.md` em staging | Tabela de evidências preenchida | P0 |
| 4.2 | Executar TC-AGT-05 (timeout) e TC-AGT-06 (resposta vazia) com mocks | Evidências | P0 |
| 4.3 | Verificar TC-AGT-07 (sem PII) via inspeção de log do Worker | Evidência em screenshot ou log | P0 |
| 4.4 | Teste manual do happy path por 1 usuário interno (não o dev) | Aprovação informal | P0 |
| 4.5 | Corrigir bugs encontrados no QA | Zero bloqueadores P0 abertos | P0 |
| 4.6 | Executar testes automatizados (npm test) e confirmar 100% passing | CI passa | P0 |

### Tarefas de deploy em produção

| # | Tarefa | Entregável | Prioridade |
|---|--------|-----------|-----------|
| 4.7 | Deploy do front em `app.stackcalc.com.br` (produção) | URL pública | P0 |
| 4.8 | Deploy do Worker em `agent.stackcalc.com.br` (produção) | Endpoint funcional | P0 |
| 4.9 | Verificar checklist de primeiro deploy do `runbook.md` | Checklist concluído | P0 |
| 4.10 | Atualizar `CHANGELOG.md` com versão `0.1.0-beta` | Versionamento registrado | P1 |

### Tarefas do piloto

| # | Tarefa | Entregável | Prioridade |
|---|--------|-----------|-----------|
| 4.11 | Gerar tokens para 3–5 pilotos com `scripts/generate-token.js` | Tokens enviados por e-mail | P0 |
| 4.12 | Criar formulário de NPS pós-uso (Google Forms ou Typeform) | Link disponível | P0 |
| 4.13 | Monitorar logs do Worker durante a semana do piloto | Sem erros críticos | P0 |
| 4.14 | Verificar custo de LLM no painel do provedor após 1 semana | Custo dentro do esperado | P0 |
| 4.15 | Coletar NPS e feedback qualitativo dos pilotos | NPS ≥ 7 (meta do PRD) | P0 |
| 4.16 | Registrar aprendizados em `docs/product/pilot-learnings.md` | Documento criado | P1 |

### Critério de "MVP validado"

- [ ] Todos os casos P0 do test-plan passando.
- [ ] Pelo menos 3 pilotos completaram o fluxo completo (Escopo → Agente).
- [ ] NPS médio ≥ 7.
- [ ] Custo de LLM ≤ R$ 2,00/usuário no período do piloto.
- [ ] Zero incidentes de vazamento de chave ou PII.

---

## Cronograma consolidado (calendário de referência)

> Ajustar as datas abaixo conforme o início real do projeto.

| Semana | Datas (ref.) | Fases ativas | Marco |
|--------|-------------|-------------|-------|
| S1 | Semana de início | Fase 0 + início Fase 1 e Fase 2 (paralelo) | Front em produção (sem auth) |
| S2 | S1 + 7 dias | Fase 1 + Fase 2 | Paridade testada; Proxy funcional em staging |
| S3 | S1 + 14 dias | Fase 3 | Auth + UX/UI finalizados |
| S4 | S1 + 21 dias | Fase 4 (QA + deploy) | Deploy produção + convite pilotos |
| S5+ | S1 + 28 dias | Fase 4 (piloto) | NPS coletado; aprendizados registrados |

---

## Dependências entre fases

```
Fase 0 (Setup)
    ├──► Fase 1 (Paridade)  ──────────────────────┐
    │                                              │
    └──► Fase 2 (Proxy)  ──► Fase 3 (Auth/UX) ──► Fase 4 (QA + Piloto)
```

**Fases 1 e 2 podem rodar em paralelo** (são independentes entre si).
**Fase 3** requer Fase 2 concluída.
**Fase 4** requer Fases 1, 2 e 3 concluídas.

---

## Riscos do plano

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Fórmulas da planilha v2.0 mal documentadas → desvio > 5% | Alta | Alto | Priorizar extração dos valores na Fase 1 antes de codar |
| Cloudflare KV com latência em cold start | Baixa | Médio | Pré-aquecer cache ou usar Durable Objects se necessário |
| Conta Anthropic sem acesso a modelos por limite de tier | Média | Alto | Verificar tier antes de iniciar Fase 2; alternativa: OpenAI |
| Pilotos não completam o fluxo (baixo engajamento) | Média | Alto | Agendar onboarding de 30 min com cada piloto |
| Custo de LLM maior que o esperado | Baixa | Médio | Monitorar dashboard diariamente na 1ª semana; quota apertada no início |

---

## Itens fora do plano atual (backlog)

Estes itens estão documentados mas não fazem parte das 5 semanas do MVP:

- Webhook Hotmart para provisionar tokens automaticamente (P1 do PRD)
- Export de resumo em PDF
- Histórico de sessão na nuvem
- Trilhas de certificação (conteúdo)
- Simulado completo (banco de questões)
- Site público `www.stackcalc.com.br` (framework + glossário + simulado mini)
- ADR-002 (hospedagem) e ADR-003 (provedor LLM)
- Integração CI/CD automatizada (GitHub Actions)
