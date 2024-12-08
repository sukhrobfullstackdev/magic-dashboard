'use client';

import { useMagicLDFlags } from '@components/contexts/launch-darkly-provider';
import { useCreateNewAppModal } from '@components/partials/create-new-app-modal/create-new-app-modal';
import { Dropdown } from '@components/presentation/dropdown';
import { AUTH_APP, EMBEDDED_APP, PASSPORT_APP } from '@constants/appInfo';
import { useAllApps } from '@hooks/common/use-all-apps';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { useTeamInfoSuspenseQuery } from '@hooks/data/teams';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { App } from '@hooks/data/user/types';
import { Button, IcoArrowRight, IcoCaretDown, IcoCheckmark, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Center, Divider, HStack, Stack } from '@styled/jsx';
import { hstack } from '@styled/patterns';
import { token } from '@styled/tokens';
import { compareAsc } from 'date-fns';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { kebabCase } from 'tiny-case';

const chevronVariants = {
  close: {
    rotate: 0,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
  open: {
    rotate: 180,
    y: 2,
    transition: {
      duration: 0.3,
    },
  },
};

const renderAppLogo = (app: App, size: 'sm' | 'lg') => {
  const imageSize = size === 'sm' ? 24 : 32;
  return (
    <img src={app.appLogoUrl} alt="logo" width={imageSize} height={imageSize} className={css({ rounded: 'sm' })} />
  );
};

const renderAppItem = (app: App, handleClickApp: (appId: string) => void, currentApp?: App) => {
  const isSelected = currentApp?.appId === app.appId;
  return (
    <li key={app.appId}>
      <HStack
        id={`app-nav-${kebabCase(app.appName)}`}
        w="full"
        cursor="pointer"
        justifyContent="space-between"
        px={4}
        py={2}
        h={12}
        _hover={{ bg: 'neutral.quaternary' }}
        onClick={() => handleClickApp(app.appId)}
      >
        <HStack gap={3}>
          {renderAppLogo(app, 'sm')}
          <Box maxW={isSelected ? '9rem' : '11.75rem'}>
            <Text size="sm" fontWeight="medium" truncate>
              {app.appName}
            </Text>
          </Box>
        </HStack>
        {isSelected && <IcoCheckmark color={token('colors.brand.base')} width={16} height={16} />}
      </HStack>
    </li>
  );
};

export const AppDropdown = () => {
  const router = useRouter();
  const open = useCreateNewAppModal((state) => state.open);
  const { isAvailableForPassportDevnet } = useMagicLDFlags();
  const { allApps, passportApps, dedicatedApps, universalApps } = useAllApps();
  const DEDICATED_APP = isAvailableForPassportDevnet ? EMBEDDED_APP : AUTH_APP;

  const mostRecentlyCreatedAppType = useMemo(() => {
    const newestPassportApp = passportApps.reduce(
      (newest, app) => {
        return (Number(newest.createdAt) ?? 0) > (Number(app.createdAt) ?? 0) ? newest : app;
      },
      { createdAt: 0 } as App,
    );
    const newestDedicatedApp = dedicatedApps.reduce(
      (newest, app) => {
        return (newest.createdAt ? new Date(newest.createdAt) : new Date(0)) >
          (app.createdAt ? new Date(app.createdAt) : new Date(0))
          ? newest
          : app;
      },
      { createdAt: 0 } as App,
    );

    const passportAppDate = newestPassportApp.createdAt ? Number(newestPassportApp.createdAt) * 1000 : new Date(0);
    const dedicatedAppDate = newestDedicatedApp.createdAt ? new Date(newestDedicatedApp.createdAt + 'Z') : new Date(0);

    const res = compareAsc(passportAppDate, dedicatedAppDate);
    return res > 0 ? PASSPORT_APP : DEDICATED_APP;
  }, [passportApps.length, dedicatedApps.length]);

  const [isOpened, setIsOpened] = useState(false);
  const [showGradient, setShowGradient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { currentApp } = useCurrentApp();
  const { currentTeamId } = useCurrentTeam();
  const { data: teamInfo } = useTeamInfoSuspenseQuery(teamQueryKeys.info({ teamId: currentTeamId }));

  useEffect(() => {
    const element = containerRef.current;
    const checkOverflow = () => {
      if (element) {
        const hasOverflow = element.scrollHeight > element.clientHeight;
        setShowGradient(hasOverflow);
      }
    };

    const handleScroll = () => {
      if (element) {
        const isScrolledToBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
        setShowGradient(!isScrolledToBottom);
      }
    };

    checkOverflow();
    element?.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkOverflow);

    return () => {
      element?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [isOpened]);

  const handleClickNewApp = useCallback(() => {
    setIsOpened(false);
    open(mostRecentlyCreatedAppType);
  }, [open, mostRecentlyCreatedAppType]);

  const handleClickApp = useCallback(
    (appId: string) => {
      setIsOpened(false);
      router.push(`/app?cid=${appId}`);
    },
    [router],
  );

  const handleClickAllApps = useCallback(() => {
    setIsOpened(false);
    router.push('/app/all_apps/');
  }, [router]);

  return (
    <>
      <Dropdown
        opened={isOpened}
        setOpened={setIsOpened}
        paddingType="none"
        button={
          <HStack gap={2} cursor="pointer">
            {currentApp ? (
              <HStack gap={3}>
                {renderAppLogo(currentApp, 'lg')}
                <Stack gap={1}>
                  <HStack gap={3}>
                    <Box maxW="7.5rem">
                      <Text truncate fontWeight="medium">
                        {currentApp.appName}
                      </Text>
                    </Box>
                    <motion.div initial="close" animate={isOpened ? 'open' : 'close'} variants={chevronVariants}>
                      <IcoCaretDown width={16} height={16} color={token('colors.text.secondary')} />
                    </motion.div>
                  </HStack>
                </Stack>
              </HStack>
            ) : (
              <>
                <Text fontWeight="medium">All Apps</Text>
                <motion.div initial="close" animate={isOpened ? 'open' : 'close'} variants={chevronVariants}>
                  <IcoCaretDown width={16} height={16} color={token('colors.text.secondary')} />
                </motion.div>
              </>
            )}
          </HStack>
        }
      >
        <Stack gap={0} maxH="26rem">
          <Stack
            w="17.5rem"
            h="fit-content"
            maxH="24.75rem"
            overflowY="auto"
            overflowX="hidden"
            ml="-16px"
            pl={4}
            scrollbarWidth="thin"
            position="relative"
            ref={containerRef}
          >
            <ul>
              <li>
                <button
                  id="all-apps-btn"
                  onClick={handleClickAllApps}
                  className={hstack({
                    py: '18px',
                    px: 4,
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    w: 'full',
                    _hover: { bg: 'neutral.quaternary' },
                  })}
                >
                  <Text size="sm" fontWeight="medium">
                    All Apps
                  </Text>
                  <IcoArrowRight width={16} height={16} color={token('colors.brand.base')} />
                </button>
              </li>
              <Divider mb={2} color="neutral.tertiary" />

              {isAvailableForPassportDevnet && passportApps.length > 0 && (
                <>
                  <HStack pl={4} h={6}>
                    <Text
                      fontWeight="semibold"
                      fontColor="text.tertiary"
                      styles={{ fontSize: '10px', letterSpacing: '0.5px' }}
                    >
                      PASSPORT WALLET
                    </Text>
                  </HStack>

                  {passportApps.map((v) => renderAppItem(v, handleClickApp, currentApp))}
                </>
              )}

              {(teamInfo.isConnectAppEnabled || isAvailableForPassportDevnet) && dedicatedApps.length > 0 && (
                <HStack pl={4} h={6}>
                  <Text
                    fontWeight="semibold"
                    fontColor="text.tertiary"
                    styles={{ fontSize: '10px', letterSpacing: '0.5px' }}
                  >
                    DEDICATED WALLET
                  </Text>
                </HStack>
              )}
              {dedicatedApps.map((v) => renderAppItem(v, handleClickApp, currentApp))}

              {teamInfo.isConnectAppEnabled && universalApps.length > 0 && (
                <>
                  <HStack pl={4} h={6}>
                    <Text
                      fontWeight="semibold"
                      fontColor="text.tertiary"
                      styles={{ fontSize: '10px', letterSpacing: '0.5px' }}
                    >
                      UNIVERSAL WALLET
                    </Text>
                  </HStack>
                  {universalApps.map((v) => renderAppItem(v, handleClickApp, currentApp))}
                </>
              )}

              {allApps.length === 0 && (
                <Center h="4.5rem">
                  <Text size="xs" fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
                    No apps. Create one to get started.
                  </Text>
                </Center>
              )}
            </ul>
          </Stack>
          <Stack px={4} gap={0} w="full" position="relative">
            {showGradient && (
              <Box
                h={12}
                w="16rem"
                background="linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.80) 80%)"
                pointerEvents="none"
                position="absolute"
                left={0}
                top={-12}
              />
            )}
            <Box bg="surface.primary" py={3}>
              <Button
                id="btn-new-app"
                size="sm"
                expand
                variant="secondary"
                label="Create New App"
                onPress={handleClickNewApp}
              />
            </Box>
          </Stack>
        </Stack>
      </Dropdown>
    </>
  );
};
