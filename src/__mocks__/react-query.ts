import { DEFAULT_RQ_CONFIG } from '@constants/react-query-conf';
import { QueryClientConfig } from '@tanstack/react-query';

export const TEST_CONFIG: QueryClientConfig = {
  defaultOptions: {
    ...DEFAULT_RQ_CONFIG,
    queries: {
      retry: false,
      gcTime: Infinity,
    },
  },
};
