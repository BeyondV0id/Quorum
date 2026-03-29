import { useNavigate } from "react-router";
import { useEffect } from "react";

// The Google OAuth onboarding flow has been replaced by Better Auth's native
// social sign-in. Better Auth automatically creates the user and session on
// first OAuth login — no manual username handoff needed.
// This page now just redirects to /auth as a safety fallback.
export default function Onboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/auth", { replace: true });
  }, [navigate]);

  return null;
}
