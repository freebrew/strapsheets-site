import { createElement, useEffect, useRef, useState, type ReactNode } from "react";

export type SiteTheme = "light" | "dark";

export function readSiteTheme(): SiteTheme {
  const forced = document.documentElement.getAttribute("data-theme");
  if (forced === "light" || forced === "dark") return forced;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** The page theme: system preference, unless a proof override set data-theme. */
export function useSiteTheme(): SiteTheme {
  const [theme, setTheme] = useState<SiteTheme>(readSiteTheme);
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const read = () => setTheme(readSiteTheme());
    read();
    media.addEventListener("change", read);
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      media.removeEventListener("change", read);
      observer.disconnect();
    };
  }, []);
  return theme;
}

/** Faux controls stay out of the tab order and the accessibility tree. */
export function Faux({ id, children }: { id: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.setAttribute("inert", "");
    ref.current?.setAttribute("aria-hidden", "true");
  }, []);
  return createElement("div", { id, ref }, children);
}
