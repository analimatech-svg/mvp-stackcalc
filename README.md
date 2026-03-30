# StackCalc MVP

Calculadora web de estimativa e escopo para projetos de software — versão MVP validável com pilotos.

## O que é

O **StackCalc** é um framework de estimativa de projetos que transforma a complexidade do dimensionamento em um processo estruturado de 5 etapas:

1. **Escopo** — qualificação e prontidão da demanda
2. **Estimativa** — classificação de complexidade e horas
3. **Calculadora** — distribuição por papel e sprint
4. **Validador** — checklist de riscos e consistência
5. **Agente** — análise e defesa técnica assistida por IA

## Estrutura do repositório

```
mvp-stackcalc/
├── docs/
│   ├── product/
│   │   ├── prd-mvp.md          # PRD com P0/P1 e métricas do piloto
│   │   └── glossary.md         # Glossário oficial do framework
│   ├── architecture/
│   │   └── system-overview.md  # Diagrama, fluxo de dados, limites
│   ├── adr/
│   │   └── ADR-001-proxy-llm.md # Decisão: proxy serverless vs chave no browser
│   ├── security/
│   │   └── threat-model-mvp.md # Chaves, tokens, dados enviados ao LLM
│   ├── ux/
│   │   └── ui-spec.md          # Fluxos, estados de tela, tom de voz
│   ├── qa/
│   │   └── test-plan.md        # Casos de paridade + IA + autorização
│   ├── commercial/
│   │   └── positioning.md      # Encaixe Hotmart, comunidade, roadmap
│   └── runbook.md              # Deploy, variáveis de ambiente, secrets
├── CHANGELOG.md
└── README.md
```

## Como rodar localmente

O front atual é uma SPA estática — sem build step.

```bash
# Clone o repositório
git clone https://github.com/analimatech-svg/mvp-stackcalc.git
cd mvp-stackcalc

# Sirva com qualquer servidor estático, por exemplo:
npx serve .
# ou
python3 -m http.server 8080
```

Acesse `http://localhost:8080` (ou a porta do seu servidor).

## Variáveis de ambiente

Para habilitar o Agente IA (requer proxy serverless):

| Variável             | Onde definir          | Descrição                                      |
|----------------------|-----------------------|------------------------------------------------|
| `LLM_API_KEY`        | Painel do provedor    | Chave da API do LLM (nunca no front)           |
| `LLM_MODEL`          | Painel do provedor    | Ex.: `claude-sonnet-4-6`                       |
| `TOKEN_SECRET`       | Painel do provedor    | Segredo para assinar/validar tokens de usuário |
| `RATE_LIMIT_RPM`     | Painel do provedor    | Máximo de requisições por minuto por usuário   |

Ver detalhes em [`docs/runbook.md`](docs/runbook.md).

## Deploy

- **Fase 1 (front only)**: Cloudflare Pages / Netlify / GitHub Pages — arrastar pasta ou conectar repositório.
- **Fase 2 (com IA)**: mesmo front + função serverless no mesmo provedor.

Ver passo a passo em [`docs/runbook.md`](docs/runbook.md).

## Documentação de produto

| Documento | O que contém |
|-----------|-------------|
| [`docs/product/prd-mvp.md`](docs/product/prd-mvp.md) | Objetivo, personas, P0/P1, métricas de sucesso |
| [`docs/product/glossary.md`](docs/product/glossary.md) | Glossário oficial StackCalc |
| [`docs/architecture/system-overview.md`](docs/architecture/system-overview.md) | Arquitetura, diagrama, fluxo de dados |
| [`docs/adr/ADR-001-proxy-llm.md`](docs/adr/ADR-001-proxy-llm.md) | Decisão de proxy vs chave no browser |
| [`docs/security/threat-model-mvp.md`](docs/security/threat-model-mvp.md) | Modelo de ameaças do MVP |
| [`docs/ux/ui-spec.md`](docs/ux/ui-spec.md) | Especificação UX/UI |
| [`docs/qa/test-plan.md`](docs/qa/test-plan.md) | Plano de testes e casos de paridade |
| [`docs/runbook.md`](docs/runbook.md) | Runbook de deploy e operação |
| [`docs/commercial/positioning.md`](docs/commercial/positioning.md) | Posicionamento comercial |

## Versão de referência

A paridade da calculadora é validada contra **StackCalc v2.0** (planilha Excel). Ver [`docs/qa/test-plan.md`](docs/qa/test-plan.md).

## Licença

Produto proprietário — Mentoratech / StackCalc. Todos os direitos reservados.
