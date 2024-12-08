import { DD_MESSAGES } from '@constants/dd-messages';
import { PLAN_NAMES } from '@constants/pricing';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePlan } from '@hooks/common/use-plan';
import { useSendTeamInviteMutation, useTeamInfoSuspenseQuery } from '@hooks/data/teams';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { logger } from '@libs/datadog';
import { Button, Card, IcoPaperPlane, Text, TextInput, useToast } from '@magiclabs/ui-components';
import { Box, HStack } from '@styled/jsx';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Skeleton from 'react-loading-skeleton';
import { z } from 'zod';

const schema = z.object({
  teamId: z.string().min(1),
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

const Fallback = () => {
  return (
    <Card>
      <Text.H4 fontWeight="semibold">Add to Team</Text.H4>

      <Skeleton height={22} width={280} />

      <HStack gap={6} mt={4}>
        <Box maxW="250px" w="100%">
          <TextInput aria-label="Email Address" type="email" disabled placeholder="hiro@magic.link" />
        </Box>
        <Button type="submit" disabled label="Invite">
          <Button.LeadingIcon>
            <IcoPaperPlane />
          </Button.LeadingIcon>
        </Button>
      </HStack>
    </Card>
  );
};

const Resolved = () => {
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { data: teamInfo } = useTeamInfoSuspenseQuery(teamQueryKeys.info({ teamId: userInfo.teamId }));
  const { plan } = usePlan({
    teamId: userInfo.teamId,
  });
  const { createToast } = useToast();

  const { mutateAsync: inviteTeamMember } = useSendTeamInviteMutation({
    onSuccess: () => {
      createToast({
        message: 'Invite sent!',
        variant: 'success',
      });
    },
    onError: (error, params, context) => {
      logger.error(DD_MESSAGES.FAILED_TO_INVITE_TEAM_MEMBER, { params, context }, error);
      createToast({
        message: 'Failed to sent invite',
        variant: 'error',
      });
    },
  });

  const isAvailable = useMemo(() => {
    return plan.seatCount - teamInfo.teamMembers.length > 0;
  }, [teamInfo, plan.seatCount]);

  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      teamId: userInfo.teamId,
      email: '',
    },
  });

  const onSubmit = handleSubmit(async ({ teamId, email }: FormData) => {
    await inviteTeamMember({ teamId, email });
    reset();
  });

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <Text.H4 fontWeight="semibold">Add to Team</Text.H4>

        {plan.planName === PLAN_NAMES.GROWTH || plan.planName === PLAN_NAMES.ENTERPRISE ? (
          <Text fontColor="text.tertiary">
            Invite up to {plan.seatCount} collaborators. For more seats, contact{' '}
            <a href="https://magic.link/contact" target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
              sales@magic.link
            </a>
          </Text>
        ) : (
          <Text fontColor="text.tertiary">
            Invite up to {plan.seatCount} collaborators.{' '}
            <Link href="/pricing" shallow>
              <Button variant="text" label="Upgrade" />
            </Link>{' '}
            your plan to get more seats.
          </Text>
        )}

        <HStack gap={6} mt={4}>
          <Box maxW="250px" w="100%">
            <TextInput
              aria-label="Email Address"
              type="email"
              disabled={isSubmitting || !isAvailable}
              placeholder="hiro@magic.link"
              {...register('email')}
              onChange={(value) => register('email').onChange({ target: { name: 'email', value } })}
            />
          </Box>
          <Button type="submit" disabled={isSubmitting || !isAvailable} validating={isSubmitting} label="Invite">
            <Button.LeadingIcon>
              <IcoPaperPlane />
            </Button.LeadingIcon>
          </Button>
        </HStack>
      </form>
    </Card>
  );
};

export const InviteTeamMemberCard = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <Resolved />
    </Suspense>
  );
};
