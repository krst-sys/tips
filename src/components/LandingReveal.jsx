"use client";

import { useEffect } from "react";

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export default function LandingReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(
      document.querySelectorAll(".filtto-reveal, .filtto-animate-when-visible"),
    );

    if (!elements.length) {
      return undefined;
    }

    if (prefersReducedMotion()) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    root.classList.add("filtto-reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            entry.target.dispatchEvent(new CustomEvent("filtto:visible"));
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      root.classList.remove("filtto-reveal-ready");
    };
  }, []);

  return null;
}
