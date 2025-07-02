import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, delay: number | null) {
  // ✅ give useRef an initial value (null is fine)
  const savedCallback = useRef<(() => void) | null>(null);

  // keep the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // set up / clear interval
  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => {
      // call only if the ref is set
      savedCallback.current?.();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}
