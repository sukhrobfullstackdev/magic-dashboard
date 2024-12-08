import { DEFAULT_RQ_SUSPENSE_CONFIG } from '@constants/react-query-conf';
import { makeCustomSmtpInfoFetcher } from '@hooks/data/custom-smtp/fetcher';
import { CustomSmtpInfoQueryKey, customSmtpQueryKeys } from '@hooks/data/custom-smtp/keys';
import { CustomSmtpInfo, SaveCustomSmtpParams, SendTestEmailParams } from '@hooks/data/custom-smtp/types';
import { CustomError } from '@libs/error';
import { saveCustomSmtpSettings, sendTestEmail } from '@services/custom-smtp';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query';

// HOOKS
export const useCustomSmtpInfoSuspenseQuery = (
  queryKey: CustomSmtpInfoQueryKey,
  config?: Omit<
    UseQueryOptions<CustomSmtpInfo | null, Error, CustomSmtpInfo | null, CustomSmtpInfoQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseSuspenseQueryResult<CustomSmtpInfo | null> => {
  const fetcher = makeCustomSmtpInfoFetcher();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

// MUTATIONS
export const useSaveCustomSmtpInfoMutation = (
  config?: Omit<UseMutationOptions<void, Error, SaveCustomSmtpParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appId, customSmtpInfo }: SaveCustomSmtpParams) => {
      const { error } = await saveCustomSmtpSettings(
        {
          sender_email: customSmtpInfo.senderEmail,
          sender_name: customSmtpInfo.senderName,
          host: customSmtpInfo.host,
          port: customSmtpInfo.port,
          user_name: customSmtpInfo.userName,
          user_password: customSmtpInfo.userPassword,
        },
        appId,
      );

      if (error) {
        throw error;
      }

      queryClient.setQueryData(
        customSmtpQueryKeys.info({
          appId,
        }),
        customSmtpInfo,
      );
    },
    ...config,
  });
};

export const useSendTestEmailMutation = (
  config?: Omit<UseMutationOptions<{ data: object | [] }, CustomError, SendTestEmailParams>, 'mutationFn'>,
) => {
  return useMutation({
    mutationFn: ({ appId }: SendTestEmailParams) => sendTestEmail(appId),
    ...config,
  });
};
