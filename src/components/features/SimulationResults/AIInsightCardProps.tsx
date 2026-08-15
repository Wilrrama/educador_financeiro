import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";
import { Send, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useInsight } from "../../../hooks/useInsight";
import { Content } from "../Insights/Content";
import { Error } from "../Insights/Error";
import { Button } from "../../shared/Button";
import { useSimulationStorage } from "../../../hooks/useSimulationStorage";
import { askEducator } from "../../../services/aiService";
import type { ChatMessage } from "../../../data/simulation";

interface AIInsightCardProps {
  simulationId: string;
}

export function AIInsightsCard({ simulationId }: AIInsightCardProps) {
  const { insight, isLoading, error, fetchInsight } = useInsight(simulationId);
  const { getFormData, updateSimulation } = useSimulationStorage();
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    return getFormData(simulationId)?.chatHistory ?? [];
  });
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [chatHistory, isChatLoading]);

  const handleAsk = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isChatLoading) return;

    const simulation = getFormData(simulationId);
    if (!simulation) {
      setChatError("Simulação não encontrada.");
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedQuestion,
      createdAt: new Date().toISOString(),
    };

    const historyWithQuestion = [...chatHistory, userMessage];
    setChatHistory(historyWithQuestion);
    setQuestion("");
    setChatError(null);
    setIsChatLoading(true);

    // Persiste a pergunta imediatamente para que o histórico não seja perdido
    // mesmo se a resposta da IA falhar.
    updateSimulation(simulationId, {
      ...simulation,
      chatHistory: historyWithQuestion,
    });

    try {
      const answer = await askEducator(
        trimmedQuestion,
        simulation,
        insight,
        historyWithQuestion,
      );

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        createdAt: new Date().toISOString(),
      };

      const updatedHistory = [...historyWithQuestion, assistantMessage];
      setChatHistory(updatedHistory);
      updateSimulation(simulationId, {
        ...simulation,
        chatHistory: updatedHistory,
      });
    } catch {
      // A pergunta fica no estado local para não perder o que o usuário enviou.
      setChatError(
        "Não foi possível obter uma resposta agora. Tente novamente.",
      );
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRetryChat = async () => {
    const lastQuestion = [...chatHistory]
      .reverse()
      .find((message) => message.role === "user");
    if (!lastQuestion || isChatLoading) return;

    const simulation = getFormData(simulationId);
    if (!simulation) {
      setChatError("Simulação não encontrada.");
      return;
    }

    setChatError(null);
    setIsChatLoading(true);

    try {
      const answer = await askEducator(
        lastQuestion.content,
        simulation,
        insight,
        chatHistory,
      );
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        createdAt: new Date().toISOString(),
      };
      const updatedHistory = [...chatHistory, assistantMessage];
      setChatHistory(updatedHistory);
      updateSimulation(simulationId, {
        ...simulation,
        chatHistory: updatedHistory,
      });
    } catch {
      setChatError(
        "Não foi possível obter uma resposta agora. Tente novamente.",
      );
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleAsk();
  };

  return (
    <div className="bg-card order-2 rounded-2xl p-6 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] lg:order-1 lg:col-span-2">
      <div className="mb-3 flex items-center gap-1.5">
        <span>✨</span>
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Insight Financeiro Personalizado
        </span>
      </div>

      {isLoading && (
        <div className="flex">
          <Skeleton
            count={10.5}
            baseColor="var(--color-skeleton-base)"
            highlightColor="var(--color-skeleton-highlight)"
            className="mb-3 flex rounded-lg"
            containerClassName="flex-1"
            inline
          />
        </div>
      )}

      {!isLoading && error && (
        <Error
          simulationId={simulationId}
          message={error}
          onRetry={() => {
            fetchInsight(simulationId);
          }}
        />
      )}

      {!isLoading && insight && !error && <Content insight={insight} />}

      {insight && !error && (
        <section className="mt-6 border-t border-border pt-5">
          <div className="mb-3">
            <h3 className="text-foreground text-base font-semibold">
              💬 Converse com o Educador Financeiro
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Tire dúvidas sobre esta simulação quantas vezes quiser.
            </p>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl pr-1">
            {chatHistory.length === 0 && (
              <p className="text-muted-foreground rounded-xl bg-input p-4 text-sm">
                Faça uma pergunta como: “Como posso chegar nessa meta mais
                rápido?”
              </p>
            )}

            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <span aria-hidden="true">✨</span>
                  </div>
                )}
                <div
                  className={
                    message.role === "user"
                      ? "bg-primary text-primary-foreground max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed"
                      : "bg-input text-foreground max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                  }
                >
                  {message.content}
                </div>
                {message.role === "user" && (
                  <div className="bg-border text-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <UserRound size={16} />
                  </div>
                )}
              </div>
            ))}

            {isChatLoading && (
              <div className="flex items-center gap-2">
                <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <span aria-hidden="true">✨</span>
                </div>
                <div className="bg-input text-muted-foreground rounded-2xl rounded-bl-md px-4 py-3 text-sm">
                  Educador está pensando...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {chatError && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <span>⚠️ {chatError}</span>
              <Button
                type="button"
                variant="ghost"
                className="shrink-0 text-red-600 dark:text-red-400"
                onClick={() => void handleRetryChat()}
                disabled={isChatLoading}
              >
                Tentar novamente
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Digite sua pergunta..."
              aria-label="Pergunte ao Educador Financeiro"
              disabled={isChatLoading}
              className="text-foreground placeholder:text-muted-foreground bg-input min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2 disabled:opacity-60"
            />
            <Button
              type="submit"
              variant="primary"
              icon={Send}
              disabled={!question.trim() || isChatLoading}
              aria-label="Enviar pergunta"
              className="shrink-0 px-4"
            >
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </form>
        </section>
      )}
    </div>
  );
}
