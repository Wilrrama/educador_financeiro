import { StepProgress } from "./Progress";
import { FormStep } from "./FormStep";
import { simulationFormSteps } from "../../../data/simulation";
import { useState } from "react";

export const SimulationForm = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const totalSteps = simulationFormSteps.length;
  const currentStep = simulationFormSteps[currentStepIndex];

  const handleNextStep = () => {
    // const updatedFormData = { ...formData, [currentStep.id]: value };
    // setFormData(updatedFormData);

    // console.log({ updatedFormData });

    if (currentStepIndex + 1 > totalSteps - 1) {
      // const id = saveFormData(updatedFormData);
      // void navigate(`/resultado/${id}`);
      return;
    }

    setCurrentStepIndex((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    if (currentStepIndex === 0) {
      return;
    }

    setCurrentStepIndex((prev) => prev - 1);
  };

  return (
    <>
      <StepProgress currentStep={currentStepIndex + 1} totalSteps={10} />
      <FormStep
        key={currentStep.id}
        {...currentStep}
        onBack={handlePreviousStep}
        onNext={handleNextStep}
        hideBackButton={currentStepIndex === 0}
      />
    </>
  );
};
