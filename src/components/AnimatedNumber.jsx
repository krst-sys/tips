"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1750,
  locale = "pt-BR",
  className = "",
}) {
  const elementRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals, locale],
  );

  useEffect(() => {
    if (prefersReducedMotion()) {
      const frameId = requestAnimationFrame(() => setDisplayValue(value));
      return () => cancelAnimationFrame(frameId);
    }

    const element = elementRef.current;

    if (!element) {
      return undefined;
    }

    const onVisible = () => setIsVisible(true);

    if (element.closest(".is-visible") || element.matches(".is-visible")) {
      onVisible();
      return undefined;
    }

    element.addEventListener("filtto:visible", onVisible, { once: true });

    return () => element.removeEventListener("filtto:visible", onVisible);
  }, [value]);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    let frameId;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayValue(value * easeOutCubic(progress));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [duration, isVisible, value]);

  return (
    <span
      ref={elementRef}
      className={`filtto-animate-when-visible inline-flex items-baseline whitespace-nowrap ${className}`}
    >
      {prefix ? <span>{prefix}</span> : null}
      <span>{formatter.format(displayValue)}</span>
      {suffix ? <span>{suffix}</span> : null}
    </span>
  );
}
