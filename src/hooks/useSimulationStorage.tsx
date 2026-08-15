import {
  type SimulationFormData,
  type SimulationRecord,
} from "../data/simulation";

const LOCAL_STORAGE_KEY = "simulation-data";

const readStorage = (): SimulationRecord[] => {
  const storage = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!storage) return [];

  try {
    return JSON.parse(storage) as SimulationRecord[];
  } catch {
    return [];
  }
};

export const useSimulationStorage = () => {
  const saveFormData = (formData: SimulationFormData) => {
    const id = crypto.randomUUID();
    const record: SimulationRecord = { ...formData, id };

    const storage = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedData = storage
      ? (JSON.parse(storage) as SimulationRecord[])
      : [];
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([...savedData, record]),
    );

    return id;
  };

  const getAllSimulations = () => readStorage();

  const getFormData = (id: string) => {
    return readStorage().find((record) => record.id === id) || null;
  };

  const updateSimulation = (id: string, data: SimulationRecord) => {
    const updated = readStorage().map((record) =>
      record.id === id ? { ...data } : record,
    );

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteSimulation = (id: string) => {
    const updated = readStorage().filter((record) => record.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    saveFormData,
    getFormData,
    updateSimulation,
    deleteSimulation,
    getAllSimulations,
  };
};
