# ADR-001 — Proxy Serverless vs. Chave LLM no Browser

**Status**: Aceito
**Data**: 2026-03-30
**Decisores**: Time StackCalc / Mentoratech
**Contexto relacionado**: [system-overview.md](../architecture/system-overview.md)

---

## Contexto

O Agente StackCalc precisa chamar uma API de LLM (ex.: Anthropic Claude, OpenAI) para gerar defesas técnicas e mapas de riscos a partir dos dados de estimativa do usuário.

Existem duas formas de fazer essa chamada a partir de uma SPA estática:

1. **Chave no browser (client-side)**: a chave de API é embutida no JavaScript ou retornada diretamente ao browser; o browser chama o LLM diretamente.
2. **Proxy serverless**: uma função de backend intermedidia a chamada; a chave fica apenas em variáveis de ambiente do servidor; o browser nunca vê a chave permanente.

---

## Decisão

**Usar proxy serverless para produção e para qualquer acesso de usuário externo.**

A chave de API do LLM **nunca** deve ser exposta no JavaScript servido ao browser.

---

## Consequências

### Positivas

- **Segurança**: a chave não aparece em DevTools, não é indexada, não vaza em repositórios acidentais.
- **Rate limit centralizado**: o proxy é o único ponto para aplicar quota por usuário — sem depender de lógica no browser (que pode ser contornada).
- **Controle de custo**: requisições passam por um ponto único de logging e contagem.
- **Flexibilidade de modelo**: trocar o modelo LLM ou o provedor é feito no proxy, sem redesploy do front.
- **Sanitização de payload**: o proxy pode truncar contexto, remover dados sensíveis e validar formato antes de chamar o LLM.

### Negativas / Custos

- **Infraestrutura adicional**: exige criar e manter uma função serverless além do front estático.
- **Latência marginal**: +10–50 ms do hop extra (aceitável para geração de texto que já leva segundos).
- **Cold start**: funções serverless têm cold start em provedores como Vercel/Netlify (~100–300 ms na primeira req); mitigável com Cloudflare Workers (edge, sem cold start).

---

## Alternativas consideradas

### Alternativa A — Chave no browser (rejeitada para produção)

- **Prós**: zero infraestrutura extra; mais simples para protótipos internos.
- **Contras**: qualquer usuário com DevTools extrai a chave; abuso de quota impossível de controlar; viola termos de uso da maioria dos provedores LLM para chaves de produção.
- **Decisão**: aceitável **somente para testes locais do desenvolvedor**, nunca em produção.

### Alternativa B — BFF dedicado (backend-for-frontend) em servidor próprio

- **Prós**: mais controle, sessão persistente.
- **Contras**: custo e complexidade muito maiores para MVP; servidores 24/7 vs. funções invocadas sob demanda.
- **Decisão**: fora do escopo MVP; considerar se o produto escalar além de ~500 usuários ativos.

### Alternativa C — Proxy serverless (escolhida)

- Vercel Functions, Netlify Functions ou Cloudflare Workers.
- Todos suportam variáveis de ambiente seguras, edge runtime e escalabilidade zero-to-N.

---

## Implementação mínima do proxy

```javascript
// Exemplo: Cloudflare Worker (pseudo-código)
export default {
  async fetch(request, env) {
    // 1. Verificar token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!isValidToken(token, env.TOKEN_SECRET)) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. Rate limit (usando KV do Cloudflare)
    const userId = extractUserId(token);
    if (await isOverLimit(userId, env.KV, env.RATE_LIMIT_RPM)) {
      return new Response('Too Many Requests', { status: 429 });
    }

    // 3. Montar prompt no servidor
    const body = await request.json();
    const prompt = buildPrompt(body); // sanitiza e formata

    // 4. Chamar LLM com chave de env (nunca exposta ao cliente)
    const response = await callLLM(prompt, env.LLM_API_KEY, env.LLM_MODEL);

    return Response.json({ texto: response.text });
  }
};
```

---

## Revisão

Esta ADR deve ser revisada se:
- O volume de usuários exigir sessões persistentes (considerar BFF dedicado).
- O provedor LLM oferecer mecanismo de chave restrita por domínio/usuário que elimine o risco de abuso.
- A complexidade do proxy crescer a ponto de justificar um serviço separado.
