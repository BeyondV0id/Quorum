import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { ErrorBoundary } from "react-error-boundary";
import { AppSidebar } from "@/components/app-sidebar";
import { GuestRoute, ProtectedRoute } from "@/components/route-guards";
import { Toaster } from "@/components/ui/toast";
import { ReloadPrompt } from "@/components/reload-prompt";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SeoMeta } from "@/components/seo-meta";

const Home = lazy(() => import("@/pages/home"));
const Profile = lazy(() => import("@/pages/profile"));
const PublicProfile = lazy(() => import("@/pages/public-profile"));
const Explore = lazy(() => import("@/pages/explore"));
const AllSpaces = lazy(() => import("@/pages/all-spaces"));
const SpacePage = lazy(() => import("@/pages/space"));
const Notifications = lazy(() => import("@/pages/notifications"));
const Auth = lazy(() => import("@/pages/auth"));
const Landing = lazy(() => import("@/pages/landing"));
const VerifyEmail = lazy(() => import("@/pages/verify-email"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const NotFound = lazy(() => import("@/pages/not-found"));



function AuthenticatedLayout() {
  return (
    <div className="flex justify-center min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 flex flex-col items-center">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground">Something went wrong.</p>
        </div>
      }
    >
      <BrowserRouter>
        <SeoMeta />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route element={<GuestRoute />}>
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Navigate to="/" replace />} />
              <Route path="/auth" element={<Auth />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AuthenticatedLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/u/:username" element={<PublicProfile />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/spaces" element={<AllSpaces />} />
                <Route path="/space/:spaceId" element={<SpacePage />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
              <Route path="/" element={<Navigate to="/home" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
        <ReloadPrompt />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
