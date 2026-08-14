import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useRole } from "@/hooks/useRole";

export default function RoleHomeRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading } = useRole();

  console.log("RoleHomeRedirect debug - role:", role, "loading:", loading);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  if (role === "admin") {
    console.log("RoleHomeRedirect - redirecionando para /admin");
    return <Navigate to="/admin" replace />;
  }
  if (role === "sub_admin") {
    console.log("RoleHomeRedirect - redirecionando para /gestor");
    return <Navigate to="/gestor" replace />;
  }
  console.log("RoleHomeRedirect - mantendo em /dashboard");
  return <>{children}</>;
}
