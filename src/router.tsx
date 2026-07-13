import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
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
