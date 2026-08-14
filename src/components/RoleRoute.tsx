import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useRole, AppRole } from "@/hooks/useRole";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RoleRoute({
  allow,
  children,
}: {
  allow: AppRole[];
  children: React.ReactNode;
}) {
  const { role, loading } = useRole();

  console.log(
    "RoleRoute debug - role:",
    role,
    "loading:",
    loading,
    "allow:",
    allow,
  );

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : allow.includes(role) ? (
        <>{children}</>
      ) : (
        <Navigate to="/" replace />
      )}
    </ProtectedRoute>
  );
}
