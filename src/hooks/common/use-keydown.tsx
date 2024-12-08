import { KeyboardEvent, KeyboardEventHandler } from 'react';

export function useKeyDown(callable: (e: KeyboardEvent) => void, whitelist?: string[]): KeyboardEventHandler {
  return (e) => {
    if (!whitelist) {
      if (e.key !== 'Tab' && e.key !== 'Shift') {
        callable(e);
      }
    } else {
      if (whitelist.find((key) => key === e.key)) {
        callable(e);
      }
    }
    return e;
  };
}
