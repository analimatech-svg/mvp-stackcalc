# Backlog de Decisões — SysMap Fabric

Gerado na revisão item a item da Spec Jira (v1.1 → v1.2) · Mai 2026 · Confidencial — SysMap Solutions

Este backlog consolida o que **ficou decidido na v1.2** e o que **ainda precisa de input externo** antes da configuração final do Jira. Prioridade: P1 (bloqueia primeiro projeto) · P2 (importante, não bloqueia) · P3 (melhoria).

---

## A. Decisões — fechadas na v1.3 (Ana)

Decisões aplicadas à spec v1.3. Itens 🟡 Adiado ficam para uma próxima rodada.

| ID | Decisão | Definição (v1.3) | Status |
|----|---------|------------------|--------|
| D-01 | Tipo de board no Jira | Projeto **Scrum** — a sprint funciona como **container** de planejamento | ✅ Decidido |
| D-02 | Project Key padrão | **SSG + 5 dígitos** do ID (ex: `SSG47709`) — sem sufixos | ✅ Decidido |
| D-03 | Swimlanes do board | **2 swimlanes**: Upstream / Downstream · Overhead = tipo de item · Bugs = cards no Downstream | ✅ Decidido |
| D-04 | Agrupamento por cliente | **Espaço por cliente** — instância não é Cloud, permite espaços individuais | ✅ Decidido |
| D-05 | Overhead padrão | **10% fixo** por US | ✅ Decidido |
| D-06 | Throughput conta o quê | Boas práticas: **Story + Bug** concluídos por período, **em todos** os projetos | ✅ Decidido |
| D-07 | Campos: nativo vs criar | **Nativo primeiro** (estimativa, tempo, resolução, labels); criar só o que falta | ✅ Decidido |
| D-08 | Critério AMS board vs swimlane | **Ver depois** — manter em itens abertos | 🟡 Adiado |
| D-09 | Financeiro no Jira | Custo/receita/margem **NÃO** no Jira — só Power BI, unido pelo **SSG ID** (chave) | ✅ Decidido |
| D-10 | Fase da Fábrica como campo | **Não criar** — a fase é a coluna/status do board | ✅ Decidido |
| D-11 | Alertas | Configurar **alertas com SLA** no Jira (bug crítico 2h, etc.) | ✅ Decidido |
| D-12 | Calculadora de estimativa | **Detalhar depois** (tabela de horas) | 🟡 Adiado |

---

## B. Bloqueios — dependem de input externo

Não dá para fechar sem uma reunião/levantamento. Cada um tem dono e o que falta exatamente.

| ID | Item | O que falta | Dono | Prioridade |
|----|------|-------------|------|------------|
| B-01 | ~~Campos financeiros do SSG no Jira~~ | ✅ **Resolvido (v1.3)** — financeiro fica só no Power BI; no Jira só o SSG ID como chave de junção | — | — |
| B-02 | Validar tabela de horas da calculadora | Sessão com TL + Arquiteto revisando os **19 tipos** — detalhar depois (D-12) | TL / Arquiteto | P2 |
| B-06 | Pasta template por tipo de projeto | Criar template (escopo/evolutivo/AMS) já com **pastas + prompts + docs padrão** — base para fábrica tradicional e agêntica | Nayara + CoE | P1 |
| B-03 | Viabilidade Sonar/SonarCloud para Apex | Confirmar com TI se há instância; custo ~USD 450/mês (SonarCloud) ou SonarQube Community grátis. **Contexto já no doc** | Tech Lead + TI | P2 |
| B-04 | Integração SSG ↔ Jira | API do SSG disponível? Spec técnica ou SOP manual. Definir trigger de criação do projeto | Ana Lima + TI | P2 |
| B-05 | Padrão de quebra de tasks | Definir com o squad a granularidade real além do "máx 8h" (mudança de contexto técnico, dependência de ambiente) | TL + Squad | P3 |

---

## C. Automações Jira — ordem de implementação (resolve ponto aberto #5)

MVP de 3 automações bloqueantes antes do primeiro projeto; o resto fica como checklist manual de coluna.

| Ordem | Automação | Regra | Prioridade |
|-------|-----------|-------|------------|
| 1 | Bloquear `→ Done` | se `DoD Completo? = Falso` | P1 |
| 2 | Bloquear `→ In QA` | se PR não aprovado / não linkado | P1 |
| 3 | Alerta bug crítico | `Bug + GUT Crítico` criado → e-mail DM + Ana (+ Teams/Slack) | P1 |
| 4 | Demais gates (Tabelas 6–9) | checklist manual por coluna até automatizar | P2 |

---

## D. Pendências de confirmação factual

| ID | Item | Pergunta | Dono |
|----|------|----------|------|
| F-01 | KPI "9 documentos gerados" | Quais são os 9? Eu identifico 6 artefatos (5 docx + 1 pptx). Templates do kit-gov contam separados? | Ana Lima |
| F-02 | Aderência à estimativa em AMS | Tabela 17 marca "—" para AMS. AMS tem baseline de horas? Se sim, deveria medir | Ana Lima |

---

## E. Resolvidos / reclassificados na revisão

| Ponto aberto original (Tabela 19) | Novo status |
|-----------------------------------|-------------|
| #9 — Campos do SharePoint por projeto | ✅ **Resolvido** — kit-governanca-jornadas-sharepoint-v1.0.docx seção 5 |
| #10 — Spec dos dashboards Power BI | 🟡 **Parcial** — operacional no board-admin seção 2; jornadas no kit-gov seção 4. Falta: design visual do dashboard do cliente e do executivo da diretoria |

---

## Resumo de prioridades

- **Decidido (v1.3):** D-01..D-07, D-09, D-10, D-11 — aplicados na spec v1.3
- **Adiado:** D-08 (AMS), D-12 (calculadora detalhada)
- **P1 a executar:** B-06 (pasta template), automações 1–3, criar campos no Jira
- **P2:** B-02 (calculadora), B-03 (Sonar), B-04 (integração SSG)

> Nota: instância **não é Jira Cloud** — isso afeta a conexão do Power BI (board-admin assume conector Cloud/API pública). Revisar o método de conexão para Server/Data Center.

---
*Referência: spec-jira-sysmap-fabric-v1.3.docx · Códigos PC/PA/M/D conforme revisões da sessão.*
