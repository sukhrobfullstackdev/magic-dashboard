// https://github.com/streamich/react-use/blob/master/src/useTimeoutFn.ts
import { useCallback, useEffect, useRef } from 'react';

type UseTimeoutFnReturn = [() => boolean | null, () => void, () => void];

export function useTimeout(fn: () => void, ms = 0): UseTimeoutFnReturn {
  const ready = useRef<boolean | null>(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const callback = useRef(fn);

  const isReady = useCallback(() => ready.current, []);

  const set = useCallback(() => {
    ready.current = false;
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => {
      ready.current = true;
      callback.current();
    }, ms);
  }, [ms]);

  const clear = useCallback(() => {
    ready.current = null;
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  }, []);

  // update ref when function changes
  useEffect(() => {
    callback.current = fn;
  }, [fn]);

  // set on mount, clear on unmount
  useEffect(() => {
    set();

    return clear;
  }, [clear, ms, set]);

  return [isReady, clear, set];
}
