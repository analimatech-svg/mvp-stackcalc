# Backlog de Decisões — SysMap Fabric

Gerado na revisão item a item da Spec Jira (v1.1 → v1.2) · Mai 2026 · Confidencial — SysMap Solutions

Este backlog consolida o que **ficou decidido na v1.2** e o que **ainda precisa de input externo** antes da configuração final do Jira. Prioridade: P1 (bloqueia primeiro projeto) · P2 (importante, não bloqueia) · P3 (melhoria).

---

## A. Decididos na v1.2 — sugestões a confirmar

Aplicados ao documento como proposta. Precisam de um "ok" do responsável para virarem definitivos.

| ID | Decisão | Proposta aplicada na v1.2 | Confirmar com | Prioridade |
|----|---------|---------------------------|---------------|------------|
| D-01 | Tipo de board no Jira | Projeto **Scrum** (habilita sprints e `openSprints()` nos JQLs) | Nayara / Jira Admin | P1 |
| D-02 | Project Key padrão | `SSG`+ID (ex: `SSG47709`); evolutivos `…E`, AMS `…A`, interno `FABINT…` | Nayara | P1 |
| D-03 | Swimlanes do board | 4 fixas: Upstream / Downstream / Overhead / Bugs | Ana + Nayara | P1 |
| D-04 | "Espaço" por cliente | **Project Category** no Jira (não existe "Espaço") | Nayara | P2 |
| D-05 | Overhead padrão por tipo | Escopo fechado 10% · Evolutivos 15% · AMS 20% | Tech Lead | P2 |
| D-06 | Throughput conta o quê | Apenas US em F3–F5 (downstream) | Tech Lead | P2 |
| D-07 | Horas: custom vs nativo | Manter campos custom #4/#5; **desativar** Time Tracking/Story Points nativos | Tech Lead | P2 |
| D-08 | Critério AMS board vs swimlane | ≥ 3 tickets AMS/semana → board próprio; senão swimlane | Ana + Nayara | P3 |

---

## B. Bloqueios — dependem de input externo

Não dá para fechar sem uma reunião/levantamento. Cada um tem dono e o que falta exatamente.

| ID | Item | O que falta | Dono | Prioridade |
|----|------|-------------|------|------------|
| B-01 | Campos do SSG a espelhar no Jira | Levantar com a área SSG quais campos financeiros entram. **v1.2 já pré-propõe**: Custo previsto, Receita prevista, Baseline, Margem prevista, Data go-live, Tipo de contrato | Ana Lima + Área SSG | P1 |
| B-02 | Validar tabela de horas da calculadora | Sessão com TL + Arquiteto revisando os **19 tipos** (5 marcados ⚠ Validar: Apex, LWC, Integração, + os 4 novos) | TL / Arquiteto | P1 |
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

- **P1 (bloqueia o 1º projeto):** D-01, D-02, D-03, B-01, B-02, automações 1–3
- **P2 (importante):** D-04, D-05, D-06, D-07, B-03, B-04, automação 4
- **P3 (melhoria):** D-08, B-05

---
*Referência: spec-jira-sysmap-fabric-v1.2.docx · Códigos PC/PA/M conforme revisão crítica da sessão.*
