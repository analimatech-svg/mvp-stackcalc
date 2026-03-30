# PRD — StackCalc Web MVP

**Versão**: 0.1
**Data**: 2026-03-30
**Status**: Rascunho — aguardando validação dos valores de paridade da planilha

---

## 1. Objetivo

Validar com **poucos usuários pagantes** (pilotos Hotmart/Mentoratech) que:

1. A calculadora web produz resultados equivalentes à planilha **StackCalc v2.0** (paridade aceitável ≤ 5% de desvio em horas totais).
2. O fluxo de 5 etapas (Escopo → Estimativa → Calculadora → Validador → Agente) reduz fricção vs. uso direto do Excel.
3. O Agente entrega valor percebido (defesa técnica / mapa de riscos) sem vazar chaves de API e com custo controlado.

---

## 2. Personas

### 2.1 Persona primária — Tech Lead / Arquiteto

- **Contexto**: precisa defender estimativas para stakeholders de negócio.
- **Dor**: Excel dificulta rastreabilidade e colaboração; explicar os números em reunião consome tempo.
- **Ganho esperado**: gerar defesa técnica em texto a partir dos dados preenchidos, com link compartilhável.

### 2.2 Persona secundária — PM / Product Owner

- **Contexto**: precisa entender o esforço sem mergulhar em fórmulas.
- **Dor**: planilha intimidadora; não sabe qual classificação escolher.
- **Ganho esperado**: ver o resumo (prontidão de escopo + classificação + horas) em um painel direto.

### 2.3 Persona terciária — Desenvolvedor Sênior

- **Contexto**: preenche estimativas por demanda de líder ou cliente.
- **Dor**: precisa justificar por que "isso é um projeto Grande e não Médio".
- **Ganho esperado**: Agente gera argumentação técnica com base nos dados preenchidos.

---

## 3. Escopo do MVP

### P0 — Obrigatório para pilotos

| ID | Funcionalidade | Critério de aceite |
|----|---------------|--------------------|
| P0-01 | Aba Escopo: preenchimento e score de prontidão | Score calculado; rótulo (Verde/Amarelo/Vermelho) exibido |
| P0-02 | Aba Estimativa: classificação de complexidade | Seleção de complexidade salva e reflete nas demais abas |
| P0-03 | Aba Calculadora: totais por papel | Horas Dev, Doc, Gestão+Contingência e Total dentro da faixa da planilha v2.0 |
| P0-04 | Aba Validador: checklist de riscos | Itens marcáveis; contagem de riscos exibida |
| P0-05 | Proxy serverless para o Agente | Chave LLM não exposta no browser; rate limit aplicado |
| P0-06 | Agente: geração de defesa técnica | Resposta gerada a partir dos dados da sessão; erro exibido em caso de falha |
| P0-07 | Paridade StackCalc v2.0 | Casos de teste de paridade passando (ver `docs/qa/test-plan.md`) |

### P1 — Desejável para pilotos (não bloqueia lançamento)

| ID | Funcionalidade | Observação |
|----|---------------|------------|
| P1-01 | Export de resumo (texto/PDF) | Gera documento para apresentação |
| P1-02 | Histórico de sessão | Última análise disponível ao recarregar |
| P1-03 | Aba Sprints | Distribuição por sprint (presente na v2.0 mas não crítica para validação) |
| P1-04 | Link compartilhável (read-only) | URL com estado codificado para compartilhar resultado |
| P1-05 | Integração Hotmart webhook | Validação automática de compra para liberar acesso |

### Fora do escopo MVP

- Histórico na nuvem / multi-usuário
- Badges e certificação (trilha completa)
- Mobile nativo
- Time-tracking integrado
- Simulado completo (apenas mini prova pública)

---

## 4. Métricas de sucesso do piloto

| Métrica | Meta MVP (pilotos) | Como medir |
|---------|-------------------|------------|
| Paridade de cálculo | Desvio ≤ 5% em todos os casos P0 | Testes automatizados vs planilha |
| Satisfação de uso | NPS ≥ 7 com pilotos | Formulário pós-uso (n ≥ 5) |
| Uso do Agente | ≥ 60% dos pilotos usa pelo menos 1x | Log do proxy |
| Custo de LLM por usuário | ≤ R$ 2,00 / mês (quota 20 req/mês) | Dashboard do provedor |
| Taxa de erro do Agente | ≤ 10% das requisições | Log de erro no proxy |
| Tempo até primeiro resultado | ≤ 3 min do primeiro acesso | Auto-relato ou heurística |

---

## 5. Fora de escopo — decisões explícitas

| Tema | Decisão |
|------|---------|
| Autenticação própria | MVP usa token simples (assinado) + lista de e-mails autorizados; OAuth/Hotmart webhook é P1 |
| Banco de dados | Nenhum no MVP; estado na sessão do browser (sessionStorage/localStorage) |
| Persistência na nuvem | Fora do MVP |
| Múltiplos idiomas | Somente PT-BR |
| Acessibilidade WCAG AA completa | Melhor esforço no MVP (contraste, foco); auditoria completa é P1 |

---

## 6. Critério de "pronto para pilotos"

- [ ] Todos os casos P0 de paridade passando.
- [ ] Proxy serverless em produção com rate limit e sem vazar chave.
- [ ] Happy path testado manualmente (Escopo → Agente) por pelo menos 1 usuário interno.
- [ ] `docs/runbook.md` completo e executável por alguém que não o autor.
- [ ] Sem dados sensíveis hardcoded no código (chaves, tokens, e-mails reais).

---

## 7. Dependências e riscos

| Item | Risco | Mitigação |
|------|-------|-----------|
| Planilha StackCalc v2.0 | Fórmulas não documentadas → desvio de paridade | Exportar valores "ouro" para test-plan antes de codar |
| Custo de LLM | Pilotos abusam da quota | Rate limit por usuário/mês no proxy |
| Integração Hotmart | Webhook demora para chegar | MVP começa com lista de e-mails autorizados |
| Chave LLM exposta | Bug expõe key no front | ADR-001: somente proxy serverless para produção |
| Paridade incompleta | Usuário encontra divergência vs Excel | Exibir versão da planilha de referência no rodapé |

---

## 8. Próximos passos

1. Carregar `StackCalc_v2_0.xlsx` no repositório (pasta `references/`) para extração dos valores de paridade.
2. Preencher tabela de valores "ouro" em `docs/qa/test-plan.md`.
3. Escolher provedor serverless (Cloudflare Workers, Vercel Functions ou Netlify Functions).
4. Implementar proxy mínimo e testar com 1 usuário interno.
5. Convidar 3–5 pilotos e coletar NPS.
