import type { TeamInfoParams, TeamInvoicesParams, TeamPlanInfoParams } from '@hooks/data/teams/types';
import { type QueryKey } from '@tanstack/react-query';

export const teamQueryKeys = {
  base: ['team'] as QueryKey,

  planInfo: (params: TeamPlanInfoParams) => [[...teamQueryKeys.base, 'planInfo'], params] as const,
  info: (params: TeamInfoParams) => [[...teamQueryKeys.base, 'info'], params] as const,
  invoices: (params: TeamInvoicesParams) => [[...teamQueryKeys.base, 'invoices'], params] as const,
};

export type TeamPlanInfoQueryKey = ReturnType<typeof teamQueryKeys.planInfo>;

export type TeamInfoQueryKey = ReturnType<typeof teamQueryKeys.info>;

export type TeamInvoicesQueryKey = ReturnType<typeof teamQueryKeys.invoices>;
