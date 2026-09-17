import { useEffect, useRef, useState } from 'react';

/**
 * Smooth count-up animation hook.
 * Returns the animated display value.
 * @param target   - Final number to animate to
 * @param duration - Animation duration in ms (default 900)
 * @param enabled  - Whether to run the animation (default true)
 */
export function useCountUp(target: number, duration = 900, enabled = true): number {
  const [displayValue, setDisplayValue] = useState(0);
  const prevTarget = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || target === prevTarget.current) return;

    const start = prevTarget.current;
    const diff  = target - start;
    const startTime = performance.now();

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current  = Math.round(start + diff * easeOut(progress));
      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevTarget.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, enabled]);

  // Sync immediately if animation is disabled
  useEffect(() => {
    if (!enabled) setDisplayValue(target);
  }, [target, enabled]);

  return displayValue;
}
