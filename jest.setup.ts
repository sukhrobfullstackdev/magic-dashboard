import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import failOnConsole from 'jest-fail-on-console';

failOnConsole();

jest.useFakeTimers();

jest.mock('react', () => {
  const testCache = <T extends (...args: Array<unknown>) => unknown>(func: T) => func;
  const originalModule = jest.requireActual('react');
  return {
    ...originalModule,
    cache: testCache,
  };
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

afterAll(() => {
  jest.restoreAllMocks();
});
