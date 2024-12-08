import { DEFAULT_RQ_SUSPENSE_CONFIG } from '@constants/react-query-conf';
import { makeTeamInfoFetcher, makeTeamInvoicesFetcher, makeTeamPlanInfoFetcher } from '@hooks/data/teams/fetcher';
import {
  teamQueryKeys,
  type TeamInfoQueryKey,
  type TeamInvoicesQueryKey,
  type TeamPlanInfoQueryKey,
} from '@hooks/data/teams/keys';
import {
  type AcceptTeamInviteParams,
  type EditTeamNameParams,
  type RemoveTeamMemberParams,
  type SendTeamInviteParams,
  type TeamInfo,
  type UpdateTeamPlanParams,
} from '@hooks/data/teams/types';
import { useUserInfoQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { type UserInfo } from '@hooks/data/user/types';
import { type GetInvoicesResponse } from '@services/billing';
import {
  acceptTeamInvite,
  editTeamName,
  removeTeamMember,
  sendTeamInvite,
  updateTeamPlan,
  type GetTeamPlanInfo,
} from '@services/teams';
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

// HOOKS
export const useTeamPlanInfoQuery = (
  queryKey: TeamPlanInfoQueryKey,
  config?: Omit<UseQueryOptions<GetTeamPlanInfo, Error, GetTeamPlanInfo, TeamPlanInfoQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<GetTeamPlanInfo> => {
  const { data: userInfo } = useUserInfoQuery(userQueryKeys.info());

  const fetcher = makeTeamPlanInfoFetcher();
  return useQuery({
    queryKey,
    queryFn: fetcher,
    enabled: Boolean(userInfo),
    ...config,
  });
};

export const useTeamPlanInfoSuspenseQuery = (
  queryKey: TeamPlanInfoQueryKey,
  config?: Omit<
    UseSuspenseQueryOptions<GetTeamPlanInfo, Error, GetTeamPlanInfo, TeamPlanInfoQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseSuspenseQueryResult<GetTeamPlanInfo> => {
  const fetcher = makeTeamPlanInfoFetcher();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

export const useTeamInfoSuspenseQuery = (
  queryKey: TeamInfoQueryKey,
  config?: Omit<UseSuspenseQueryOptions<TeamInfo, Error, TeamInfo, TeamInfoQueryKey>, 'queryKey' | 'queryFn'>,
): UseSuspenseQueryResult<TeamInfo> => {
  const fetcher = makeTeamInfoFetcher();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

export const useTeamInvoicesSuspenseQuery = (
  queryKey: TeamInvoicesQueryKey,
  config?: Omit<
    UseSuspenseQueryOptions<GetInvoicesResponse, Error, GetInvoicesResponse, TeamInvoicesQueryKey>,
    'queryKey' | 'queryFn'
  >,
): UseSuspenseQueryResult<GetInvoicesResponse> => {
  const fetcher = makeTeamInvoicesFetcher();
  return useSuspenseQuery({
    queryKey,
    queryFn: fetcher,
    ...DEFAULT_RQ_SUSPENSE_CONFIG,
    ...config,
  });
};

// MUTATIONS

export const useEditTeamNameMutation = (
  config?: Omit<UseMutationOptions<void, Error, EditTeamNameParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, name }: EditTeamNameParams) => {
      await editTeamName(teamId, name);

      // optimistic updates
      queryClient.setQueryData(teamQueryKeys.info({ teamId }), (prev: TeamInfo) => ({
        ...prev,
        teamName: name,
      }));

      queryClient.setQueryData(userQueryKeys.info(), (prev: UserInfo) => ({
        ...prev,
        teams: prev.teams.map((team) => (team.teamId === teamId ? { ...team, teamName: name } : team)),
      }));
    },
    ...config,
  });
};

export const useSendTeamInviteMutation = (
  config?: Omit<UseMutationOptions<void, Error, SendTeamInviteParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, email }: SendTeamInviteParams) => {
      await sendTeamInvite(teamId, email);

      // optimistic updates
      queryClient.setQueryData(teamQueryKeys.info({ teamId }), (prev: TeamInfo) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, { email, role: 'member', status: 'pending' }],
      }));
    },
    ...config,
  });
};

export const useAcceptTeamInviteMutation = (
  config?: Omit<
    UseMutationOptions<
      void,
      Error & {
        code: string;
      },
      AcceptTeamInviteParams
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, email }: AcceptTeamInviteParams) => {
      await acceptTeamInvite(teamId, email);
      await queryClient.invalidateQueries({
        queryKey: userQueryKeys.info(),
      });
    },
    ...config,
  });
};

export const useRemoveTeamMemberMutation = (
  config?: Omit<UseMutationOptions<void, Error, RemoveTeamMemberParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, email }: RemoveTeamMemberParams) => {
      await removeTeamMember(teamId, email);

      // optimistic updates
      queryClient.setQueryData(teamQueryKeys.info({ teamId }), (prev: TeamInfo) => ({
        ...prev,
        teamMembers: prev.teamMembers.filter((member) => member.email !== email),
      }));
    },
    ...config,
  });
};

export const useUpdateTeamPlanMutation = (
  config?: Omit<UseMutationOptions<void, Error, UpdateTeamPlanParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, quoteId, productPriceKey, downgradeReason }: UpdateTeamPlanParams) => {
      await updateTeamPlan(teamId, quoteId, productPriceKey, downgradeReason);
      await queryClient.invalidateQueries({
        queryKey: teamQueryKeys.planInfo({ teamId }),
      });
    },
    ...config,
  });
};
