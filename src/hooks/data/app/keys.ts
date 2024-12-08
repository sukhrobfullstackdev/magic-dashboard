import type { AppInfoParams, AuthMethodsParams } from '@hooks/data/app/types';
import { type QueryKey } from '@tanstack/react-query';

// KEYS
export const appQueryKeys = {
  base: ['app'] as QueryKey,

  info: (params: AppInfoParams) => [[...appQueryKeys.base, 'info'], params] as const,
  authMethods: (params: AuthMethodsParams) => [[...appQueryKeys.base, 'authMethods'], params] as const,
  passportApps: (isPassportFlowEnabled: boolean) =>
    [[...appQueryKeys.base, 'passportApps'], isPassportFlowEnabled] as const,
};

// QUERY KEYS
export type AppInfoQueryKey = ReturnType<typeof appQueryKeys.info>;

export type AuthMethodsQueryKey = ReturnType<typeof appQueryKeys.authMethods>;

export type PassportAppsQueryKey = ReturnType<typeof appQueryKeys.passportApps>;
