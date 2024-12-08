import { GOOGLE_RECAPTCHA_KEY } from '@constants/grecaptcha';
import { DEFAULT_RQ_SUSPENSE_CONFIG } from '@constants/react-query-conf';
import { useDashboardStore } from '@hooks/data/store/store';
import { login, logout, makeGetUserInfoFetch } from '@hooks/data/user/fetchers';
import { userQueryKeys, type UserInfoQueryKey } from '@hooks/data/user/keys';
import { type CheckUserExistsParams, type SignInParams, type UserInfo } from '@hooks/data/user/types';
import { isBrowserTestEmail } from '@libs/is-test-email';
import { magic } from '@libs/magic-sdk';
import { apiUserStatus } from '@services/billing';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// QUERY HOOKS
export const useUserInfoQuery = (
  queryKey: UserInfoQueryKey,
  config?: Omit<UseQueryOptions<UserInfo, Error, UserInfo, UserInfoQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<UserInfo> => {
  return useQuery({
    queryKey,
    queryFn: makeGetUserInfoFetch(),
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

export const useUserInfoSuspenseQuery = (
  queryKey: UserInfoQueryKey,
  config?: Omit<UseSuspenseQueryOptions<UserInfo, Error, UserInfo, UserInfoQueryKey>, 'queryKey' | 'queryFn'>,
): UseSuspenseQueryResult<UserInfo> => {
  return useSuspenseQuery({
    queryKey,
    queryFn: makeGetUserInfoFetch(),
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

// MUTATION HOOKS
export const useSignInMutation = (config?: Omit<UseMutationOptions<void, Error, SignInParams>, 'mutationFn'>) => {
  const queryClient = useQueryClient();
  const { setPassportAuthToken } = useDashboardStore();

  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      await magic.auth.loginWithEmailOTP({ email });

      const idToken = await magic.user.getIdToken();

      const { data } = await login(email, idToken);
      setPassportAuthToken(data.session_token);

      await queryClient.invalidateQueries({
        queryKey: userQueryKeys.info(),
      });
    },
    ...config,
  });
};

export const useSignOutMutation = (config?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setPassportAuthToken } = useDashboardStore();

  return useMutation({
    mutationFn: async () => {
      await Promise.all([magic.user.logout(), logout()]);
      setPassportAuthToken('');

      await router.push('/login');
      queryClient.removeQueries({
        queryKey: userQueryKeys.info(),
      });
    },
    ...config,
  });
};

export const useCheckUserExistsMutation = (
  config?: Omit<UseMutationOptions<boolean, Error, CheckUserExistsParams>, 'mutationFn'>,
) => {
  return useMutation({
    mutationFn: async ({ email }: CheckUserExistsParams) => {
      const { grecaptcha } = window as Window;
      const token = isBrowserTestEmail(email)
        ? ''
        : await grecaptcha.execute(GOOGLE_RECAPTCHA_KEY, { action: 'submit' });

      const status = (await apiUserStatus(email, token)).status as 'new' | 'suspended' | 'existing';

      return status === 'existing';
    },
    ...config,
  });
};
