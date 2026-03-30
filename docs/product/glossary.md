# Glossário Oficial — StackCalc Framework

**Versão**: 0.1
**Última atualização**: 2026-03-30
**Fonte de verdade**: este arquivo. Qualquer uso do termo em documentação, UI ou copy deve ser consistente com as definições abaixo.

---

## Framework

### StackCalc Framework

Metodologia de estimativa e dimensionamento de projetos de software estruturada em 5 etapas sequenciais (Escopo → Estimativa → Calculadora → Validador → Agente). Não é uma ferramenta de gestão de projetos nem um substituto de metodologias ágeis — é um **pré-requisito de estimativa** antes de iniciar qualquer metodologia.

### Ciclo StackCalc

As 4 fases do processo de estimativa dentro do framework:
1. **Qualificar** — entender e pontuar a prontidão do escopo.
2. **Classificar** — determinar o nível de complexidade do projeto.
3. **Calcular** — dimensionar esforço por papel e distribuir no tempo.
4. **Validar** — checar consistência interna e riscos antes de apresentar.

---

## Etapas da Calculadora (abas)

### Escopo

Primeira etapa. Conjunto de perguntas de qualificação que resultam em um **score de prontidão de escopo** (0–100). Determina se o projeto está maduro o suficiente para ser estimado com confiança.

### Score de Prontidão de Escopo

Número de 0 a 100 calculado a partir das respostas de qualificação. Interpretação:

| Faixa | Rótulo | Significado |
|-------|--------|-------------|
| 80–100 | Verde | Escopo suficientemente maduro para estimar |
| 50–79 | Amarelo | Estimativa possível, mas com incerteza relevante |
| 0–49 | Vermelho | Escopo imaturo; estimar agora gera retrabalho |

### Estimativa

Segunda etapa. O usuário seleciona a **classificação de complexidade** do projeto. Todas as fórmulas das etapas seguintes derivam dessa classificação.

### Classificação de Complexidade

Categoria que resume o nível de esforço de um projeto. Valores definidos na planilha StackCalc v2.0:

| Classificação | Descrição resumida |
|--------------|-------------------|
| Simples | Projetos de baixa complexidade técnica e poucos stakeholders |
| Médio | Complexidade moderada, integrações limitadas |
| Grande | Alta complexidade, múltiplas integrações ou equipes |
| Muito Grande | Transformação digital, sistemas críticos ou legado complexo |

> **Nota para implementação**: os nomes e critérios exatos de cada nível devem ser extraídos da planilha `StackCalc_v2_0.xlsx` e registrados em `docs/qa/test-plan.md` como valores de referência.

### Calculadora

Terceira etapa. Calcula a distribuição de horas por papel (Desenvolvimento, Documentação, Gestão + Contingência) e o **total de horas** do projeto, com base na classificação selecionada.

### Horas de Desenvolvimento (Dev)

Horas estimadas para atividades de implementação técnica (código, configuração, testes unitários).

### Horas de Documentação (Doc)

Horas estimadas para produção de artefatos documentais (especificação, manual, relatórios).

### Horas de Gestão + Contingência

Soma de horas de coordenação de projeto e buffer de risco. Calculadas como percentual das horas de Dev+Doc (percentual definido na planilha v2.0).

### Horas Totais

`Horas Dev + Horas Doc + Horas Gestão+Contingência`. Métrica principal para orçamento e prazo.

### Validador

Quarta etapa. Checklist de riscos e consistência interna. O usuário marca os riscos identificados. A contagem de riscos marcados é exibida no painel de resumo.

### Agente

Quinta etapa. Interface de IA que, a partir dos dados preenchidos nas etapas anteriores, gera:
- **Defesa técnica**: argumentação estruturada para justificar a estimativa.
- **Mapa de riscos**: análise dos principais riscos com base no checklist preenchido.

---

## Infraestrutura e Segurança

### Proxy Serverless (Function Proxy)

Função de backend (ex.: Cloudflare Worker, Vercel Function) que intermedida as chamadas do browser ao LLM. Responsabilidades:
- Injetar a chave de API do LLM (nunca exposta ao browser).
- Validar o token de sessão do usuário.
- Aplicar rate limit.
- Truncar ou sanitizar o payload antes de enviar ao LLM.

### Token de Sessão

Credencial de curta duração (ex.: JWT assinado com `TOKEN_SECRET`) emitida após autenticação do usuário. Enviada pelo browser para o proxy a cada requisição ao Agente.

### Rate Limit

Limite máximo de requisições ao Agente por usuário por unidade de tempo (ex.: 20 req/mês). Definido pela variável `RATE_LIMIT_RPM` no ambiente do proxy.

---

## Produto e Comercial

### StackCalc Web (App)

Aplicação web (`app.stackcalc.com.br`) com as 5 etapas completas + Agente. Acesso gated — requer compra via Hotmart ou vínculo com comunidade Mentoratech.

### StackCalc Lite (Público)

Versão reduzida da calculadora acessível sem login: apenas classificação de complexidade + horas totais (sem distribuição, sem sprints, sem validador, sem agente). Disponível em `www.stackcalc.com.br`.

### Área Logada

Seção do app acessível somente a usuários com token válido. Contém: app completo, downloads (Excel, templates, guias), trilhas de certificação, histórico.

### Hotmart

Plataforma de pagamento e entrega do infoproduto StackCalc. O acesso à área logada é liberado após confirmação de compra via Hotmart.

### Comunidade Mentoratech

Ecossistema de formação e prática profissional mantido pela Mentoratech. Membros da comunidade podem ter acesso ao StackCalc Web como benefício.

### Quota de Agente

Número máximo de requisições ao Agente que um usuário pode fazer por período (ex.: mês). Controlado pelo proxy serverless. Pode ser diferente por tier de acesso.

---

## Certificação

### Trilha StackCalc

Sequência de módulos de aprendizado que leva à certificação. Mínimo: Trilha A (Escopo / qualificação da demanda). Demais trilhas (B, C, D, E, F) a definir no próximo refinamento do plano.

### Simulado

Conjunto de questões de múltipla escolha sobre o framework StackCalc. Versão pública: mini simulado (poucas questões, resultado imediato). Versão completa (gated): prova oficial com banco de questões.

### Badge

Selo digital compartilhável emitido ao concluir uma trilha ou aprovação no simulado oficial. Página pública via link sem expor dados sensíveis do usuário.

### Certificação StackCalc

Reconhecimento formal de domínio do framework StackCalc. Requer: completar trilhas obrigatórias + aprovação no simulado oficial.

---

## Termos a evitar (anti-glossário)

| Termo a evitar | Use em vez disso |
|---------------|-----------------|
| "Calculadora de preço" | Calculadora de esforço / horas |
| "Garantia de estimativa" | Estimativa baseada em framework |
| "Substitui o PM" | Apoia o PM na qualificação e defesa |
| "IA decide a complexidade" | IA apoia a análise; classificação é do usuário |
