'use client';

import { InviteTeamMemberCard } from '@components/views/manage-team-view/Invite-team-member-card';
import { EditTeamNameCard } from '@components/views/manage-team-view/edit-team-name-card';
import { TeamMemberListCard } from '@components/views/manage-team-view/team-member-list-card';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { DropdownOption, DropdownSelector, Text } from '@magiclabs/ui-components';
import { Box, HStack, Stack } from '@styled/jsx';
import { useMemo } from 'react';

export const ManageTeamView = () => {
  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { currentTeamId, setCurrentTeamId } = useCurrentTeam();

  const isOwner = useMemo(() => {
    return userInfo.teamId === currentTeamId;
  }, [currentTeamId, userInfo.teamId]);

  return (
    <Stack gap={6} p={6} h="100%" bgColor={'surface.secondary'} maxW="750px">
      <HStack alignItems="flex-start" justifyContent="space-between" smDown={{ flexDir: 'column' }}>
        <Text.H3>Team</Text.H3>
        {userInfo.teams.length > 1 && (
          <Box w="20rem">
            <DropdownSelector size="sm" onSelect={setCurrentTeamId} selectedValue={currentTeamId}>
              {userInfo.teams.map((team) => (
                <DropdownOption
                  key={team.teamId}
                  label={team.teamId === userInfo.teamId ? 'My Team' : team.teamName}
                  value={team.teamId}
                />
              ))}
            </DropdownSelector>
          </Box>
        )}
      </HStack>
      <Stack gap={6}>
        {isOwner && (
          <>
            <EditTeamNameCard />
            <InviteTeamMemberCard />
          </>
        )}
        <TeamMemberListCard />
      </Stack>
    </Stack>
  );
};
