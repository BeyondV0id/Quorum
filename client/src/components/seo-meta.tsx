import { useEffect } from "react";
import { useLocation } from "react-router";
import { CLIENT_URL } from "@/config";

const SITE = "Echo";
const DEFAULT_TITLE = `${SITE} — Open Q&A`;
const DEFAULT_DESCRIPTION =
  "Echo is an open Q&A platform where you can ask questions, share knowledge, and connect with communities through spaces.";

function setMeta(selectorAttr: "property" | "name", key: string, content: string) {
  let el = document.querySelector(`meta[${selectorAttr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(selectorAttr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function titleAndDescriptionForPath(pathname: string): {
  title: string;
  description: string;
} {
  if (pathname === "/auth") {
    return {
      title: `Sign in · ${SITE}`,
      description: `Sign in to ${SITE} to ask questions, join spaces, and reply.`,
    };
  }
  if (pathname === "/home") {
    return {
      title: `Home · ${SITE}`,
      description: DEFAULT_DESCRIPTION,
    };
  }
  if (pathname === "/explore") {
    return {
      title: `Explore · ${SITE}`,
      description: `Discover questions and communities on ${SITE}.`,
    };
  }
  if (pathname === "/spaces" || pathname === "/spaces/") {
    return {
      title: `Spaces · ${SITE}`,
      description: `Browse and join discussion spaces on ${SITE}.`,
    };
  }
  if (pathname === "/profile" || pathname === "/profile/") {
    return {
      title: `Your profile · ${SITE}`,
      description: DEFAULT_DESCRIPTION,
    };
  }
  if (pathname === "/notifications" || pathname === "/notifications/") {
    return {
      title: `Notifications · ${SITE}`,
      description: DEFAULT_DESCRIPTION,
    };
  }

  const userMatch = pathname.match(/^\/u\/([^/]+)\/?$/);
  if (userMatch?.[1]) {
    const username = userMatch[1];
    return {
      title: `@${username} · ${SITE}`,
      description: `See @${username}'s profile and activity on ${SITE}.`,
    };
  }

  const spaceMatch = pathname.match(/^\/space\/([^/]+)\/?$/);
  if (spaceMatch?.[1]) {
    return {
      title: `Space · ${SITE}`,
      description: `Join the conversation in this space on ${SITE}.`,
    };
  }

  if (pathname === "/" || pathname === "/landing") {
    return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
  }

  if (pathname.startsWith("/verify-email")) {
    return {
      title: `Verify email · ${SITE}`,
      description: DEFAULT_DESCRIPTION,
    };
  }
  if (pathname.startsWith("/reset-password")) {
    return {
      title: `Reset password · ${SITE}`,
      description: DEFAULT_DESCRIPTION,
    };
  }
  if (pathname.startsWith("/onboarding")) {
    return {
      title: `Get started · ${SITE}`,
      description: DEFAULT_DESCRIPTION,
    };
  }

  return {
    title: `Not found · ${SITE}`,
    description: DEFAULT_DESCRIPTION,
  };
}

/**
 * Keeps `<title>` and OG/Twitter URL + text tags in sync on SPA navigations.
 * Crawlers that only fetch HTML still use build-time tags in index.html.
 */
export function SeoMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const base = CLIENT_URL.replace(/\/+$/, "");
    const url = `${base}${pathname === "/" ? "/" : pathname}`;

    const { title, description } = titleAndDescriptionForPath(pathname);

    document.title = title;

    setMeta("name", "title", title);
    setMeta("name", "description", description);

    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);

    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:url", url);

    setCanonical(url);
  }, [pathname]);

  return null;
}
