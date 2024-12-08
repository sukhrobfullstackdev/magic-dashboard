import { UAParser } from 'ua-parser-js';

export const detectPlatform = (userAgent: string): string | null => {
  const parser = new UAParser(userAgent);
  return parser.getOS()?.name || null;
};

export const detectBrowser = (userAgent: string): string | null => {
  const parser = new UAParser(userAgent);
  return parser.getBrowser()?.name || null;
};

export const isMobileDevice = (userAgent: string): boolean => {
  const parser = new UAParser(userAgent);
  const validDevices: string[] = ['mobile', 'tablet'];
  return validDevices.includes(parser.getDevice().type || '');
};
