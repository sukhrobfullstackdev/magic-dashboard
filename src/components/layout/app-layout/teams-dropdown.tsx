'use client';

import { useCurrentTeam } from '@hooks/common/use-current-team';
import { useUserInfoSuspenseQuery } from '@hooks/data/user';
import { userQueryKeys } from '@hooks/data/user/keys';
import { Animate, Button, IcoCaretDown, IcoCheckmark, Popover } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Divider, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { kebabCase } from 'tiny-case';

export const TeamsDropdown = () => {
  const router = useRouter();
  const [isOpened, setIsOpened] = useState(false);

  const { data: userInfo } = useUserInfoSuspenseQuery(userQueryKeys.info());
  const { currentTeam, setCurrentTeamId } = useCurrentTeam();

  const handleOpen = () => {
    setIsOpened((prev) => !prev);
  };

  const handleManageTeam = useCallback(() => {
    router.push('/account/team');
  }, [router]);

  const handleSelectTeam = useCallback(
    (teamId: string) => () => {
      setIsOpened(false);
      router.push('/app/all_apps');
      setCurrentTeamId(teamId);
    },
    [router, setCurrentTeamId],
  );

  return (
    <Popover
      id="dropdown-teams"
      isOpen={isOpened}
      onOpenChange={handleOpen}
      variant="text"
      textStyle="neutral"
      size="sm"
      trigger="click"
      label={currentTeam.teamName}
    >
      <Popover.TrailingIcon>
        <IcoCaretDown
          style={{ transform: isOpened ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
        />
      </Popover.TrailingIcon>
      <Popover.Content className={css({ maxW: 'fit-content' })}>
        <Animate type="slide">
          <Stack w="fit-content" gap={2}>
            {userInfo.teams.map((v) => (
              <Box key={v.teamId}>
                <Button
                  id={`btn-team-${kebabCase(v.teamName)}`}
                  variant="text"
                  textStyle="neutral"
                  label={v.teamName}
                  size="sm"
                  onPress={handleSelectTeam(v.teamId)}
                >
                  {currentTeam.teamName === v.teamName && (
                    <Button.LeadingIcon color={token('colors.brand.base')}>
                      <IcoCheckmark />
                    </Button.LeadingIcon>
                  )}
                </Button>
              </Box>
            ))}
          </Stack>
          <Divider my={2} color="neutral.tertiary" />
          <Button id="btn-manage-team" variant="text" size="sm" label="Manage team" onPress={handleManageTeam} />
        </Animate>
      </Popover.Content>
    </Popover>
  );
};
