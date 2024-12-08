import { DEFAULT_RQ_SUSPENSE_CONFIG } from '@constants/react-query-conf';
import { makeTeamBindingsFetcher } from '@hooks/data/email-customization/fetcher';
import { TemplateBindingsQueryKey } from '@hooks/data/email-customization/keys';
import { TemplateBinding } from '@hooks/data/email-customization/types';
import { UseQueryOptions, useSuspenseQuery, UseSuspenseQueryResult } from '@tanstack/react-query';

export const useTemplateBindingsSuspenseQuery = (
  queryKey: TemplateBindingsQueryKey,
  config?: Omit<
    UseQueryOptions<TemplateBinding[], Error, TemplateBinding[], TemplateBindingsQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseSuspenseQueryResult<TemplateBinding[]> => {
  const fetcher = makeTeamBindingsFetcher();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};
