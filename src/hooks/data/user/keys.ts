import type { QueryKey } from '@tanstack/react-query';

export const userQueryKeys = {
  base: ['user'] as QueryKey,

  info: () => [[...userQueryKeys.base, 'info']] as const,
};

export type UserInfoQueryKey = ReturnType<typeof userQueryKeys.info>;
