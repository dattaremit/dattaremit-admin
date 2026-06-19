"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from its previous value up to `target` using
 * requestAnimationFrame. Respects `prefers-reduced-motion`: when the user has
 * requested reduced motion, the final value is shown immediately with no tween.
 *
 * Returns the current (in-flight) value to render.
 */
export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const from = fromRef.current;
    const delta = target - from;

    if (prefersReduced || delta === 0) {
      // Snap to the final value on the next frame (not synchronously in the
      // effect body) so reduced-motion users see the number immediately.
      rafRef.current = requestAnimationFrame(() => {
        setValue(target);
        fromRef.current = target;
      });
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }

    let start: number | null = null;
    // easeOutExpo — quick rise, gentle settle.
    const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(from + delta * ease(progress));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      fromRef.current = target;
    };
  }, [target, durationMs]);

  return value;
}
