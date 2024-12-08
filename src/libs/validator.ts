import { z } from 'zod';

export function isValidEmail(source?: string | null) {
  if (!source) return false;
  return z.string().email().safeParse(source).success;
}

export function isValidURL(value?: string | URL | null) {
  if (!value) return false;
  if (value instanceof URL) return true;

  if (navigator.userAgent.includes('Firefox') && value.includes('*.')) {
    value = value.replace(/\*\./, '');
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidBundle(value?: string): boolean {
  if (!value) return false;
  return /^[a-z0-9-_]+(?:\.[a-z0-9-_]+)*(?:\.\*)?$/i.test(value);
}
