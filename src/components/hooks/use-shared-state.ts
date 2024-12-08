import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useCallback } from 'react';

function isFunction<T>(param: T | ((prevState: T) => T)): param is (prevState: T) => T {
  return typeof param === 'function';
}

export function useSharedState<T>(queryKey: QueryKey, initialData?: T) {
  const client = useQueryClient();

  const { data } = useQuery<T>({
    queryKey,
    queryFn: () => client.getQueryData(queryKey)!,
    initialData,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
  const state = data as T;

  const setState = useCallback(
    (param: T | ((prevState: T) => T)) => {
      const newState = isFunction(param) ? param(state) : param;
      client.setQueryData(queryKey, newState);
    },
    [queryKey, client, state],
  );

  return [state, setState] as const;
}
