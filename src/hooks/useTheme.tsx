import { useContext } from "react";
import { ThemeContext } from "../context/theme/ThemeContext";

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme deve ser usando dentro de um ThemeProvider");
  }

  return context;
}
