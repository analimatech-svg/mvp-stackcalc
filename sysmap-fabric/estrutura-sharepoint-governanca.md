# SharePoint — "00. Governança e Gestão" (interno)

**Regra de numeração:** sempre `00 / 10 / 20 …` de 10 em 10, com zero à esquerda (ordena certo e permite inserir 05/15 depois sem renumerar). Vale para **pastas e arquivos**. Versão sempre no fim: `-v1.0`.

> Pasta **interna** da fábrica (padrões, templates, specs, status). Entregas de **cliente** NÃO ficam aqui — vão no SharePoint do projeto (estrutura de 9 pastas do kit-gov). Legenda: ✓ = já existe · ⊕ = criar/extrair.

```
00. Governança e Gestão
│
├── 00. Framework e Metodologia
│   ├── 00-metodologia-sysmap-fabric-v1.0.docx            ⊕
│   ├── 10-pipeline-track-f0-f5-v1.0.docx                 ⊕
│   ├── 20-dor-dod-salesforce-v1.0.docx                   ⊕
│   └── 30-glossario-termos-fabrica-v1.0.docx             ⊕
│
├── 10. Jira e Ferramentas
│   ├── 00-spec-jira-sysmap-fabric-v1.3.docx              ✓
│   ├── 10-board-admin-jira-powerbi-v1.0.docx             ✓
│   ├── 20-estrutura-jira-interna-fabrica-v1.0.docx       ✓ (md → docx)
│   └── 30-jql-filtros-padrao-v1.0.docx                   ⊕ (extrair da spec §7.2)
│
├── 20. CoE Salesforce
│   ├── 00-coe-sf-estrutura-oficial-v1.0.docx             ✓
│   ├── 10-coe-sf-apresentacao-v1.0.pptx                  ✓
│   ├── 20-raci-modalidades-v1.0.docx                     ⊕ (extrair do CoE)
│   └── 30-roadmap-coe-2026-v1.0.docx                     ⊕ (extrair do CoE)
│
├── 30. Kit de Governança por Projeto
│   ├── 00-kit-onboarding-fase0-v1.0.docx                 ✓ (raiz → aqui)
│   ├── 10-checklist-readiness-score-v1.0.xlsx            ✓ (raiz → aqui · gate F0)
│   ├── 20-template-kickoff-escopo-fechado-v1.0.docx      ✓ (kit-gov)
│   ├── 30-template-kickoff-evolutivos-v1.0.docx          ✓ (kit-gov)
│   ├── 40-documento-escopo-dentro-fora-v1.0.docx         ✓ (kit-gov)
│   ├── 50-template-change-request-v1.0.docx              ⊕
│   └── 60-template-projeto/                              ⊕ (clonável: pastas + prompts + docs padrão — item B-06)
│
├── 40. Jornada por Público e Dashboards
│   ├── 00-jornada-por-publico-v1.0.docx                  ✓ (kit-gov §4 — extrair)
│   ├── 10-spec-powerbi-sysmap-fabric-v1.0.docx           ✓ (consolidado — 6 dashboards)
│   ├── 20-visao2-demanda-status-v1.0.pptx                ✓ (html → pptx)
│   └── 30-weekly-report-template-v1.0.docx               ⊕
│
├── 50. SharePoint e Documentação
│   ├── 00-estrutura-sharepoint-por-projeto-v1.0.docx     ✓ (kit-gov §5 — extrair)
│   ├── 10-nomenclatura-arquivos-padrao-v1.0.docx         ✓ (kit-gov §5.2 — extrair)
│   └── 20-sop-confluence-sharepoint-v1.0.docx            ✓ (kit-gov §5.4 — extrair)
│
├── 60. Capacitação
│   ├── 00-trilhas-desenvolvimento-salesforce-v1.0.docx   ⊕
│   ├── 10-calendario-treinamentos-2026.xlsx              ⊕
│   └── 20-materiais-sysmap-university-sf/                ⊕
│       ├── 00-fundamentos-sf
│       ├── 10-desenvolvedor-apex-lwc
│       ├── 20-arquiteto-solucao
│       └── 30-fabrica-agentica
│
├── 70. Status e Acompanhamento
│   ├── 00-status-sysmap-fabric-mai2026.pptx              ✓
│   ├── 10-status-geral-fabrica-v1.0.docx                 ✓
│   ├── 20-backlog-decisoes-v1.0.docx                     ✓ (md → docx)
│   └── 30-atas-reunioes/                                 ⊕
│       ├── 2026-05-21-kickoff-fabrica.docx
│       └── 2026-05-25-revisao-jira.docx
│
└── 80. Fábrica Agêntica                                  ⊕ (criar quando houver specs)
    ├── 00-arquitetura-fabrica-agentica-v1.0.docx
    ├── 10-catalogo-mcps-skills-v1.0.docx
    ├── 20-spec-context-loader-v1.0.docx
    └── 30-knowledge-base-arquitetural/
```

## Decisões (resumo)
- **Pastas avulsas** (`apresentacao-fabric`, `sysmap-fabric`, `Documentação do Framework`) → incorporadas na taxonomia numerada.
- **Arquivos da raiz** (onboarding F0 + readiness-score) → ambos em **30. Kit de Governança** (são artefatos do gate F0).
- **Clientes** → SharePoint separado por projeto (esta pasta é só interna).
- **Power BI** → uma spec consolidada (40-10), não duas separadas.
- **Fábrica Agêntica** → ganha pasta própria (80) quando as specs existirem; por ora só aparece no status.

## Onde está a fábrica agêntica vs tradicional
- Tradicional + CoE + governança = pastas 00–70.
- Agêntica = pasta 80 (a estruturar) — foco Salesforce.
