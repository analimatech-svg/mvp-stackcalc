# Plano de Testes — StackCalc MVP

**Versão**: 0.1
**Data**: 2026-03-30
**Referência de paridade**: StackCalc v2.0 (planilha `references/StackCalc_v2_0.xlsx`)

> **Importante**: as tabelas de valores "ouro" (seção 2) estão com placeholders. Preencher após carregar a planilha `StackCalc_v2_0.xlsx` na pasta `references/` do repositório.

---

## 1. Critério de "pronto para pilotos"

Todos os casos marcados **P0** devem passar antes de liberar para pilotos externos.

| Categoria | Quantidade de casos P0 | Status |
|-----------|----------------------|--------|
| Paridade de cálculo | 4 (um por nível) | Pendente — aguarda planilha |
| Score de prontidão | 3 (Verde/Amarelo/Vermelho) | Pendente |
| Agente — autorização | 2 | Pendente |
| Agente — happy path | 1 | Pendente |
| Agente — erros | 3 | Pendente |

---

## 2. Casos de paridade — Calculadora vs. Planilha v2.0

### 2.1 Como extrair os valores "ouro"

1. Abrir `references/StackCalc_v2_0.xlsx`.
2. Para cada nível de complexidade, preencher os valores padrão (sem ajuste de percentuais).
3. Registrar os totais nas tabelas abaixo.
4. Esses valores são os **gabaritos** dos testes automatizados.

### 2.2 Tabela de valores de referência

> **TODO**: preencher após carregar a planilha.

| Classificação | Horas Dev | Horas Doc | Horas Gestão+Conting. | Horas Total | Dias úteis |
|--------------|-----------|-----------|----------------------|-------------|-----------|
| Simples      | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ |
| Médio        | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ |
| Grande       | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ |
| Muito Grande | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ | _PREENCHER_ |

### 2.3 Critério de aceite de paridade

- Desvio aceitável: **≤ 5%** em Horas Total por nível.
- Desvio aceitável por papel: **≤ 10%** (Horas Dev, Horas Doc, Horas Gestão+Conting.).
- Tolerância zero para sinal trocado (ex.: total menor que Dev+Doc).

### 2.4 Casos de teste P0

#### TC-PAR-01 — Paridade Simples

```
Entrada:
  classificacao = "Simples"
  percentuais padrão (sem ajuste)

Esperado (preencher com valores da planilha):
  horasDev          = _PREENCHER_
  horasDoc          = _PREENCHER_
  horasGestao       = _PREENCHER_
  horasTotal        = _PREENCHER_
  horasTotal >= horasDev + horasDoc  → true

Critério: desvio ≤ 5% em horasTotal
```

#### TC-PAR-02 — Paridade Médio

```
Entrada:
  classificacao = "Médio"
  percentuais padrão

Esperado: _PREENCHER_ (idem estrutura acima)
```

#### TC-PAR-03 — Paridade Grande

```
Entrada:
  classificacao = "Grande"
  percentuais padrão

Esperado: _PREENCHER_
```

#### TC-PAR-04 — Paridade Muito Grande

```
Entrada:
  classificacao = "Muito Grande"
  percentuais padrão

Esperado: _PREENCHER_
```

---

## 3. Casos de teste — Score de Prontidão de Escopo

### 3.1 Referência de faixas

| Faixa | Rótulo | Texto exibido |
|-------|--------|--------------|
| 80–100 | Verde | "Escopo maduro. Prossiga com confiança." |
| 50–79 | Amarelo | "Estimativa possível, mas com incerteza. Alinhe os pontos em aberto." |
| 0–49 | Vermelho | _PREENCHER com texto exato da planilha v2.0_ |

#### TC-ESC-01 — Score Verde

```
Entrada: respostas que resultam em score ≥ 80
Esperado:
  scoreEscopo ≥ 80
  rotulo = "Verde"
  texto = "Escopo maduro. Prossiga com confiança."
```

#### TC-ESC-02 — Score Amarelo

```
Entrada: respostas que resultam em score entre 50 e 79
Esperado:
  50 ≤ scoreEscopo ≤ 79
  rotulo = "Amarelo"
```

#### TC-ESC-03 — Score Vermelho

```
Entrada: respostas que resultam em score ≤ 49
Esperado:
  scoreEscopo ≤ 49
  rotulo = "Vermelho"
  texto = _PREENCHER com texto exato da planilha_
```

---

## 4. Casos de teste — Limites e invariantes

#### TC-LIM-01 — Percentual fora do intervalo

```
Entrada: percentualContingencia = 150
Esperado: campo não aceita valor > 100; erro de validação exibido
```

#### TC-LIM-02 — Contingência dentro da faixa esperada

```
Entrada: classificacao = "Médio"; percentualContingencia = 15 (padrão)
Esperado: horasGestao ≥ 0 AND horasGestao ≤ horasTotal
```

#### TC-LIM-03 — Total sempre >= soma Dev+Doc

```
Para qualquer classificação e percentuais válidos:
  horasTotal >= horasDev + horasDoc → true
```

#### TC-LIM-04 — Sem classificação selecionada

```
Entrada: nenhuma classificação selecionada
Esperado:
  horasTotal = null ou "—"
  Calculadora exibe "Selecione a complexidade na aba Estimativa"
  Agente desabilitado (botão "Gerar" inativo)
```

---

## 5. Casos de teste — Agente IA (proxy serverless)

### 5.1 Happy path

#### TC-AGT-01 — Geração de defesa técnica

```
Pré-condição:
  - Usuário com token válido e quota disponível
  - classificacao = "Médio"; scoreEscopo = 72; horasTotal = 320; riscos = ["Prazo agressivo"]

Ação: selecionar "Defesa técnica" → clicar "Gerar"

Esperado:
  - Estado muda para "gerando"
  - Resposta chega em ≤ 60s
  - Texto da análise não vazio (≥ 50 chars)
  - Estado muda para "pronto"
  - Botão "Copiar texto" habilitado
```

### 5.2 Erros

#### TC-AGT-02 — Token ausente (sem Authorization header)

```
Ação: POST /agent sem header Authorization

Esperado:
  - Proxy retorna 401
  - SPA exibe estado de erro "Sessão expirada. Faça login novamente."
```

#### TC-AGT-03 — Token expirado

```
Ação: POST /agent com JWT expirado (exp < now)

Esperado:
  - Proxy retorna 401
  - SPA exibe estado de erro de sessão
```

#### TC-AGT-04 — Quota esgotada (429)

```
Pré-condição: usuário atingiu RATE_LIMIT_RPM requisições no mês

Esperado:
  - Proxy retorna 429
  - SPA exibe "Você atingiu o limite de análises deste mês."
  - Data de renovação exibida
```

#### TC-AGT-05 — Timeout (LLM não responde em 60s)

```
Simulação: proxy aguarda mais de 60s sem resposta do LLM

Esperado:
  - SPA exibe "Tempo esgotado ao gerar análise."
  - Botão "Tentar novamente" habilitado
```

#### TC-AGT-06 — Resposta vazia do LLM

```
Simulação: LLM retorna texto vazio ou nulo

Esperado:
  - SPA não exibe tela em branco
  - Exibe mensagem "Análise não disponível. Tente novamente."
```

### 5.3 Segurança

#### TC-AGT-07 — Payload mínimo (sem PII)

```
Verificação: inspecionar requisição enviada do proxy ao LLM

Esperado:
  - Payload NÃO contém: nome, e-mail, token JWT, dados de pagamento
  - Payload contém apenas: classificacao, scoreEscopo, horasTotal, riscosChecados, contextoAdicional (truncado)
```

#### TC-AGT-08 — contextoAdicional truncado

```
Entrada: contextoAdicional com 1000 caracteres

Esperado:
  - Proxy envia ao LLM no máximo 500 caracteres
  - SPA exibe contador de caracteres restantes
```

---

## 6. Casos de teste — Validador

#### TC-VAL-01 — Nenhum risco marcado

```
Entrada: nenhum checkbox marcado no Validador

Esperado:
  - contador = "0 riscos identificados"
  - Agente pode ser usado normalmente
  - Nenhum alerta exibido
```

#### TC-VAL-02 — Múltiplos riscos marcados

```
Entrada: 4 ou mais checkboxes marcados

Esperado:
  - contador = "4 riscos identificados"
  - Alerta de alto risco exibido
  - Dados dos riscos refletem no payload do Agente
```

---

## 7. Evidências de teste

Para cada ciclo de validação com pilotos, registrar:

| Caso | Data | Executado por | Resultado | Observação |
|------|------|--------------|-----------|------------|
| TC-PAR-01 | | | | |
| TC-PAR-02 | | | | |
| TC-PAR-03 | | | | |
| TC-PAR-04 | | | | |
| TC-ESC-01 | | | | |
| TC-ESC-02 | | | | |
| TC-ESC-03 | | | | |
| TC-LIM-01 | | | | |
| TC-LIM-02 | | | | |
| TC-LIM-03 | | | | |
| TC-LIM-04 | | | | |
| TC-AGT-01 | | | | |
| TC-AGT-02 | | | | |
| TC-AGT-03 | | | | |
| TC-AGT-04 | | | | |
| TC-AGT-05 | | | | |
| TC-AGT-06 | | | | |
| TC-AGT-07 | | | | |
| TC-AGT-08 | | | | |
| TC-VAL-01 | | | | |
| TC-VAL-02 | | | | |

---

## 8. Próximos passos para completar este plano

1. Carregar `StackCalc_v2_0.xlsx` em `references/`.
2. Extrair valores de paridade e preencher seção 2.2.
3. Extrair texto exato do tier vermelho de escopo e preencher TC-ESC-03.
4. Implementar testes automatizados para TC-PAR-* e TC-LIM-* em `tests/` (Vitest ou Jest, sem build step extra).
5. Executar TC-AGT-* em ambiente de staging com proxy real.
