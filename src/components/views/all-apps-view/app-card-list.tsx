import { useMagicLDFlags } from '@components/contexts/launch-darkly-provider';
import { useCreateNewAppModal } from '@components/partials/create-new-app-modal/create-new-app-modal';
import { AppCard } from '@components/views/all-apps-view/app-card';
import NewAppCard from '@components/views/all-apps-view/new-app-card';
import { APP_LABEL, AppType, AUTH_APP, CONNECT_APP, EMBEDDED_APP, PASSPORT_APP } from '@constants/appInfo';
import { useAllApps } from '@hooks/common/use-all-apps';
import { useCurrentTeam } from '@hooks/common/use-current-team';
import { useTeamInfoSuspenseQuery } from '@hooks/data/teams';
import { teamQueryKeys } from '@hooks/data/teams/keys';
import { Text } from '@magiclabs/ui-components';
import { HStack, Stack } from '@styled/jsx';
import { Suspense, useCallback } from 'react';
import Skeleton from 'react-loading-skeleton';

const Fallback = () => {
  return (
    <HStack flexWrap="wrap" gap={6}>
      <Skeleton height={172} width={172} borderRadius="1rem" />
      <Skeleton height={172} width={172} borderRadius="1rem" />
      <Skeleton height={172} width={172} borderRadius="1rem" />
    </HStack>
  );
};

const Resolved = () => {
  const { isAvailableForPassportDevnet } = useMagicLDFlags();
  const { passportApps, universalApps, dedicatedApps } = useAllApps();
  const { currentTeamId } = useCurrentTeam();
  const { data: teamInfo } = useTeamInfoSuspenseQuery(teamQueryKeys.info({ teamId: currentTeamId }));
  const DEDICATED_APP = isAvailableForPassportDevnet ? EMBEDDED_APP : AUTH_APP;

  const { open } = useCreateNewAppModal();

  const handleClickNewApp = useCallback(
    (appType: AppType) => () => {
      open(appType);
    },
    [open],
  );

  return (
    <HStack flexWrap="wrap" gap={6}>
      <Stack gap={8}>
        {isAvailableForPassportDevnet && (
          <Stack gap={4}>
            <Text size="sm" fontWeight="semibold" fontColor="text.tertiary">
              {APP_LABEL[PASSPORT_APP].long}
            </Text>
            <HStack flexWrap="wrap" gap={6}>
              {passportApps.map((app) => (
                <AppCard key={app.appId} app={app} />
              ))}
              <NewAppCard onClick={handleClickNewApp(PASSPORT_APP)} />
            </HStack>
          </Stack>
        )}

        <Stack gap={4}>
          {(isAvailableForPassportDevnet || teamInfo.isConnectAppEnabled) && (
            <Text size="sm" fontWeight="semibold" fontColor="text.tertiary">
              {APP_LABEL[AUTH_APP].long}
            </Text>
          )}
          <HStack flexWrap="wrap" gap={6}>
            {dedicatedApps.map((app) => (
              <AppCard key={app.appId} app={app} />
            ))}
            <NewAppCard onClick={handleClickNewApp(DEDICATED_APP)} />
          </HStack>
        </Stack>

        {teamInfo.isConnectAppEnabled && universalApps.length > 0 && (
          <Stack gap={4}>
            <Text size="sm" fontWeight="semibold" fontColor="text.tertiary">
              {APP_LABEL[CONNECT_APP].long}
            </Text>
            <HStack flexWrap="wrap" gap={6}>
              {universalApps.map((app) => (
                <AppCard key={app.appId} app={app} />
              ))}
            </HStack>
          </Stack>
        )}
      </Stack>
    </HStack>
  );
};

export const AppCardList = () => {
  return (
    <Suspense fallback={<Fallback />}>
      <Resolved />
    </Suspense>
  );
};
