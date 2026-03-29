import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

const GOOGLE_ONBOARDING_TOKEN_KEY = "google_onboarding_token";

export function setGoogleOnboardingToken(token: string) {
  localStorage.setItem(GOOGLE_ONBOARDING_TOKEN_KEY, token);
}

export function getGoogleOnboardingToken() {
  return localStorage.getItem(GOOGLE_ONBOARDING_TOKEN_KEY);
}

export function clearGoogleOnboardingToken() {
  localStorage.removeItem(GOOGLE_ONBOARDING_TOKEN_KEY);
}
