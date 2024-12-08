import { DEFAULT_RQ_SUSPENSE_CONFIG } from '@constants/react-query-conf';
import {
  makeAppConnectionsFetch,
  makeAppSignupUsersFetch,
  makeAppUsersFetch,
  makeSearchAppUsersFetch,
  makeTeamAppUsersFetch,
} from '@hooks/data/app-users/fetcher';
import {
  AppConnectionsQueryKey,
  type AppSignupUsersQueryKey,
  type AppUsersQueryKey,
  type SearchAppUsersQueryKey,
  type TeamAppUsersQueryKey,
} from '@hooks/data/app-users/keys';
import { PassportConnection, type AppUser, type SignupAppUsers } from '@hooks/data/app-users/types';
import {
  useQuery,
  useSuspenseQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query';

// QUERY HOOKS
export const useSignupAppUsersSuspenseQuery = (
  queryKey: AppSignupUsersQueryKey,
  config?: Omit<
    UseSuspenseQueryOptions<SignupAppUsers, Error, SignupAppUsers, AppSignupUsersQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseSuspenseQueryResult<SignupAppUsers> => {
  const fetcher = makeAppSignupUsersFetch();
  return useSuspenseQuery({
    queryKey,
    // @ts-expect-error passport: structure TBD
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

export const useAppUsersSuspenseQuery = (
  queryKey: AppUsersQueryKey,
  config?: Omit<UseSuspenseQueryOptions<AppUser[], Error, AppUser[], AppUsersQueryKey>, 'queryKey' | 'queryFn'>,
): UseSuspenseQueryResult<AppUser[]> => {
  const fetcher = makeAppUsersFetch();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

export const useTeamAppUsersSuspenseQuery = (
  queryKey: TeamAppUsersQueryKey,
  config?: Omit<UseSuspenseQueryOptions<AppUser[], Error, AppUser[], TeamAppUsersQueryKey>, 'queryKey' | 'queryFn'>,
): UseSuspenseQueryResult<AppUser[]> => {
  const fetcher = makeTeamAppUsersFetch();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

export const useSearchAppUsersQuery = (
  queryKey: SearchAppUsersQueryKey,
  config?: Omit<UseQueryOptions<SignupAppUsers, Error, SignupAppUsers, SearchAppUsersQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<SignupAppUsers> => {
  const fetcher = makeSearchAppUsersFetch();
  return useQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

export const useAppConnectionsSuspenseQuery = (
  queryKey: AppConnectionsQueryKey,
  config?: Omit<
    UseSuspenseQueryOptions<PassportConnection[], Error, PassportConnection[], AppConnectionsQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseSuspenseQueryResult<PassportConnection[]> => {
  return useSuspenseQuery({
    queryKey,
    queryFn: makeAppConnectionsFetch(),
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};
