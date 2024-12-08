import { DEFAULT_RQ_CONFIG } from '@constants/react-query-conf';
import {
  type EventLogLoginResponse,
  type EventLogStatsParams,
  type EventLogStatsResponse,
  type EventLogsPageParams,
  type EventLogsParams,
} from '@custom-types/data-models/events-logs';
import { eventLogsFetcher, eventLogsStatsFetcher } from '@services/event-logs';
import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type QueryFunction,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

// TYPES
export type EventLogsLoginsQueryKey = ReturnType<typeof eventLogsQueryKeys.logins>;

export type EventLogsStatsQueryKey = ReturnType<typeof eventLogsQueryKeys.stats>;

// KEYS
export const eventLogsQueryKeys = {
  base: ['event-logs'] as QueryKey,

  logins: (params: EventLogsParams) => [[...eventLogsQueryKeys.base, 'logins'], params] as const,

  stats: (params: EventLogStatsParams) => [[...eventLogsQueryKeys.base, 'stats'], params] as const,
};

// FETCHERS
export const makeGetEventLogsLoginsFetch = (): QueryFunction<
  EventLogLoginResponse,
  EventLogsLoginsQueryKey,
  EventLogsPageParams
> => eventLogsFetcher;

export const makeGetEventLogsStatsFetch = (): QueryFunction<EventLogStatsResponse, EventLogsStatsQueryKey> =>
  eventLogsStatsFetcher;

// QUERY HOOKS
export const useEventLogs = (
  queryKey: EventLogsLoginsQueryKey,
  config?: Omit<
    UseQueryOptions<EventLogLoginResponse, Error, EventLogLoginResponse, EventLogsLoginsQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<EventLogLoginResponse> => {
  const fetcher = makeGetEventLogsLoginsFetch();
  return useQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_CONFIG,
    gcTime: 10000,
    retry: 3,
    ...config,
  });
};

export const useEventLogsInfinite = (
  queryKey: EventLogsLoginsQueryKey,
  config?: Omit<
    UseInfiniteQueryOptions<
      EventLogLoginResponse,
      Error,
      InfiniteData<EventLogLoginResponse, EventLogsPageParams>,
      EventLogLoginResponse,
      EventLogsLoginsQueryKey,
      EventLogsPageParams
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const fetcher = makeGetEventLogsLoginsFetch();
  return useInfiniteQuery({
    queryKey,
    queryFn: fetcher,
    initialPageParam: {},
    ...DEFAULT_RQ_CONFIG,
    gcTime: 10000,
    retry: 3,
    getNextPageParam: () => null,
    ...config,
  });
};

export const useEventLogStats = (
  queryKey: EventLogsStatsQueryKey,
  config?: Omit<
    UseQueryOptions<EventLogStatsResponse, Error, EventLogStatsResponse, EventLogsStatsQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<EventLogStatsResponse> => {
  const fetcher = makeGetEventLogsStatsFetch();
  return useQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_CONFIG,
    gcTime: 10000,
    retry: 3,
    ...config,
  });
};
