import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clases from "./pages/Clases";
import Evaluaciones from "./pages/Evaluaciones";
import NotasEvaluacion from "./pages/NotasEvaluacion";
import Notas from "./pages/Notas";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermissionRoute";
import MainLayout from "./layouts/MainLayout";
import Guardias from "./pages/Guardias";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}

        <Route path="/login" element={<Login />} />

        {/* RUTAS PROTEGIDAS */}

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* DASHBOARD */}

          <Route path="/dashboard" element={<Dashboard />} />

          {/* CLASES */}

          <Route
            path="/clases"
            element={
              <PermissionRoute resource="clases" action="leer">
                <Clases />
              </PermissionRoute>
            }
          />

          {/* EVALUACIONES */}

          <Route
            path="/evaluaciones"
            element={
              <PermissionRoute resource="evaluaciones" action="leer">
                <Evaluaciones />
              </PermissionRoute>
            }
          />

          {/* NOTAS DE UNA EVALUACIÓN */}

          <Route
            path="/evaluaciones/:evaluacionId/notas"
            element={
              <PermissionRoute resource="evaluaciones" action="leer">
                <NotasEvaluacion />
              </PermissionRoute>
            }
          />

          <Route
            path="/notas"
            element={
              <PermissionRoute resource="evaluaciones" action="leer">
                <Notas />
              </PermissionRoute>
            }
          />

          <Route
            path="/guardias"
            element={
              <PermissionRoute resource="guardias" action="leer">
                <Guardias />
              </PermissionRoute>
            }
          />
        </Route>

        {/* CUALQUIER RUTA DESCONOCIDA */}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
