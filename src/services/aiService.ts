interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export interface InsightData {
  feasibility: {
    status: "viable" | "needs_adjustment" | "unfeasible";
    content: string;
  };
  diagnosis: {
    content: string;
  };
  suggestions: {
    items: string[];
  };
  extraIncome: {
    items: string[];
  };
  investment: {
    items: string[];
  };
  motivation: {
    content: string;
  };
}

const API_KEY = String(import.meta.env.VITE_GEMINI_API_KEY);
const MODEL_NAME = "gemini-flash-latest";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const callGeminiAPI = async (prompt: string) => {
  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return (await response.json()) as GeminiResponse;
};

export const getInsight = async (prompt: string) => {
  const response = await callGeminiAPI(prompt);
  const json = response.candidates[0].content.parts[0].text;
  return JSON.parse(json) as InsightData;
};

import type { ChatMessage, SimulationRecord } from "../data/simulation";

export async function askEducator(
  question: string,
  simulation: SimulationRecord,
  insight: InsightData | null,
  history: ChatMessage[],
): Promise<string> {
  const conversation = history
    .slice(-12)
    .map(
      (message) =>
        `${message.role === "user" ? "Usuário" : "Educador Financeiro"}: ${message.content}`,
    )
    .join("\n");

  const prompt = `Você é o Educador Financeiro do aplicativo Planej.ai.
Responda em português do Brasil, de forma clara, acolhedora, objetiva e prática.
O usuário está perguntando sobre a simulação financeira abaixo. Use os dados da simulação e, quando relevante, o diagnóstico já gerado.
Não invente dados que não estejam disponíveis. Se faltar informação, diga isso e peça o dado necessário.
Não use markdown pesado; prefira parágrafos curtos e listas simples quando ajudarem.
Nunca diga que você é uma pessoa real. Não dê recomendações ilegais ou imprudentes.
A resposta será exibida diretamente em um balão de conversa.

DADOS DA SIMULAÇÃO:
- Renda mensal: ${simulation.income}
- Custos fixos: ${simulation.expenses}
- Dívidas/parcelas: ${simulation.debts}
- Meta: ${simulation.goalName}
- Valor da meta: ${simulation.goalAmount}
- Prazo: ${simulation.goalDeadline} meses

DIAGNÓSTICO ORIGINAL:
${insight ? JSON.stringify(insight) : "Ainda não disponível."}

HISTÓRICO RECENTE:
${conversation || "Nenhuma pergunta anterior."}

NOVA PERGUNTA DO USUÁRIO:
${question}

Responda somente com a resposta ao usuário, sem prefixos como "Educador Financeiro:" e sem JSON.`;

  const response = await callGeminiAPI(prompt);
  const content = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("A IA não retornou uma resposta.");
  }

  return content.trim();
}
