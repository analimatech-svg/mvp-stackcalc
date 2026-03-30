# Posicionamento Comercial — StackCalc MVP

**Versão**: 0.1
**Data**: 2026-03-30
**Aviso**: este documento trata de estratégia de produto e encaixe comercial. Não é assessoria jurídica nem tributária.

---

## 1. O que o StackCalc entrega (proposta de valor)

O StackCalc transforma o processo de estimativa de projetos de software — que costuma ser informal, dependente de intuição ou de planilhas inacessíveis — em um **framework estruturado e auditável** em 5 etapas.

**Para o usuário individual (Tech Lead / PM / Dev Sênior)**:
- Chega a uma estimativa defensável em minutos, não horas.
- Tem argumentação pronta para apresentar a stakeholders.
- Aprende e melhora a qualificação de escopo ao longo do tempo.

**Para o comprador do infoproduto**:
- Acesso ao framework documentado (guia público).
- App web completo (5 etapas + Agente).
- Planilha Excel como referência offline e certificação básica.
- Comunidade de prática (Mentoratech).

---

## 2. Estrutura de acesso e o que está em cada camada

```
┌──────────────────────────────────────────────────────────────┐
│  PÚBLICO (sem login)  —  www.stackcalc.com.br               │
│  • Guia do framework (visão geral, princípios, ciclo)        │
│  • Glossário oficial                                         │
│  • Calculadora lite (classificação + horas totais)           │
│  • Simulado mini (poucas questões, resultado imediato)        │
│  • CTA para compra ou comunidade                             │
└──────────────────────────────┬───────────────────────────────┘
                               │ Compra via Hotmart ou
                               │ membro ativo da Mentoratech
┌──────────────────────────────▼───────────────────────────────┐
│  GATED (área logada)  —  app.stackcalc.com.br               │
│  • App completo: 5 etapas + Agente IA                        │
│  • Agente com quota mensal (defesa técnica, mapa de riscos)  │
│  • Downloads: Excel v2.0, templates, guias PDF               │
│  • Trilhas de certificação (conteúdo e checkpoints)          │
│  • Simulado completo (prova oficial com banco de questões)   │
│  • Badges digitais compartilháveis                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Modelos de comercialização (MVP)

### Modelo A — Incluso na compra Hotmart (recomendado para MVP)

| Elemento | Detalhe |
|---------|---------|
| Oferta | Compra única via Hotmart (infoproduto existente) |
| O que inclui | Acesso vitalício ao app gated + quota mensal de Agente |
| Custo de IA | Diluído no preço do produto; quota controlada pelo proxy (ex.: 20 req/mês) |
| Comunicação | "O app web faz parte do produto que você já comprou — acesse aqui." |
| Gatilho de acesso | MVP: lista de e-mails autorizados manualmente; Pós-MVP: webhook Hotmart |

**Vantagem**: zero fricção para quem já comprou; nenhuma nova cobrança.
**Cuidado**: custo de LLM cresce com base de usuários; monitorar no painel do provedor.

### Modelo B — Benefício da comunidade Mentoratech

| Elemento | Detalhe |
|---------|---------|
| Oferta | Assinatura da comunidade Mentoratech inclui acesso ao StackCalc Web |
| O que inclui | App completo + Agente com quota mensal |
| Custo de IA | Incluído no valor da assinatura |
| Comunicação | "Membros da Mentoratech têm acesso ao StackCalc como benefício exclusivo." |
| Gatilho de acesso | Validação de membro ativo (lista gerenciada manualmente no MVP) |

**Vantagem**: aumenta valor percebido da assinatura; incentiva renovação.
**Cuidado**: quota de Agente precisa ser separada por tier (comprador Hotmart vs. membro comunidade).

### Modelo C — Tier pago ad-on (futuro, pós-MVP)

| Elemento | Detalhe |
|---------|---------|
| Oferta | Upgrade pago sobre o produto base |
| O que inclui | Quota maior de Agente, export PDF, histórico na nuvem, acesso para times |
| Custo de IA | Repassado parcialmente ao usuário via assinatura mensal |
| Comunicação | "Precisa de mais análises ou recursos para time? Conheça o plano Pro." |

**Não implementar no MVP** — avaliar após validar demanda com pilotos.

---

## 4. Quota de Agente — estratégia de custo

| Tier | Quota mensal | Modelo LLM sugerido | Custo estimado/usuário/mês |
|------|-------------|--------------------|-----------------------------|
| MVP piloto | 20 req/mês | claude-haiku-4-5 | ~R$ 0,50–2,00 |
| Comprador Hotmart | 20 req/mês | claude-haiku-4-5 | ~R$ 0,50–2,00 |
| Membro comunidade | 10 req/mês | claude-haiku-4-5 | ~R$ 0,25–1,00 |
| Ad-on Pro (futuro) | 100 req/mês | claude-sonnet-4-6 | ~R$ 5,00–20,00 |

> Valores estimados. Verificar preços atuais no painel do provedor LLM e revisar antes de precificar.

**Regra operacional para MVP**: se custo total de LLM ultrapassar R$ 100/mês, revisar quota ou modelo antes de escalar.

---

## 5. Separação de sites e jornada do usuário

```
Descoberta
    │
    ▼
mentoratech.com.br/stackcalc  ←──  Anúncio / indicação / comunidade
(Página de vendas — já existente)
    │
    │  Compra Hotmart
    ▼
www.stackcalc.com.br
(Site do framework — público)
    │  CTA "Acessar o App"
    ▼
app.stackcalc.com.br
(Área logada — calculadora completa + agente)
    │  Upsell / Expansão
    ▼
Trilhas → Certificação → Badge compartilhável
```

---

## 6. O Excel no ecossistema

O arquivo `StackCalc_v2_0.xlsx` **não é substituído** pelo app web no MVP. Ele é:

1. **Asset offline**: para usuários que preferem trabalhar sem internet.
2. **Fonte de verdade de paridade**: referência para os testes da calculadora web.
3. **Entregável de certificação básica**: incluído nos Downloads da área logada.
4. **Prova de valor percebido**: usuário compra e recebe algo tangível imediatamente.

Comunicação recomendada: "O app web é a forma mais rápida de usar o StackCalc. O Excel continua disponível nos Downloads para quem preferir."

---

## 7. Roadmap comercial pós-piloto

| Marco | Gatilho | Ação |
|-------|---------|------|
| 10 pilotos completaram o fluxo | NPS coletado | Abrir inscrições para próximo ciclo |
| 50 usuários ativos | Custo LLM validado | Implementar webhook Hotmart (automação de acesso) |
| 100 usuários ativos | Demanda por times | Avaliar Modelo C (tier Pro) |
| Trilha A finalizada | Conteúdo pronto | Lançar simulado oficial + badge |

---

## 8. Mensagens-chave por audiência

### Para quem comprou via Hotmart

> "O StackCalc web é o app que complementa o que você já tem. Sem nova cobrança — acesse com o e-mail da sua compra."

### Para membros da Mentoratech

> "Seu acesso ao StackCalc está incluso na comunidade. Use para estimar seus projetos e compartilhar os resultados."

### Para visitantes do site público

> "Entenda o framework gratuitamente. Quando quiser a calculadora completa e o Agente, acesse a área de membros."

### Para líderes técnicos (Tech Lead / Arquiteto)

> "Pare de defender estimativas no achismo. O StackCalc estrutura o processo e o Agente gera a argumentação por você."
