import { authClient } from "@/lib/auth-client";
import { Navigate, Outlet } from "react-router";
import { PageSkeleton } from "@/components/ui/skeletons";

export function ProtectedRoute() {
  const { data, isPending, error } = authClient.useSession();

  if (isPending) return <PageSkeleton />;
  if (error || !data?.session) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { data, isPending } = authClient.useSession();

  if (isPending) return <PageSkeleton />;
  if (data?.session) return <Navigate to="/home" replace />;
  return <Outlet />;
}
