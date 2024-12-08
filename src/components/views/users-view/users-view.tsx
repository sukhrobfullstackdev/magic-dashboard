'use client';

import { useExportUsers } from '@components/hooks/use-export-users';
import { DisableMfaModal } from '@components/views/users-view/disable-mfa-modal';
import { ExportCsvButton } from '@components/views/users-view/export-csv-button';
import { SearchedUsersTable } from '@components/views/users-view/searched-users-table';
import { UsersPagination } from '@components/views/users-view/users-pagination';
import { PLAN_NAMES } from '@constants/pricing';
import { useCurrentApp } from '@hooks/common/use-current-app';
import { usePlan } from '@hooks/common/use-plan';
import { useSignupAppUsersSuspenseQuery } from '@hooks/data/app-users';
import { appUsersQueryKey } from '@hooks/data/app-users/keys';
import { type App } from '@hooks/data/user/types';
import { isDedicatedApp } from '@libs/is-dedicated-app';
import { Card, IcoDismiss, IcoSearch, LoadingSpinner, Text, TextInput } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Center, HStack, Stack } from '@styled/jsx';
import { useDebounce } from '@uidotdev/usehooks';
import { Suspense, useEffect, useMemo, useState } from 'react';

const Resolved = ({ app }: { app: App }) => {
  const {
    plan: { planName },
  } = usePlan({
    teamId: app.teamId,
  });
  const { data } = useSignupAppUsersSuspenseQuery(appUsersQueryKey.signups({ appId: app.appId }));

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [usersCount, setUsersCount] = useState(0);
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 1000);

  const { exportUsers } = useExportUsers();

  useEffect(() => {
    if (usersCount !== data.count) {
      setUsersCount(data.count);
    }
  }, [usersCount, data.count]);

  const isExportEnabled = useMemo(() => {
    return app.isOwner && planName !== PLAN_NAMES.FREE && isDedicatedApp(app.appType);
  }, [app, planName]);

  return (
    <Stack gap={6}>
      <DisableMfaModal appId={app.appId} />

      <HStack justifyContent="space-between" alignItems="start">
        <Stack>
          <Text.H3>Users</Text.H3>
          <Text fontColor="text.tertiary">{usersCount} users total</Text>
        </Stack>
        {isExportEnabled && (
          <ExportCsvButton
            onClick={() =>
              exportUsers({
                appId: app.appId,
                teamId: app.teamId,
              })
            }
          />
        )}
      </HStack>
      <Card expand className={css({ p: 8 })}>
        {/* search bar */}

        <TextInput
          placeholder="Search"
          aria-label="search users"
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
        >
          <TextInput.TypeIcon>
            <IcoSearch />
          </TextInput.TypeIcon>
          {!!searchQuery && (
            <TextInput.ActionIcon onClick={() => setSearchQuery('')}>
              <IcoDismiss />
            </TextInput.ActionIcon>
          )}
        </TextInput>

        {/* users table */}
        <Suspense
          fallback={
            <Center pt={10}>
              <LoadingSpinner />
            </Center>
          }
        >
          {debouncedSearchQuery.length < 3 ? (
            <UsersPagination appId={app.appId} appType={app.appType} />
          ) : (
            <SearchedUsersTable appId={app.appId} appType={app.appType} keyword={debouncedSearchQuery} />
          )}
        </Suspense>
      </Card>
    </Stack>
  );
};

export const UsersView = () => {
  const { currentApp } = useCurrentApp();

  return <Box p={6}>{currentApp ? <Resolved app={currentApp} /> : null}</Box>;
};
