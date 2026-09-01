import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../services/permissions";

export default function Can({ resource, action, children }) {
  const { role } = useAuth();

  const allowed = hasPermission(role, resource, action);

  if (!allowed) {
    return null;
  }

  return children;
}
