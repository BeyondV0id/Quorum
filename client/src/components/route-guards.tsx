import { useAuth } from "@/hooks/use-auth";
import { Navigate, Outlet } from "react-router";
import { PageSkeleton } from "@/components/ui/skeletons";

export function ProtectedRoute() {
  const { data: user, isPending, isError } = useAuth();

  if (isPending) return <PageSkeleton />;
  if (isError || !user) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { data: user, isPending } = useAuth();

  if (isPending) return <PageSkeleton />;
  if (user) return <Navigate to="/home" replace />;
  return <Outlet />;
}
