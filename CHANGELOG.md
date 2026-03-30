# Changelog — StackCalc MVP

Todas as mudanças notáveis deste projeto são documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [Não lançado]

### Adicionado
- Estrutura inicial do repositório com toda a documentação de projeto
- `docs/product/prd-mvp.md` — PRD com P0/P1, personas e métricas do piloto
- `docs/product/glossary.md` — Glossário oficial do StackCalc Framework
- `docs/architecture/system-overview.md` — Visão geral da arquitetura (front + proxy + LLM)
- `docs/adr/ADR-001-proxy-llm.md` — Decisão de arquitetura: proxy serverless vs. chave no browser
- `docs/security/threat-model-mvp.md` — Modelo de ameaças STRIDE para o MVP
- `docs/ux/ui-spec.md` — Especificação UX/UI: fluxos, estados de tela, tom de voz
- `docs/qa/test-plan.md` — Plano de testes com casos de paridade e casos do Agente
- `docs/runbook.md` — Runbook de deploy, variáveis de ambiente e rotação de chaves
- `docs/commercial/positioning.md` — Posicionamento comercial: Hotmart, comunidade, roadmap

### Pendente (próximos passos)
- Carregar `references/StackCalc_v2_0.xlsx` e preencher valores de paridade no test-plan
- Implementar proxy serverless (Cloudflare Worker)
- Implementar gate de acesso (lista de e-mails autorizados + JWT)
- Testes automatizados de paridade (`tests/`)
- Deploy em staging para validação com pilotos internos

---

## [0.0.1] — 2026-03-30

### Adicionado
- Repositório criado (`analimatech-svg/mvp-stackcalc`)
- `README.md` inicial
- Branch de desenvolvimento: `claude/stackcalc-mvp-development-MBTXT`
