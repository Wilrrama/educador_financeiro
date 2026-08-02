import { PiggyBank } from "lucide-react";
import { StepProgress } from "./Progress";
import { FormStep } from "./FormStep";

export const SimulationForm = () => {
  return (
    <>
      <StepProgress currentStep={3} totalSteps={10} />
      <FormStep
        icon={PiggyBank}
        title="Renda mensal bruta"
        question="Quanto é depositado na sua conta todo mês"
        inputProps={{
          type: "text",
          placeholder: "ex: 5.000,00",
          prefix: "R$",
        }}
      />
    </>
  );
};
