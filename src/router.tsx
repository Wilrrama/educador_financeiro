import { createBrowserRouter } from "react-router-dom";
import { Button } from "./components/shared/Button";
import { PiggyBank } from "lucide-react";

export const router = createBrowserRouter([
  {
    children: [
      {
        path: "/",
        element: (
          <>
            <h1>Formulario de Simulação</h1>
            {/* <Button variant="primary" icon={PiggyBank}>
              clique aqui
            </Button> */}
          </>
        ),
      },
      {
        path: "/resultado",
        element: <h1>Resultado de Simulação</h1>,
      },
      {
        path: "/historico",
        element: <h1>Historico de Simulação</h1>,
      },
    ],
  },
]);
