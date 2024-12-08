'use client';

import { FallbackLoading } from '@components/partials/fallback-loading/fallback-loading';
import { TEAMS_SERVICE_ERROR_CODES } from '@constants/error';
import { PLAN_NAMES } from '@constants/pricing';
import { getPlanFromTeamPlanInfo } from '@hooks/common/use-plan';
import { useAcceptTeamInviteMutation } from '@hooks/data/teams';
import { makeTeamPlanInfoFetcher } from '@hooks/data/teams/fetcher';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { useUserInfoQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { logger } from '@libs/datadog';
import { isSame } from '@libs/is-same';
import { magic } from '@libs/magic-sdk';
import { useToast } from '@magiclabs/ui-components';
import { type GetTeamPlanInfo } from '@services/teams';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, type PropsWithChildren } from 'react';

export const LoginLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = usePathname();
  const queryClient = useQueryClient();
  const { createToast } = useToast();

  const { data: userInfo, isPending, isError: isLoggedOut } = useUserInfoQuery(userQueryKeys.info());

  const { mutateAsync: acceptTeamInvite } = useAcceptTeamInviteMutation({
    onSuccess: () => {
      createToast({
        message: 'You’ve just joined the team!',
        variant: 'success',
      });
    },
    onError: (error) => {
      if (error.code === TEAMS_SERVICE_ERROR_CODES.TEAM_INVITE_ALREADY_ACCEPTED) {
        createToast({
          message: 'You’ve just joined the team!',
          variant: 'success',
        });
      } else if (error.code === TEAMS_SERVICE_ERROR_CODES.TEAM_INVITE_CANCELED) {
        createToast({
          message: 'Team invite has been canceled',
          variant: 'error',
        });
      } else {
        createToast({
          message: 'Failed to join the team',
          variant: 'error',
        });
      }
    },
  });

  useEffect(() => {
    if (!isPending && !isLoggedOut) {
      (async () => {
        // Accept team invite
        const inviteTeamId = searchParams?.get('invite_team_id');
        try {
          if (inviteTeamId && typeof inviteTeamId === 'string') {
            await acceptTeamInvite({
              teamId: inviteTeamId,
              email: userInfo.email,
            });
          }
        } catch (error) {
          logger.error(
            'Failed to accept team invite',
            {
              teamId: inviteTeamId,
              email: userInfo.email,
            },
            error as Error,
          );
        }

        // pricing redirect
        try {
          const fetcher = makeTeamPlanInfoFetcher();
          await queryClient.prefetchQuery({
            queryKey: teamQueryKeys.planInfo({
              teamId: userInfo.teamId,
            }),
            queryFn: fetcher,
          });

          const teamPlanInfo = queryClient.getQueryData<GetTeamPlanInfo>(
            teamQueryKeys.planInfo({
              teamId: userInfo.teamId,
            }),
          );
          if (!teamPlanInfo) {
            throw new Error('Something went wrong! Cannot get your team info');
          }

          const { planName } = getPlanFromTeamPlanInfo(teamPlanInfo);

          const startWith = searchParams?.get('startWith');
          if (startWith && typeof startWith === 'string') {
            if (currentPath === '/signup') {
              router.push(`/create-your-first-app?${new URLSearchParams({ startWith })}`);
              return;
            }

            if (isSame(startWith, PLAN_NAMES.STARTUP)) {
              if (
                planName !== PLAN_NAMES.GROWTH &&
                planName !== PLAN_NAMES.STARTUP &&
                planName !== PLAN_NAMES.ENTERPRISE
              ) {
                router.push('/checkout/upgrade-to-startup');
                return;
              }
            } else if (isSame(startWith, PLAN_NAMES.GROWTH)) {
              if (planName !== PLAN_NAMES.GROWTH && planName !== PLAN_NAMES.ENTERPRISE) {
                router.push('/checkout/upgrade-to-growth');
                return;
              }
            }
          }

          if (currentPath === '/signup') {
            if (userInfo.apps.length > 0) {
              router.push('/app/all_apps');
              return;
            }
            router.push('/create-your-first-app');
            return;
          }

          router.push('/app/all_apps');
        } catch (error) {
          logger.error('Something went wrong in the login layout', {}, error as Error);
          await magic.user.logout();
          queryClient.removeQueries({
            queryKey: userQueryKeys.info(),
          });
        }
      })();
    }
  }, [isPending]);

  if (isLoggedOut) {
    return children;
  }

  if (isPending || !isLoggedOut) {
    return <FallbackLoading />;
  }

  return null;
};
