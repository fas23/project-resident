import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../services/permissions";

export default function PermissionRoute({ resource, action, children }) {
  const { role, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  const allowed = hasPermission(role, resource, action);

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
