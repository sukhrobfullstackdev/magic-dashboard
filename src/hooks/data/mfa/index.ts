import { type SignupAppUsers } from '@hooks/data/app-users/types';
import { type DisableMfaParams } from '@hooks/data/mfa/types';
import { disableMfa } from '@services/mfa';
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

export const useDisableMfaMutation = (
  config?: Omit<UseMutationOptions<void, Error, DisableMfaParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appId, authUserId, queryKey }: DisableMfaParams) => {
      await disableMfa(appId, authUserId);

      queryClient.setQueryData(queryKey, (prev: SignupAppUsers) => {
        return {
          ...prev,
          users: prev.users.map((user) => {
            if (user.authUserId === authUserId) {
              return {
                ...user,
                isMfaEnabled: false,
              };
            }

            return user;
          }),
        };
      });
    },
    ...config,
  });
};
