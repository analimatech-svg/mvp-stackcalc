# Especificação UX/UI — StackCalc MVP

**Versão**: 0.1
**Data**: 2026-03-30
**Alinhamento**: funil da landing page Mentoratech + 5 abas da calculadora

---

## 1. Princípios de design

1. **Clareza primeiro**: o usuário vê os 3 números que a liderança pergunta (prontidão de escopo, classificação, horas totais) sem precisar rolar.
2. **Progresso visível**: cada aba é uma etapa; o usuário sabe onde está e o que falta.
3. **Fricção mínima**: campos essenciais no topo; campos avançados colapsáveis ou na segunda metade.
4. **Tom profissional e direto**: sem jargão excessivo; mensagens de estado em português claro.
5. **Feedback imediato**: cálculos atualizam em tempo real conforme o usuário preenche.

---

## 2. Estrutura de navegação

```
┌─────────────────────────────────────────────────────────────┐
│  StackCalc                             [Resumo rápido ▾]    │
│  [Escopo] [Estimativa] [Calculadora] [Validador] [Agente]   │
└─────────────────────────────────────────────────────────────┘
```

### Painel de Resumo Rápido (sempre visível, colapsável)

```
┌────────────────────────────────────────────────┐
│  Prontidão de Escopo    Classificação    Total  │
│       72 / 100            Médio        320 h   │
│      [Amarelo]          [●●●○○]       (~40 dias)│
└────────────────────────────────────────────────┘
```

- Atualiza em tempo real ao preencher qualquer aba.
- Visível em todas as abas (sticky no topo ou painel lateral em telas largas).
- Em mobile: colapsável com toggle.

---

## 3. Fluxo principal (happy path)

```
[Entrada] Usuário acessa o app (logado via token)
    │
    ▼
[Aba 1 — Escopo]
  Preenche checklist de qualificação
  → Score calculado em tempo real
  → Rótulo (Verde/Amarelo/Vermelho) exibido
    │
    ▼
[Aba 2 — Estimativa]
  Seleciona classificação de complexidade
  → Descrição do nível aparece como tooltip
    │
    ▼
[Aba 3 — Calculadora]
  Visualiza distribuição de horas por papel
  → Edita percentuais se necessário (campos opcionais)
  → Painel de resumo atualizado
    │
    ▼
[Aba 4 — Validador]
  Marca riscos identificados
  → Contador de riscos atualiza
  → Alertas de inconsistência se houver
    │
    ▼
[Aba 5 — Agente]
  Escolhe tipo de análise (Defesa técnica / Mapa de riscos)
  → Clica "Gerar"
  → Aguarda resposta (estado: gerando)
  → Lê análise; pode copiar ou exportar
```

---

## 4. Especificação de cada aba

### 4.1 Aba: Escopo

**Objetivo**: qualificar o escopo e calcular prontidão.

**Wireframe (texto)**:

```
ESCOPO — Qualificação da Demanda
────────────────────────────────

[Checklist de perguntas de qualificação]

  □ Objetivos de negócio documentados?       [Sim / Não / Parcial]
  □ Stakeholders identificados?              [Sim / Não / Parcial]
  □ Restrições técnicas mapeadas?            [Sim / Não / Parcial]
  □ Critérios de aceite definidos?           [Sim / Não / Parcial]
  □ Dependências externas identificadas?     [Sim / Não / Parcial]
  □ Prazo tem margem para estimativa?        [Sim / Não / Parcial]
  ... (demais perguntas da planilha v2.0)

────────────────────────────────
  Score de Prontidão: 72 / 100   [● Amarelo — estimativa possível com incerteza]

  ⓘ "Estimativa com incerteza relevante. Recomendamos alinhar os pontos
     em Parcial antes de apresentar aos stakeholders."
────────────────────────────────
```

**Estados**:
- **Vazio**: nenhum item respondido; score = 0; rótulo "Responda as perguntas para calcular".
- **Parcial**: alguns itens respondidos; score proporcional; rótulo dinâmico.
- **Completo**: todos respondidos; score final; rótulo colorido.

**Tom do rótulo por faixa**:
- Verde (80–100): "Escopo maduro. Prossiga com confiança."
- Amarelo (50–79): "Estimativa possível, mas com incerteza. Alinhe os pontos em aberto."
- Vermelho (0–49): "Escopo imaturo. Estimar agora pode gerar retrabalho significativo."

> Nota: texto final do tier vermelho deve ser extraído da planilha `StackCalc_v2_0.xlsx` para garantir paridade.

---

### 4.2 Aba: Estimativa

**Objetivo**: classificar a complexidade do projeto.

**Wireframe**:

```
ESTIMATIVA — Classificação de Complexidade
───────────────────────────────────────────

  Qual é o nível de complexidade deste projeto?

  ○ Simples      — [descrição resumida]
  ○ Médio        — [descrição resumida]    ◄ selecionado
  ○ Grande       — [descrição resumida]
  ○ Muito Grande — [descrição resumida]

  ────────────────────────────────────────
  ℹ  Critérios de classificação:
  [ tabela com critérios da planilha v2.0 ]
  ────────────────────────────────────────

  [Ajuda: Como escolher?] ▾
```

**Estados**:
- **Não selecionado**: aviso suave; demais abas mostram "—" no lugar das horas.
- **Selecionado**: classificação salva; Calculadora e Agente desbloqueados.

---

### 4.3 Aba: Calculadora

**Objetivo**: visualizar e ajustar a distribuição de horas.

**Wireframe**:

```
CALCULADORA — Distribuição de Esforço
──────────────────────────────────────

  Complexidade selecionada: Médio

  ┌──────────────────────────────────────────┐
  │ Papel              Horas      % do total │
  │ Desenvolvimento    200 h        62,5 %   │
  │ Documentação        48 h        15,0 %   │
  │ Gestão + Conting.   72 h        22,5 %   │
  │ ─────────────────────────────────────── │
  │ TOTAL              320 h       100,0 %   │
  └──────────────────────────────────────────┘

  Duração estimada: ~40 dias úteis (1 pessoa em tempo integral)

  [Ajustes avançados ▾]
    Percentual de contingência: [15%  ▲▼]
    Fator de equipe:            [1,0x ▲▼]
```

**Estados**:
- **Sem classificação**: exibe "Selecione a complexidade na aba Estimativa".
- **Com classificação**: valores calculados automaticamente.
- **Ajustado**: campos avançados editados; indicador visual "personalizado" próximo ao total.

---

### 4.4 Aba: Validador

**Objetivo**: checar riscos e consistência antes de apresentar.

**Wireframe**:

```
VALIDADOR — Checklist de Riscos
────────────────────────────────

  Marque os riscos identificados neste projeto:

  □ Dependências externas não confirmadas
  □ Prazo definido antes da estimativa
  □ Equipe com conhecimento parcial da tecnologia
  □ Requisitos sujeitos a mudança frequente
  □ Integrações com sistemas legados
  □ Stakeholders com visões divergentes
  □ Ausência de ambiente de teste
  ... (demais riscos da planilha v2.0)

  ────────────────────────────────
  Riscos marcados: 3 / 8   [● Atenção]

  ⚠ "3 riscos identificados. Inclua a análise de riscos na defesa técnica."
  ────────────────────────────────
```

**Estados**:
- **Nenhum risco marcado**: "Nenhum risco identificado. O Agente pode gerar análise mesmo assim."
- **1–3 riscos**: "Atenção — revise os riscos antes de apresentar."
- **4+ riscos**: "Alto risco — recomendamos mitigações explícitas na proposta."

---

### 4.5 Aba: Agente

**Objetivo**: gerar análise textual com IA a partir dos dados preenchidos.

**Wireframe**:

```
AGENTE StackCalc
─────────────────────────────────────────

  Dados da sessão:
  ┌─────────────────────────────────────┐
  │ Escopo: 72 / 100 (Amarelo)          │
  │ Classificação: Médio                │
  │ Total: 320 h  |  Riscos: 3          │
  └─────────────────────────────────────┘

  Tipo de análise:
  ● Defesa técnica    ○ Mapa de riscos

  Contexto adicional (opcional, máx. 500 caracteres):
  ┌─────────────────────────────────────┐
  │                                     │
  └─────────────────────────────────────┘
  [Caracteres restantes: 500]

  [Gerar análise]

  ──────────────────────────────────────
  [área de resultado]
```

**Estados do painel de resultado**:

```
Estado: VAZIO
─────────────────
  Preencha as etapas anteriores e clique em "Gerar análise".

Estado: GERANDO
─────────────────
  ⟳  Gerando análise...
  (spinner animado)
  Tempo estimado: 10–30 segundos

Estado: PRONTO
─────────────────
  ✓  Análise gerada

  [texto da análise]

  [Copiar texto]  [Nova análise]
  Gerado em: 14s  |  Modelo: claude-haiku-...

Estado: ERRO — timeout
─────────────────
  ✕  Tempo esgotado ao gerar análise.
  Verifique sua conexão e tente novamente.
  [Tentar novamente]

Estado: ERRO — 429 (quota esgotada)
─────────────────
  ✕  Você atingiu o limite de análises deste mês.
  Sua quota renova em: 15 dias.
  [Fale com o suporte]

Estado: ERRO — 401 (token inválido)
─────────────────
  ✕  Sessão expirada ou acesso não autorizado.
  [Fazer login novamente]
```

---

## 5. Design system — tokens

Baseado nos tokens já presentes em `styles.css` (`:root`). Padrões a garantir:

| Token | Uso |
|-------|-----|
| `--color-bg` | Fundo principal (escuro) |
| `--color-surface` | Fundo de cards e painéis |
| `--color-primary` | Ações principais (botões CTA) |
| `--color-success` | Verde — score alto / sem risco |
| `--color-warning` | Amarelo — score médio / atenção |
| `--color-danger` | Vermelho — score baixo / erro |
| `--color-text` | Texto principal (contraste ≥ 4,5:1 vs `--color-bg`) |
| `--color-text-muted` | Labels secundários |
| `--font-body` | Tipografia base |
| `--font-mono` | Números e valores calculados |
| `--radius` | Border-radius padrão de cards |
| `--space-*` | Escala de espaçamento (4, 8, 16, 24, 32 px) |

---

## 6. Acessibilidade — requisitos do MVP

- **Contraste mínimo**: 4,5:1 para texto normal; 3:1 para texto grande (WCAG AA).
- **Foco visível**: todos os inputs, botões e links com `outline` visível no foco via teclado.
- **Labels nos inputs**: todo `<input>` e `<select>` com `<label>` associado ou `aria-label`.
- **Estado dos campos de IA**: `aria-live="polite"` no painel de resultado do Agente para anunciar conclusão/erro.
- **Navegação por teclado**: abas acessíveis via `Tab`; ativação via `Enter`/`Space`.

---

## 7. Tom de voz

| Contexto | Tom | Exemplo |
|---------|-----|---------|
| Instruções | Direto, ativo | "Selecione a complexidade do projeto." |
| Resultados positivos | Encorajador, profissional | "Escopo maduro. Prossiga com confiança." |
| Alertas | Claro, sem alarme | "3 riscos identificados. Inclua a análise na defesa." |
| Erros | Direto, com próximo passo | "Sessão expirada. Faça login novamente." |
| IA gerando | Neutro, sem expectativas | "Gerando análise..." |
| Ajuda | Amigável, consultivo | "Como escolher a classificação?" |

**Evitar**:
- Jargão técnico sem explicação.
- Mensagens de erro genéricas ("Erro desconhecido").
- Exclamações excessivas.
- Referências a "inteligência artificial" ou "IA" no meio de fluxos críticos (normalizar como "Agente").

---

## 8. Checklist "Comece aqui" (primeira visita)

Exibido como modal ou banner na primeira vez que o usuário acessa:

```
Bem-vindo ao StackCalc!

Siga as 5 etapas para estimar seu projeto:

  1. Escopo     → Qualifique o que será feito
  2. Estimativa → Classifique a complexidade
  3. Calculadora→ Veja a distribuição de horas
  4. Validador  → Identifique os riscos
  5. Agente     → Gere a defesa técnica

[Começar]   [Ver tutorial]
```

- Exibido apenas uma vez (flag em `localStorage`).
- Botão "Começar" fecha o modal e foca na Aba 1.
