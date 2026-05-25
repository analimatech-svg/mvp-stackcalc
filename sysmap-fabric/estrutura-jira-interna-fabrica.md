# Estrutura Jira — Board Interno da Fábrica (CoE · Tradicional · Agêntica)

**v1.0 · Maio 2026 · Confidencial — SysMap Solutions**
Estrutura para *conduzir* a construção e a governança das fábricas. Não confundir com a `spec-jira-sysmap-fabric-v1.2` (essa configura os projetos de **cliente**). Aqui é o board que organiza o trabalho de **montar e governar** o CoE, a Fábrica Tradicional e a Fábrica Agêntica.

---

## 0. Decisões de arquitetura do board

| Decisão | Escolha | Status |
|---|---|---|
| Unidade no Jira | **1 projeto interno** `FABRIC-INTERNO` (não 3 separados) | ✅ Recomendado |
| Eixo das swimlanes | **Por Programa**: CoE / Tradicional / Agêntica / Transversal | ✅ Recomendado |
| Tipo de board | **Kanban** (governança contínua, sem sprint fixa) | ✅ Recomendado |
| Nível de programa | Campo `Programa` (ou Initiative, se Jira Premium) | ⚠ Confirmar se há Premium |
| Estimativa | **T-shirt (S/M/L/XL)** — sem horas (board de construção, não de entrega) | ✅ Recomendado |
| Hierarquia máxima | Initiative → Epic → Story/Enabler/Spike → Task | ⚠ Initiative só no Premium |

> **Por que 1 projeto e não 3:** os três programas não são contratos separados; compartilham pessoas, governança e dependências cruzadas (ex.: a Agêntica reusa a governança da Tradicional). Um projeto com swimlane por Programa dá *painel único* para a Diretoria de Operações e o Power BI de portfólio. Se um programa crescer muito, promove-se para projeto próprio depois.

---

## 1. Tipos de item — quando usar cada um

| Tipo | O que é | Quando usar | Exemplo |
|---|---|---|---|
| **Initiative** *(opcional)* | Programa | Só se houver Jira Premium; senão usar campo `Programa` | Fábrica Agêntica |
| **Epic** | Frente de trabalho dentro de um programa | Agrupa entregas com um objetivo comum | `[AGÊNTICA] Stack de Execução` |
| **Story (US)** | Entrega de **valor** a um stakeholder | Tem dono, benefício e critério de aceite | "Como gestor, quero dashboard de telemetria…" |
| **Enabler** | Trabalho técnico **habilitador**, sem valor direto ao usuário | Fundação que destrava outras histórias (infra, MCP, KB) | `[MCP] Construir MCP de Engenharia` |
| **Spike** | Investigação **time-boxed** | Há incerteza técnica/decisão a embasar | `[SPIKE] RAG no Supabase para KB é viável? (3d)` |
| **Task** | Unidade técnica ≤ 8h | Decomposição de Story/Enabler | `[KB] Subir 3 templates oficiais na KB` |
| **Bug** | Defeito em ferramenta/stack interna | Algo que construímos quebrou | `[BUG] Context Loader não lê labels do Jira` |

**Regra Epic vs Enabler vs Story:** se um humano/stakeholder percebe o valor → **Story**. Se é fundação técnica que só destrava outras coisas → **Enabler**. Se é "não sei ainda, preciso investigar" → **Spike**.

**Categorias de governança** (campo `Categoria`, não é tipo de item): `Decisão` · `Ação` · `Entrega` · `Aberto`. Servem para o board executivo distinguir o que é decisão a tomar vs entrega concreta.

---

## 2. Swimlanes e colunas

**Swimlanes (por `Programa`):**

| Swimlane | Escopo |
|---|---|
| CoE Salesforce | Montar e operar o Centro de Excelência |
| Fábrica Tradicional | Operacionalizar o modelo de entrega humano (Jira, governança, calculadora) |
| Fábrica Agêntica | Construir a stack agêntica (Context Loader, MCPs/Skills, KB, piloto) |
| Transversal / Plataforma | Infra compartilhada (este board, Power BI de portfólio, SharePoint/Confluence) |

**Colunas (Kanban):**

`Backlog → A Fazer → Em Andamento → Em Revisão → Bloqueado → Concluído`

| Coluna | Status Jira | O que entra |
|---|---|---|
| Backlog | Backlog | Mapeado, ainda não priorizado |
| A Fazer | To Do | Priorizado, **DoR cumprido** |
| Em Andamento | In Progress | Trabalho ativo, com dono |
| Em Revisão | In Review | Aguardando validação (Ana / Gerente Delivery / Domain Owner) |
| Bloqueado | Blocked | Impedimento — precisa decisão |
| Concluído | Done | **DoD cumprido** + evidência anexada |

---

## 3. Campos customizados — e para que serve cada um

> Os campos de *entrega a cliente* (Cobertura Apex, GUT, UAT, Estimativa em horas) **não se aplicam** aqui. Este board é de construção/governança.

| # | Campo | Tipo | Aplica em | Obrigatório | Para que serve |
|---|---|---|---|---|---|
| 1 | **Programa** | Lista | Epic/Story/Enabler/Spike/Bug | Sim | Dirige a swimlane, agrupa por fábrica, filtra no Power BI de portfólio |
| 2 | **Categoria** | Lista (Decisão/Ação/Entrega/Aberto) | Story/Enabler/Spike | Sim | Distingue decisão a tomar vs entrega; alimenta o board executivo |
| 3 | **Tipo de Enabler** | Lista (Infra/MCP/Skill/Knowledge Base/Integração/Tooling/Processo) | Enabler | Sim | Classifica a fundação técnica — essencial para enxergar a stack agêntica sendo construída |
| 4 | **Horizonte** | Lista (2026-Q2/Q3/Q4/2027+) | Epic/Story/Enabler | Sim | Planejamento por trimestre/onda do roadmap |
| 5 | **Esforço (T-shirt)** | Lista (S/M/L/XL) | Story/Enabler/Spike | Sim no planning | Estimativa leve sem horas; capacidade do board interno |
| 6 | **Sponsor** | Lista (Ana Lima/Gerente Delivery/Domain Owner SF/Líder FSW AI/CoE) | Epic/Story | Sim | Dono executivo responsável pelo resultado |
| 7 | **Status da Decisão** | Lista (Proposta/Em discussão/Decidida/Revisar) | Categoria=Decisão | Sim p/ decisões | Rastreia decisões em aberto — é o backlog de decisões vivo |
| 8 | **Resultado-Chave (OKR)** | Texto curto | Epic/Story | Não | Amarra o item ao objetivo estratégico do programa |
| 9 | **Definition of Ready** | Checkbox/Texto | Story/Enabler/Spike | Sim antes de "A Fazer" | Garante que o item está pronto p/ execução (na Agêntica = *context-ready*) |
| 10 | **Critério de Aceite (DoD)** | Texto longo | Story/Enabler | Sim antes de Concluído | Define quando o item está feito |
| 11 | **Evidência / Link de Entrega** | URL | Story/Enabler/Spike | Sim ao concluir | Artefato gerado (doc, repo, board, dashboard) — evita "done" sem prova |
| 12 | **Bloqueado por** | Link nativo (*is blocked by*) | Todos | Quando aplicável | Dependências entre itens e entre programas |

---

## 4. Padrão de escrita (títulos)

| Tipo | Formato | Exemplo |
|---|---|---|
| Epic | `[PROGRAMA] Frente — objetivo` | `[AGÊNTICA] Stack de Execução` |
| Story | `Como [papel], quero [ação] para [benefício]` | `Como Engenheiro AI, quero contexto pré-carregado para implementar sem montar prompt do zero` |
| Enabler | `[TIPO] o que construir` | `[MCP] MCP de Governança — quality gate e design patterns` |
| Spike | `[SPIKE] pergunta (time-box)` | `[SPIKE] Vale RAG ou prompt estático para a KB? (3d)` |
| Decisão | `[DECISÃO] tema` + Categoria=Decisão | `[DECISÃO] Fábrica Agêntica entrega SF, custom ou ambos?` |
| Task | `[PREFIXO] ação` | `[KB] Publicar guideline de código v1` |

**Prefixos de Task:** reuso da v1.2 — `[CONFIG] [DOC] [INTEG] [DEPLOY] [DEV] [TEST] [QA]` — **+ novos da agêntica**: `[MCP] [SKILL] [KB] [PROMPT] [CONTEXT]`.

---

# 5. Backlog por programa

> Convenção abaixo: **E-** = Epic, **US-** = Story, **EN-** = Enabler, **SP-** = Spike, **DEC-** = Decisão (Story c/ Categoria=Decisão). Tarefas listadas nas histórias mais representativas — o padrão se repete nas demais.

---

## PROGRAMA A — CoE Salesforce

### E-COE-1 · `[CoE] Fundação` — colocar o CoE no ar
- **DEC-COE-1** `[DECISÃO] Quem é o Domain Owner SF` — *Status da Decisão: Proposta* · Sponsor: Ana Lima · **bloqueia todo o CoE**
- **US-COE-1** Como diretoria, quero o charter do CoE publicado para legitimar a prática
- **US-COE-2** Como squad, quero a matriz RACI do CoE publicada para saber quem decide o quê
- **EN-COE-1** `[PROCESSO]` Iniciar ritos: CoE Weekly + Architecture Review (agenda recorrente)
  - `[DOC]` Modelo de ata + pauta padrão · `[CONFIG]` Criar eventos recorrentes · `[DOC]` Definir quórum
- **US-COE-3** Como Domain Owner, quero o board do CoE no Jira para acompanhar as modalidades

### E-COE-2 · `[CoE] Padrões Técnicos`
- **EN-COE-2** `[KB]` Publicar biblioteca de padrões no Confluence (Configuration First)
- **EN-COE-3** `[PROCESSO]` Definir Índice de Customização (cálculo no SDD)
- **US-COE-4** Como arquiteto, quero template oficial de SDD para padronizar discovery
- **EN-COE-4** `[PROCESSO]` Definir quality gates técnicos (cobertura ≥75%, code review, security model, rollback)

### E-COE-3 · `[CoE] Capacitação — SysMap University`
- **US-COE-5** Como dev, quero a trilha Fundamentos SF para começar com padrão
- **US-COE-6** Como TL, quero a trilha Arquiteto de Solução
- **EN-COE-5** `[PROCESSO]` Montar calendário de certificações Salesforce
- **US-COE-7** Como CoE, quero a primeira turma do bootcamp agendada

### E-COE-4 · `[CoE] Auditoria Técnica`
- **EN-COE-6** `[PROCESSO]` Definir processo de auditoria pós-F2 (checklist, responsável)
- **US-COE-8** Como Domain Owner, quero a 1ª auditoria dos projetos ativos concluída

### E-COE-5 · `[CoE] CoE as a Service` *(Horizonte Q3+)*
- **DEC-COE-2** `[DECISÃO]` Oferta comercial do CoE aS — modelo e pricing
- **US-COE-9** Como cliente, quero um charter de CoE estruturado para minha operação

### E-COE-6 · `[CoE] KPIs & Governança Executiva`
- **US-COE-10** Como diretoria, quero o dashboard executivo do CoE (NPS, cobertura, retrabalho)
- **EN-COE-7** `[PROCESSO]` Estruturar o QBR semestral do CoE

---

## PROGRAMA B — Fábrica Tradicional

### E-TRAD-1 · `[Tradicional] Configuração do Jira de Entrega`
- **DEC-TRAD-1..8** `[DECISÃO]` Confirmar D-01 a D-08 do backlog de decisões (board Scrum, Project Key, swimlanes, overhead, etc.) — *Status: Proposta*
- **EN-TRAD-1** `[CONFIG]` Criar os 21 campos customizados (spec v1.2 seção 3)
  - `[CONFIG]` Campos 1–7 · `[CONFIG]` Campos 8–14 · `[CONFIG]` Campos 15–21 · `[CONFIG]` Associar aos tipos e marcar obrigatórios
- **EN-TRAD-2** `[CONFIG]` Configurar as 4 swimlanes nos projetos de cliente
- **EN-TRAD-3** `[CONFIG]` Criar Project Category por cliente + aplicar padrão de Project Key

### E-TRAD-2 · `[Tradicional] Quality Gates & Automações`
- **EN-TRAD-4** `[CONFIG]` Automação MVP 1 — bloquear → Done se DoD = Falso
- **EN-TRAD-5** `[CONFIG]` Automação MVP 2 — bloquear → In QA se PR não aprovado
- **EN-TRAD-6** `[CONFIG]` Automação MVP 3 — alerta de bug crítico (GUT≥27) por e-mail/Teams
- **US-TRAD-1** Como DM, quero checklist de coluna para os gates ainda não automatizados

### E-TRAD-3 · `[Tradicional] Calculadora de Estimativa`
- **US-TRAD-2** Como TL, quero a tabela de 19 tipos validada para estimar com confiança
  - `[DOC]` Preparar pauta da sessão · `[QA]` Validar os 5 tipos marcados ⚠ · `[DOC]` Registrar horas acordadas
- **DEC-TRAD-9** `[DECISÃO]` Confirmar overhead por tipo (10/15/20%)

### E-TRAD-4 · `[Tradicional] Integração SSG ↔ Jira`
- **US-TRAD-3** Como área SSG, quero os campos financeiros espelhados no Jira (custo/receita/baseline)
- **SP-TRAD-1** `[SPIKE]` API do SSG está disponível para integração? (avaliar — 3d)
- **EN-TRAD-7** `[INTEG]` Spec técnica de integração **ou** SOP de processo manual

### E-TRAD-5 · `[Tradicional] Governança Operacional`
- **US-TRAD-4** Como squad, quero DoR/DoD publicados no canal definido
- **US-TRAD-5** Como DM, quero os templates de kickoff (fechado/evolutivo) em uso
- **EN-TRAD-8** `[CONFIG]` Clonar template de pastas SharePoint por projeto

### E-TRAD-6 · `[Tradicional] Power BI Operacional`
- **US-TRAD-6** Como gestão, quero o Dashboard de Planejamento conectado ao Jira
- **US-TRAD-7** Como diretoria, quero o Dashboard Operacional dos projetos de cliente
- **EN-TRAD-9** `[INTEG]` Conector Jira → Power BI + datasets

---

## PROGRAMA C — Fábrica Agêntica

### E-AGEN-1 · `[Agêntica] Decisões Fundadoras` ⚠ destrava todo o programa
- **DEC-AGEN-1** `[DECISÃO]` Entrega **SF, custom (cloud-native) ou ambos**? — *Status: Em discussão*
- **DEC-AGEN-2** `[DECISÃO]` "Engenheiro AI" = pessoa apoiada por IA **ou** agente autônomo?
- **DEC-AGEN-3** `[DECISÃO]` Gates humanos inegociáveis (PR review + verificação antes de Done)
- **DEC-AGEN-4** `[DECISÃO]` Reusar a governança da Tradicional (DoR/DoD, Jira v1.2) — sim/não
- **DEC-AGEN-5** `[DECISÃO]` Definir o que são SM AI / Stu AI / Warmup (glossário)

### E-AGEN-2 · `[Agêntica] Knowledge Base Arquitetural`
- **EN-AGEN-1** `[KB]` Estruturar a KB: padrões microserviços, EDA, BFF/Front, segurança, guidelines, modelos de dados
  - `[KB]` Arquitetura de referência v1 · `[KB]` Guidelines de código · `[KB]` Padrões de segurança · `[KB]` 3 templates oficiais
- **SP-AGEN-1** `[SPIKE]` Vale RAG (embeddings no Supabase) ou prompt estático para a KB? (3d)
- **EN-AGEN-2** `[PROCESSO]` Definir cadência e dono da evolução da KB (quem aprova novo padrão)

### E-AGEN-3 · `[Agêntica] Catálogo de MCPs/Skills`
- **DEC-AGEN-6** `[DECISÃO]` MCP vs Skill — definir a distinção e quando usar cada um
- **EN-AGEN-3** `[MCP]` MCP de Engenharia — templates e geração de serviços
- **EN-AGEN-4** `[MCP]` MCP de Governança — quality gate, design patterns, pipeline
- **EN-AGEN-5** `[MCP]` MCP de Integração — Supabase + Event Broker
- **EN-AGEN-6** `[MCP]` MCP de Contexto — docs de negócio/técnicos
- **EN-AGEN-7** `[DOC]` Catálogo de MCPs/Skills: dono, versão, entradas/saídas (o registro central)

### E-AGEN-4 · `[Agêntica] Context Loader` ⚠ componente-chave
- **EN-AGEN-8** `[CONTEXT]` Spec do Context Loader: o que carrega, de onde, orçamento de tokens, frescor/cache
- **SP-AGEN-2** `[SPIKE]` POC do Context Loader montando contexto de 1 ticket real (5d)
- **EN-AGEN-9** `[INTEG]` Integração do Loader com Jira + Git + Knowledge Base

### E-AGEN-5 · `[Agêntica] Stack de Execução`
- **EN-AGEN-10** `[CONFIG]` Setup Cursor + Claude + Git para os Engenheiros AI
- **EN-AGEN-11** `[INTEG]` Supabase (SGBD/MCP) — modelagem, functions, RPC
- **EN-AGEN-12** `[INTEG]` Event Broker (Kafka/NATS) — base EDA
- **EN-AGEN-13** `[DEPLOY]` Pipeline DevSecOps → deploy via stack

### E-AGEN-6 · `[Agêntica] DoR de Contexto & Gates Agênticos`
- **US-AGEN-1** Como Líder FSW AI, quero a definição de "história context-ready" para liberar execução
- **EN-AGEN-14** `[PROCESSO]` Definir verificação humana obrigatória antes de auto-update do Jira
- **US-AGEN-2** Como CoE, quero estratégia de geração e revisão de testes do código gerado por IA

### E-AGEN-7 · `[Agêntica] Segurança/LGPD & FinOps da Stack`
- **US-AGEN-3** Como segurança, quero política de dados de cliente no contexto/prompt (LGPD)
- **SP-AGEN-3** `[SPIKE]` Risco de prompt injection via documento da KB — como mitigar? (2d)
- **EN-AGEN-15** `[PROCESSO]` Modelo de custo/história + guardrails de consumo (Claude/Cursor/infra)

### E-AGEN-8 · `[Agêntica] Telemetria & Métricas`
- **US-AGEN-4** Como gestão, quero o Dashboard Produto (evolução, defeitos, lead time)
- **US-AGEN-5** Como Gerente Delivery, quero o Dashboard Stack AI (uso MCP/Skills, produtividade, aderência)
- **EN-AGEN-16** `[PROCESSO]` Definir baseline vs projeto tradicional comparável (prova de ROI)

### E-AGEN-9 · `[Agêntica] Onboarding / Bootcamp & Coaching`
- **US-AGEN-6** Como Engenheiro AI, quero o bootcamp (fundamentos, stack, prática guiada, governança)
- **US-AGEN-7** Como Champion, quero o playbook de coaching (preparação de contexto → autonomia)
- **DEC-AGEN-7** `[DECISÃO]` Champion: um por projeto, por programa ou compartilhado? (escalabilidade)

### E-AGEN-10 · `[Agêntica] Piloto Controlado`
- **US-AGEN-8** Como Gerente Delivery, quero 1 projeto-piloto de baixo risco rodando na stack
- **EN-AGEN-17** `[PROCESSO]` Definir escopo, gates e critérios de sucesso do piloto
- **US-AGEN-9** Como diretoria, quero o resultado do piloto medido contra o baseline (decidir escalar)

---

## PROGRAMA D — Transversal / Plataforma

### E-TRAN-1 · `[Transversal] Board Interno` (este board)
- **EN-TRAN-1** `[CONFIG]` Criar projeto FABRIC-INTERNO + 12 campos customizados (seção 3)
- **EN-TRAN-2** `[CONFIG]` Configurar swimlanes por Programa + colunas Kanban
- **US-TRAN-1** Como Ana, quero todos os épicos/US deste documento criados no board

### E-TRAN-2 · `[Transversal] Power BI de Portfólio`
- **US-TRAN-2** Como diretoria, quero um dashboard dos 3 programas (status, horizonte, bloqueios)
- **EN-TRAN-3** `[INTEG]` Dataset do FABRIC-INTERNO no Power BI (por Programa)

### E-TRAN-3 · `[Transversal] Repositório de Conhecimento`
- **EN-TRAN-4** `[DOC]` Estrutura Confluence/SharePoint para specs e padrões das 3 fábricas
- **US-TRAN-3** Como time, quero um índice único de todos os documentos do programa

---

## 6. Pontos a decidir antes de criar no Jira

| ID | Decisão | Onde impacta | Dono |
|---|---|---|---|
| BRD-01 | Jira tem Premium? (define se Programa = Initiative ou campo) | Hierarquia | Nayara |
| BRD-02 | Swimlane por Programa (recomendado) confirmado? | Layout do board | Ana + Nayara |
| BRD-03 | T-shirt como estimativa (sem horas) confirmado? | Campo Esforço | Ana |
| BRD-04 | Programa "Transversal" existe ou some dentro de cada um? | Swimlanes | Ana |
| BRD-05 | Decisões fundadoras da Agêntica (DEC-AGEN-1..7) | Todo o Programa C | Ana + Gerente Delivery |

---
*Próximo passo sugerido: você confirma BRD-01..05, e eu gero a versão "copiar e colar no Jira" — cada épico/US/enabler com título no padrão, campos preenchidos e ordem de criação (igual o board-admin fez para as 6 frentes).*
