import { Modal } from '@components/presentation/modal/modal';
import { SwitchCase } from '@components/presentation/switch-case';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { useRemoveTeamMemberMutation, useTeamInfoSuspenseQuery } from '@hooks/data/teams';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { Button, Card, IcoWarningFill, Text, useToast } from '@magiclabs/ui-components';
import { Box, Divider, Grid, GridItem, HStack, Stack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { Fragment, Suspense, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

const Fallback = () => {
  return (
    <Grid columns={2} py={3}>
      <VStack>
        <Skeleton height={24} width={300} />
      </VStack>
      <Skeleton height={24} width={70} />
      <VStack>
        <Skeleton height={24} width={300} />
      </VStack>
    </Grid>
  );
};

const Resolved = () => {
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { currentTeamId } = useCurrentTeam();
  const { data: teamInfo } = useTeamInfoSuspenseQuery(teamQueryKeys.info({ teamId: currentTeamId }));
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const { createToast } = useToast();

  const { mutateAsync: removeTeamMember } = useRemoveTeamMemberMutation({
    onSuccess: () => {
      createToast({
        message: 'Member removed!',
        variant: 'success',
      });
    },
    onError: () => {
      createToast({
        message: 'Failed to remove member',
        variant: 'error',
      });
    },
  });

  const handleRemove = (email: string) => {
    setSelected(email);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    await removeTeamMember({
      teamId: currentTeamId,
      email: selected,
    });
    setIsOpen(false);
  };

  return (
    <>
      {teamInfo.teamMembers.map((teamMember) => (
        <Fragment key={`member-${teamMember.email}`}>
          <Grid columns={4} py={3}>
            <GridItem colSpan={2}>
              <HStack>
                <Box wordBreak="break-all" w="70%">
                  <Text size="sm" fontWeight="medium">
                    {teamMember.email}
                    {teamMember.email === userInfo.email && ' (You)'}
                  </Text>
                </Box>

                {teamMember.email === teamInfo.teamOwnerEmail && (
                  <Box ml={4} p="6px 8px" bgColor={'brand.lightest'} borderRadius={'6px'}>
                    <Text
                      size="sm"
                      fontWeight="semibold"
                      styles={{
                        fontSize: '10px',
                        color: token('colors.brand.darker'),
                        lineHeight: '12px',
                      }}
                    >
                      OWNER
                    </Text>
                  </Box>
                )}
              </HStack>
            </GridItem>
            <SwitchCase
              value={teamMember.status}
              caseBy={{
                success: (
                  <Text size="sm" fontColor="text.tertiary" fontWeight="semibold">
                    Accepted
                  </Text>
                ),
                pending: (
                  <Text size="sm" fontWeight="semibold" styles={{ color: token('colors.warning.darker') }}>
                    Invite Pending
                  </Text>
                ),
              }}
            />
            {teamInfo.teamOwnerEmail === userInfo.email && teamMember.email !== userInfo.email && (
              <Button
                variant="text"
                textStyle="negative"
                size="sm"
                onPress={() => handleRemove(teamMember.email)}
                label="Remove"
              />
            )}
          </Grid>
          <Divider color="neutral.tertiary" />
        </Fragment>
      ))}
      <Modal in={isOpen}>
        <Stack>
          <IcoWarningFill color={token('colors.negative.darker')} width={40} height={40} />
          <Box my={1}>
            <Text.H3 styles={{ color: token('colors.negative.darker') }}>Remove {selected}?</Text.H3>
          </Box>

          <Text>
            <b>{selected}</b> will lose access to your team’s dashboard, but you can invite them back at any time
          </Text>

          <HStack justifyContent="flex-end" mt={4} gap={4}>
            <Button variant="neutral" onPress={() => setIsOpen(false)} label="Cancel" />
            <Button variant="negative" onPress={handleConfirm} label="Remove" />
          </HStack>
        </Stack>
      </Modal>
    </>
  );
};

export const TeamMemberListCard = () => {
  return (
    <Card>
      <Text.H4 fontWeight="semibold">Team Members</Text.H4>
      <Grid columns={4} mt={6}>
        <GridItem colSpan={2}>
          <Text size="sm" fontWeight="medium">
            Email address
          </Text>
        </GridItem>
        <Text size="sm" fontWeight="medium">
          Status
        </Text>
      </Grid>
      <Suspense fallback={<Fallback />}>
        <Resolved />
      </Suspense>
    </Card>
  );
};
