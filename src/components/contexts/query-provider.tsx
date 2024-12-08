import { DEFAULT_RQ_CONFIG } from '@constants/react-query-conf';
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
  type QueryClientProviderProps,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRef } from 'react';

type Props = {
  dehydratedState?: DehydratedState;
} & Partial<QueryClientProviderProps>;

export const client = new QueryClient({
  defaultOptions: DEFAULT_RQ_CONFIG,
});

export function QueryProvider({ dehydratedState, children, ...props }: Props) {
  // for SSR hygration of react query using a shared client
  const queryClient = useRef(client);

  return (
    <QueryClientProvider {...props} client={queryClient.current}>
      <HydrationBoundary state={dehydratedState}>
        <ReactQueryDevtools initialIsOpen={false} />
        {children}
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
