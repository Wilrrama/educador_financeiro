import { useState } from "react";
import { CalendarClock, Eye, Goal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHero } from "../components/shared/PageHero";
import { Button } from "../components/shared/Button";
import { useSimulationStorage } from "../hooks/useSimulationStorage";
import { calcMonthlySavings } from "../utils/simulation";
import type { SimulationRecord } from "../data/simulation";

export function SimulationHistoryPage() {
  const navigate = useNavigate();
  const { getAllSimulations, deleteSimulation } = useSimulationStorage();
  const [simulations, setSimulations] = useState<SimulationRecord[]>(() =>
    getAllSimulations().reverse(),
  );

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta simulação? Esta ação não pode ser desfeita.",
    );

    if (!confirmed) return;

    deleteSimulation(id);
    setSimulations((current) =>
      current.filter((simulation) => simulation.id !== id),
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <PageHero
        title="Histórico de simulações"
        subtitle="Revise suas metas, acompanhe seus resultados e consulte os insights já gerados."
      />

      {simulations.length === 0 ? (
        <section className="bg-card flex flex-col items-center rounded-2xl p-8 text-center shadow-[4px_4px_18px_0px_rgba(0,0,0,0.12)] sm:p-12">
          <div className="bg-muted-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <Goal className="text-primary" size={28} />
          </div>
          <h2 className="text-xl font-bold">Nenhuma simulação salva</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Crie sua primeira simulação para acompanhar sua meta e receber um
            diagnóstico financeiro personalizado.
          </p>
          <Button
            className="mt-6"
            variant="primary"
            onClick={() => void navigate("/")}
          >
            Nova simulação
          </Button>
        </section>
      ) : (
        <div className="grid gap-4">
          {simulations.map((simulation) => {
            const monthlySavings = calcMonthlySavings(simulation);

            return (
              <article
                key={simulation.id}
                className="bg-card rounded-2xl p-5 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.12)] sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <CalendarClock size={16} />
                      Simulação salva
                    </div>

                    <h2 className="truncate text-xl font-bold sm:text-2xl">
                      {simulation.goalName}
                    </h2>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <span className="text-muted-foreground block">
                          Valor da meta
                        </span>
                        <strong>{`R$ ${simulation.goalAmount}`}</strong>
                      </div>

                      <div>
                        <span className="text-muted-foreground block">
                          Prazo
                        </span>
                        <strong>{simulation.goalDeadline} meses</strong>
                      </div>

                      <div>
                        <span className="text-muted-foreground block">
                          Valor disponível/mês
                        </span>
                        <strong>{`R$ ${monthlySavings.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`}</strong>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-secondary-button px-3 py-1.5 text-muted-foreground">
                        {simulation.insight
                          ? "Insights gerados"
                          : "Insights pendentes"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:w-auto lg:flex-col">
                    <Button
                      variant="primary"
                      icon={Eye}
                      onClick={() =>
                        void navigate(`/resultado/${simulation.id}`)
                      }
                      className="w-full sm:w-auto"
                    >
                      Ver detalhes
                    </Button>

                    <Button
                      variant="ghost"
                      icon={Trash2}
                      onClick={() => handleDelete(simulation.id)}
                      className="w-full text-red-500 sm:w-auto"
                      aria-label={`Excluir simulação ${simulation.goalName}`}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
