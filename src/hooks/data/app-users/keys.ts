import type {
  AppSignupUsersParams,
  AppUsersParams,
  SearchAppUsersParams,
  TeamAppUsersParams,
} from '@hooks/data/app-users/types';
import { type QueryKey } from '@tanstack/react-query';

// KEYS
export const appUsersQueryKey = {
  base: ['app-users'] as QueryKey,

  signups: (params: AppSignupUsersParams) => [[...appUsersQueryKey.base, 'signups'], params] as const,
  app: (params: AppUsersParams) => [[...appUsersQueryKey.base, 'app'], params] as const,
  team: (params: TeamAppUsersParams) => [[...appUsersQueryKey.base, 'team'], params] as const,
  search: (params: SearchAppUsersParams) => [[...appUsersQueryKey.base, 'search'], params] as const,
  connections: (params: AppUsersParams) => [[...appUsersQueryKey.base, 'connections'], params] as const,
};

// QUERY KEYS
export type AppSignupUsersQueryKey = ReturnType<typeof appUsersQueryKey.signups>;

export type AppUsersQueryKey = ReturnType<typeof appUsersQueryKey.app>;

export type TeamAppUsersQueryKey = ReturnType<typeof appUsersQueryKey.team>;

export type SearchAppUsersQueryKey = ReturnType<typeof appUsersQueryKey.search>;

export type AppConnectionsQueryKey = ReturnType<typeof appUsersQueryKey.connections>;
