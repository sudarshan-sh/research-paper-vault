import { Navigate } from "react-router-dom";
import type { User } from "../types/user.types";

const ProtectedRoute = ({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) => {
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;
