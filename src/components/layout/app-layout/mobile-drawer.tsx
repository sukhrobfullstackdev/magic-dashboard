'use client';

import { AppDropdown } from '@components/layout/app-layout/app-dropdown';
import { AppSideNav } from '@components/layout/app-layout/app-side-nav';
import { TeamsDropdown } from '@components/layout/app-layout/teams-dropdown';
import { Drawer } from '@components/presentation/drawer/drawer';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { Button, IcoDismiss, IcoMenu } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Divider, HStack } from '@styled/jsx';
import { useState } from 'react';

export const MobileDrawer = () => {
  const { currentApp } = useCurrentApp();
  const [isOpened, setIsOpened] = useState(false);

  return (
    <Drawer
      className={css({ display: 'none', mdDown: { display: 'flex' } })}
      opened={isOpened}
      setOpened={setIsOpened}
      buttonIcon={<IcoMenu />}
    >
      <Box w="16.25rem" zIndex={10}>
        <HStack px={5} gap={2} h={14}>
          <Button variant="neutral" size="sm" onPress={() => setIsOpened(false)}>
            <Button.LeadingIcon>
              <IcoDismiss />
            </Button.LeadingIcon>
          </Button>
          <TeamsDropdown />
        </HStack>
        <Divider color="neutral.tertiary" />
        <HStack w="full" h="4.75rem" px={6} boxSizing="border-box">
          <AppDropdown />
        </HStack>
        <Divider color="neutral.tertiary" />
        {currentApp && <AppSideNav />}
      </Box>
    </Drawer>
  );
};
